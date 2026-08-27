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
      description: true,
      email: true,
      latitude: true,
      longitude: true,
    },
  });

  const clientMap = new Map(
    pendingClients.map((client) => [
      client.client_code,
      {
        generator_user_code: client.generator_user_code,
        status_id: client.status_id,
        description: client.description,
        email: client.email,
        latitude: client.latitude,
        longitude: client.longitude,
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
        first_name: true,
        last_name: true,
        region: true,
        address: true,
        latitude: true,
        longitude: true,
      },
      orderBy,
      skip,
      take,
    }),
  ]);

  // ---------------------------------------------------------
  // Get DB client region
  // ---------------------------------------------------------

  const clientRegions = await prisma.client_address.findMany({
    where: {
      client_code: {
        in: clients.map((client) => client.client_code),
      },
    },
    select: {
      client_code: true,
      address_code: true,
    },
  });

  const regionMap = new Map(
    clientRegions.map((address) => [address.client_code, address.address_code]),
  );

  // ---------------------------------------------------------
  // Get DB client phone
  // property_id = 1
  // ---------------------------------------------------------

  const clientPhones = await prisma.client_property.findMany({
    where: {
      client_code: {
        in: clients.map((client) => client.client_code),
      },
      property_id: 1,
    },
    select: {
      client_code: true,
      description: true,
    },
  });

  const phoneMap = new Map(
    clientPhones.map((property) => [
      property.client_code,
      property.description,
    ]),
  );

  // ---------------------------------------------------------
  // Get DB client address
  // property_id = 2
  // ---------------------------------------------------------

  const clientAddresses = await prisma.client_property.findMany({
    where: {
      client_code: {
        in: clients.map((client) => client.client_code),
      },
      property_id: 2,
    },
    select: {
      client_code: true,
      description: true,
    },
  });

  const addressMap = new Map(
    clientAddresses.map((property) => [
      property.client_code,
      property.description,
    ]),
  );

  // ---------------------------------------------------------
  // Return
  // ---------------------------------------------------------

  return {
    data: clients.map((client) => {
      const clientInfo = clientMap.get(client.client_code);

      return {
        client_code: client.client_code,
        name: client.description,
        request_date: client.last_edited,

        created_by: clientInfo?.generator_user_code ?? null,
        status_id: clientInfo?.status_id ?? null,

        email: client.email,
        phone_number: client.phone_number,
        moh_number: client.moh_number,
        first_name: client.first_name,
        last_name: client.last_name,
        region: client.region,
        address: client.address,
        latitude: client.latitude,
        longitude: client.longitude,

        // DB client information
        db_name: clientInfo?.description ?? null,
        db_email: clientInfo?.email ?? null,
        db_longitude: clientInfo?.longitude ?? null,
        db_latitude: clientInfo?.latitude ?? null,
        db_region: regionMap.get(client.client_code) ?? null,
        db_phone_number: phoneMap.get(client.client_code) ?? null,
        db_address: addressMap.get(client.client_code) ?? null,
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
        first_name: true,
        last_name: true,
        latitude: true,
        longitude: true,
        region: true,
        address: true,
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
        ...(pendingClient.latitude != null && {
          latitude: pendingClient.latitude,
        }),
        ...(pendingClient.longitude != null && {
          longitude: pendingClient.longitude,
        }),
      },
    });

    // Update phone number
    const clientPhone = await tx.client_property.findFirst({
      where: {
        client_code: clientCode,
        property_id: 1,
      },
    });
    if (clientPhone) {
      await tx.client_property.updateMany({
        where: {
          client_code: clientCode,
          property_id: 1,
        },
        data: {
          description: pendingClient.phone_number,
          alt_description: pendingClient.phone_number,
        },
      });
    } else {
      await tx.client_property.create({
        data: {
          client_code: clientCode,
          property_id: 1,
          description: pendingClient.phone_number,
          alt_description: pendingClient.phone_number,
        },
      });
    }

    // Update address
    const clientAddress = await tx.client_property.findFirst({
      where: {
        client_code: clientCode,
        property_id: 2,
      },
    });
    if (clientAddress) {
      await tx.client_property.updateMany({
        where: {
          client_code: clientCode,
          property_id: 2,
        },
        data: {
          description: pendingClient.address,
          alt_description: pendingClient.address,
        },
      });
    } else {
      await tx.client_property.create({
        data: {
          client_code: clientCode,
          property_id: 2,
          description: pendingClient.address,
          alt_description: pendingClient.address,
        },
      });
    }

    //update region
    const clientRegion = await tx.client_address.findFirst({
      where: {
        client_code: clientCode,
      },
      select: {
        client_address_id: true,
      },
    });

    if (clientRegion) {
      await tx.client_address.update({
        where: {
          client_address_id: clientRegion.client_address_id,
        },
        data: {
          ...(pendingClient.region != null && {
            address_code: pendingClient.region,
          }),
        },
      });
    }

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
          first_name: pendingClient.first_name,
          last_name: pendingClient.last_name,
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
          first_name: pendingClient.first_name,
          last_name: pendingClient.last_name,
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
