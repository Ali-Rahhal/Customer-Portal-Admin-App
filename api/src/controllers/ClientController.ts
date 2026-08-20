import { prisma } from "../lib/prisma";

const getPendingClients = async (
  take = 20,
  skip = 0,
  search = "",
  sortBy = "last_edited",
  sortOrder: "asc" | "desc" = "desc",
) => {
  // 1. Fetch pending clients and their generator_user_code
  const pendingClients = await prisma.client.findMany({
    where: { status_id: 7 },
    select: {
      client_code: true,
      generator_user_code: true,
    },
  });

  // Map generator codes for O(1) lookup
  const userCodeMap = new Map(
    pendingClients.map((c) => [c.client_code, c.generator_user_code]),
  );

  const clientCodes = Array.from(userCodeMap.keys());

  const whereCondition = {
    client_code: {
      in: clientCodes,
    },
    ...(search && {
      OR: [
        { client_code: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  };

  // Dynamic orderBy object (handles both client_code and last_edited/description)
  const orderBy = {
    [sortBy]: sortOrder,
  };

  const [total, clients] = await Promise.all([
    prisma.client_pending.count({ where: whereCondition }),
    prisma.client_pending.findMany({
      where: whereCondition,
      select: {
        client_code: true,
        description: true,
        last_edited: true,
      },
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    data: clients.map((client) => ({
      client_code: client.client_code,
      name: client.description,
      request_date: client.last_edited,
      created_by: userCodeMap.get(client.client_code) ?? null,
    })),
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

  if (client.status_id !== 7) {
    throw new Error("Client cannot be rejected because it is not pending.");
  }

  const updatedClient = await prisma.client.update({
    where: {
      client_code: clientCode,
    },
    data: {
      status_id: 6,
      approver_user_code: userId,
    },
  });

  return updatedClient;
};

const acceptClient = async (clientCode: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
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

    if (client.status_id !== 7) {
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

    return updatedClient;
  });
};

export { getPendingClients, rejectClient, acceptClient };
