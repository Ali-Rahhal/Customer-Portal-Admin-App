import { serve } from "@hono/node-server";
import { Hono } from "hono";
import tokenAuth from "./lib/tokenAuth";
import { cors } from "hono/cors";
import { getCookie } from "hono/cookie";
import { compress } from "hono/compress";

import authPrivateRoutes from "./routes/private/auth.routes";
import authPublicRoutes from "./routes/public/auth.routes";
import clientPrivateRoutes from "./routes/private/client.routes";

//@ts-expect-error weird toJSON error
BigInt.prototype.toJSON = function () {
  return this.toString();
};
const PUBLIC_API = "/api";
const PRIVATE_API = "/api/auth";
const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: [
      ////quayo du server:
      "http://159.195.23.130:5012",
      "http://localhost:5012",
    ],
    credentials: true,
    maxAge: 600,
  }),
);

async function authMiddleware(c: any, next: any) {
  const token = getCookie(c, "auth");

  if (!token) return c.json({ message: "Not Authorized", result: null }, 401);
  const userId = await tokenAuth(token);
  if (!userId) return c.json({ message: "Invalid token", result: null }, 401);
  c.req.user_id = userId;
  await next();
}

app.use("*", compress());
app.use(`${PRIVATE_API}/*`, authMiddleware);

app.route(`${PUBLIC_API}`, authPublicRoutes);

app.route(`${PRIVATE_API}`, authPrivateRoutes);
app.route(`${PRIVATE_API}/client`, clientPrivateRoutes);

const port = Number(process.env.PORT) || 5011;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
