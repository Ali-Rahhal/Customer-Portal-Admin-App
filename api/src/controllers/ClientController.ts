import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { sendClientAcceptedEmail } from "../utils/sendClientAcceptedEmail";
import { sendClientRejectedEmail } from "../utils/sendClientRejectedEmail";

const getPendingClients = async (
  take = 20,
  skip = 0,
  search = "",
  sortBy = "last_edited",
  sortOrder: "asc" | "desc" = "desc",
  statusFilter: "all" | "known" | "unknown" = "all",
) => {
  // ---------------------------------------------------------
  // Client status filter
  // 7  = Known / Waiting Approval
  // 99 = Unknown / Newly Created
  // ---------------------------------------------------------

  const statusIds =
    statusFilter === "known"
      ? [7]
      : statusFilter === "unknown"
        ? [99]
        : [7, 99];

  const pendingClients = await prisma.client.findMany({
    where: {
      status_id: {
        in: statusIds,
      },
    },
    select: {
      client_code: true,
      generator_user_code: true,
      status_id: true,
    },
  });

  const clientMap = new Map(
    pendingClients.map((client) => [
      client.client_code,
      {
        generator_user_code: client.generator_user_code,
        status_id: client.status_id,
      },
    ]),
  );

  const clientCodes = pendingClients.map((client) => client.client_code);

  const whereCondition = {
    client_code: {
      in: clientCodes,
    },

    ...(search && {
      OR: [
        {
          client_code: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ],
    }),
  };

  const orderBy = {
    [sortBy]: sortOrder,
  };

  const [total, clients] = await Promise.all([
    prisma.client_pending.count({
      where: whereCondition,
    }),

    prisma.client_pending.findMany({
      where: whereCondition,

      select: {
        client_code: true,
        description: true,
        last_edited: true,
        email: true,
        phone_number: true,
        moh_number: true,
      },

      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    data: clients.map((client) => {
      const clientInfo = clientMap.get(client.client_code);

      const isUnknown = clientInfo?.status_id === 99;

      return {
        client_code: client.client_code,
        name: client.description,
        request_date: client.last_edited,
        created_by: clientInfo?.generator_user_code ?? null,

        status_id: clientInfo?.status_id ?? null,

        // Only expose these for unknown clients
        email: isUnknown ? client.email : null,
        phone_number: isUnknown ? client.phone_number : null,
        moh_number: isUnknown ? client.moh_number : null,
      };
    }),
    total,
  };
};

const rejectClient = async (clientCode: string, userId: string) => {
  const client = await prisma.client.findUnique({
    where: {
      client_code: clientCode,
    },
    select: {
      client_code: true,
      status_id: true,
    },
  });

  if (!client) {
    throw new Error("Client not found.");
  }

  if (client.status_id !== 7 && client.status_id !== 99) {
    throw new Error("Client cannot be rejected because it is not pending.");
  }

  const { email, moh_number } = await prisma.client_pending.findFirstOrThrow({
    where: {
      client_code: clientCode,
    },
    select: {
      email: true,
      moh_number: true,
    },
  });

  // Newly created clients are completely removed
  if (client.status_id === 99) {
    await prisma.$executeRaw`
      EXEC dbo.DELETE_PENDING_CLIENT
        @ClientCode = ${clientCode}
    `;

    await sendClientRejectedEmail(email ?? "", moh_number ?? "");

    return {
      client_code: clientCode,
      status_id: 6,
    };
  }

  // Existing pending clients are marked as rejected
  const updatedClient = await prisma.client.update({
    where: {
      client_code: clientCode,
    },
    data: {
      status_id: 6,
      approver_user_code: userId,
    },
  });

  await sendClientRejectedEmail(email ?? "", moh_number ?? "");

  return updatedClient;
};

const acceptClient = async (clientCode: string, userId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    // Check client
    const client = await tx.client.findUnique({
      where: {
        client_code: clientCode,
      },
      select: {
        client_code: true,
        status_id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found.");
    }

    if (client.status_id !== 7 && client.status_id !== 99) {
      throw new Error("Client cannot be accepted because it is not pending.");
    }

    // Get pending client data
    const pendingClient = await tx.client_pending.findFirst({
      where: {
        client_code: clientCode,
      },
      select: {
        description: true,
        phone_number: true,
        email: true,
      },
    });

    if (!pendingClient) {
      throw new Error("Pending client information not found.");
    }

    // Update client
    const updatedClient = await tx.client.update({
      where: {
        client_code: clientCode,
      },
      data: {
        description: pendingClient.description,
        email: pendingClient.email,
        status_id: 5,
        approver_user_code: userId,
        approval_date: new Date(),
      },
    });

    // Update phone number in client_property
    await tx.client_property.updateMany({
      where: {
        client_code: clientCode,
        property_id: 1,
      },
      data: {
        description: pendingClient.phone_number,
      },
    });

    // Check if web account already exists
    const webAccount = await tx.web_accounts.findFirst({
      where: {
        code: clientCode,
      },
    });

    if (webAccount) {
      // Update existing web account
      await tx.web_accounts.update({
        where: {
          id: webAccount.id,
        },
        data: {
          password: "noPasswordCurently",
          phone: pendingClient.phone_number,
          description: pendingClient.description,
        },
      });
    } else {
      // Get the largest web account ID
      const lastWebAccount = await tx.web_accounts.findFirst({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
        },
      });

      const newWebAccountId = (lastWebAccount?.id ?? 0) + 1;

      // Create new web account
      await tx.web_accounts.create({
        data: {
          id: newWebAccountId,
          code: clientCode,
          description: pendingClient.description,
          password: "noPasswordCurently",
          phone: pendingClient.phone_number,
          role: "USER",
        },
      });
    }

    // Create password setup token
    const setupToken = crypto.randomBytes(32).toString("hex");

    const setupTokenHash = crypto
      .createHash("sha256")
      .update(setupToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await tx.passwordSetupToken.updateMany({
      where: {
        code: clientCode,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await tx.passwordSetupToken.create({
      data: {
        code: clientCode,
        tokenHash: setupTokenHash,
        expiresAt,
      },
    });

    return {
      client: updatedClient,
      email: pendingClient.email ?? "",
      description: pendingClient.description,
      setupToken,
    };
  });

  await sendClientAcceptedEmail(result.email, clientCode, result.setupToken);

  return result.client;
};

export { getPendingClients, rejectClient, acceptClient };
