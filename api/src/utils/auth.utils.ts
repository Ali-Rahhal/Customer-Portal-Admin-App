import { Context } from "hono";
import tokenAuth from "../lib/tokenAuth";
import { getCookie } from "hono/cookie";

export async function getUserId(c: any) {
  const userId = c.req.user_id;
  return userId;
}
export async function getUserIdFromToken(c: Context) {
  const token = getCookie(c, "authCustomerPortalAdminApp");
  if (!token) throw new Error("No token provided");
  const userId = await tokenAuth(token);
  return userId;
}
