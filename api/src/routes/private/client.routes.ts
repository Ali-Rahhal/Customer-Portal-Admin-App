import { Hono } from "hono";
import {
  getPendingClients,
  rejectClient,
  acceptClient,
} from "../../controllers/ClientController";
import { getUserId } from "../../utils/auth.utils";
const router = new Hono();

router.get(`/get_pending_clients`, async (c) => {
  try {
    const take = Number(c.req.query("take")) || undefined;
    const skip = Number(c.req.query("skip")) || undefined;

    const search = c.req.query("search") ?? "";

    const result = await getPendingClients(take, skip, search);

    return c.json({
      message: "Fetched Pending Clients",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.patch(`/reject_client`, async (c) => {
  try {
    const userId = await getUserId(c);

    const body = await c.req.json();

    const clientCode = String(body.client_code ?? "").trim();

    if (!clientCode) {
      return c.json(
        {
          message: "Client code is required.",
          result: null,
        },
        400,
      );
    }

    const result = await rejectClient(clientCode, userId);

    return c.json({
      message: "Client rejected successfully.",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

router.patch(`/accept_client`, async (c) => {
  try {
    const userId = await getUserId(c);

    const body = await c.req.json();

    const clientCode = String(body.client_code ?? "").trim();

    if (!clientCode) {
      return c.json(
        {
          message: "Client code is required.",
          result: null,
        },
        400,
      );
    }

    const result = await acceptClient(clientCode, userId);

    return c.json({
      message: "Client accepted successfully.",
      result,
    });
  } catch (e: any) {
    return c.json(
      {
        message: e.message,
        result: null,
      },
      400,
    );
  }
});

export default router;
