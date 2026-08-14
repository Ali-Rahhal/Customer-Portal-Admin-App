import { prisma } from "../lib/prisma";
import * as jwt from "jsonwebtoken";
const tokenAuth = async (Bearertoken: string) => {
  try {
    const payload: any = jwt.verify(
      Bearertoken,
      process.env.JWT_SECRET as string,
    );

    const user = await prisma.web_accounts.findFirst({
      where: {
        id: payload.userId,
      },
    });
    if (!user) throw new Error("User not found");
    return user.id;
  } catch (e) {
    return null;
  }
};
export default tokenAuth;
