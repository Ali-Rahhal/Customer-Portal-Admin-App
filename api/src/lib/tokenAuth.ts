import { prisma } from "../lib/prisma";
import jwt from "jsonwebtoken";
const tokenAuth = async (Bearertoken: string) => {
  try {
    const payload: any = jwt.verify(
      Bearertoken,
      process.env.JWT_SECRET as string,
    );

    const user = await prisma.user.findFirst({
      where: {
        user_code: payload.userId,
      },
    });
    if (!user) throw new Error("User not found");
    return user.user_code;
  } catch (e) {
    return null;
  }
};
export default tokenAuth;
