import { Context } from "hono";
import { prisma } from "../lib/prisma";
import { createHash } from "crypto";
import { serialize } from "hono/utils/cookie";
import jwt from "jsonwebtoken";

const login = async (
  {
    userId,
    password,
  }: {
    userId: string;
    password: string;
  },
  c: Context,
) => {
  const user = await prisma.user.findFirst({
    where: {
      user_code: userId,
    },
  });
  if (!user) {
    return c.json({ message: "User not found", result: null }, 401);
  }

  if (user.level_id !== 999) {
    return c.json(
      { message: "This account type is not allowed", result: null },
      401,
    );
  }

  var sha256 = createHash("sha256");
  sha256.update(password, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  if (user.password !== encryptedPass) {
    //  throw new Error("Password is incorrect");
    return c.json({ message: "Password is incorrect", result: null }, 401);
  }

  if (user.status !== 1) throw new Error("Account is not active");

  const userInfo = {
    name: user.description,
    code: user.user_code,
    email: user.email,
    // phone: user.phone,
    status: user.status,
  };

  const token = jwt.sign(
    {
      userId: user.user_code,
      description: user.description,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  const serialized = serialize("auth", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return c.json(
    {
      message: "Login success",
      result: { token, ...userInfo, expiration: -1 },
    },
    200,
    {
      "Set-Cookie": serialized,
    },
  );
};

const changePassword = async ({
  userId,
  oldPassword,
  newPassword,
  confirmedPassword,
}: {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmedPassword: string;
}) => {
  const user = await prisma.user.findFirst({
    where: {
      user_code: userId,
    },
  });
  if (!user) throw new Error("User not found");

  var sha256 = createHash("sha256");
  sha256.update(oldPassword, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  if (user.password !== encryptedPass)
    throw new Error("Old Password is incorrect");
  if (newPassword !== confirmedPassword)
    throw new Error("Password Not Matched");
  if (newPassword.length < 8)
    throw new Error("Password must be at least 8 characters");
  var sha256 = createHash("sha256");
  sha256.update(newPassword, "utf8"); //utf8 here
  var encryptedPass = sha256.digest("base64");
  const result = await prisma.user.update({
    where: {
      user_code: userId,
    },
    data: {
      password: encryptedPass,
    },
  });
  if (!result) throw new Error("Error Updating User");

  return result;
};

const getUserDetails = async (userId: string) => {
  const userInfo = await prisma.user.findFirst({
    where: {
      user_code: userId,
    },
    select: {
      user_code: true,
      description: true,
      email: true,
      //   phone: true,
      status: true,
      is_active: true,
      date_added: true,
      level_id: true,
    },
  });
  if (userInfo?.status !== 1) throw new Error("Account is not active");
  return {
    ...userInfo,
  };
};

export { login, changePassword, getUserDetails };
