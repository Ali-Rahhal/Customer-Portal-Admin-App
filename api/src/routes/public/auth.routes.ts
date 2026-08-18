import { Hono } from "hono";
import { login } from "../../controllers/AuthController";
import { getUserId } from "../../utils/auth.utils";
import { serialize } from "hono/utils/cookie";
const router = new Hono();

router.post(`/login`, async (c) => {
  try {
    const body = await c.req.json();

    const userId = body["userId"].toString();
    const password = body["password"];

    if (!userId || !password)
      throw new Error("usercode or password not provided");
    const result = await login({ userId, password }, c);
    return result;
    // return c.json({ message: "Login success", result: result });
  } catch (e: any) {
    const serialized = serialize("auth", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return c.json({ message: e.message, result: null }, 401, {
      "Set-Cookie": serialized,
    });
  }
});

router.post(`/logout`, async (c) => {
  try {
    const userId = await getUserId(c);
    const serialized = serialize("auth", "", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return c.json({ message: "Logout success", result: [] }, 200, {
      "Set-Cookie": serialized,
    });
  } catch (e: any) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

// router.post("/register", async (c) => {
//   try {
//     const companyId = String(
//       c.get("companyId") ?? process.env.DEFAULT_COMPANY ?? "",
//     );

//     const body = await c.req.json();

//     const { client_code, moh_number, phone_number, email, description } = body;

//     if (!client_code) {
//       throw new Error("Client code not provided");
//     }
//     if (!moh_number) {
//       throw new Error("MOH number not provided");
//     }
//     if (!phone_number) {
//       throw new Error("Phone number not provided");
//     }
//     if (!email) {
//       throw new Error("Email not provided");
//     }
//     if (!description) {
//       throw new Error("Name not provided");
//     }

//     const result = await register(companyId, {
//       client_code,
//       moh_number,
//       phone_number,
//       email,
//       description,
//     });

//     return c.json({
//       message: result.message,
//       result,
//     });
//   } catch (e: any) {
//     return c.json(
//       {
//         message: e?.message ?? "Registration failed",
//         result: null,
//       },
//       400,
//     );
//   }
// });

// router.post(`/send_verify_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];

//     if (!email) throw new Error("email or code not provided");
//     const result = await sendVerify(email, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 402);
//   }
// });
// router.post(`/send_reset_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];

//     if (!email) throw new Error("email or code not provided");
//     const result = await forgotPassword(email, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });

// router.post(`/validate_reset_code`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const key = body["key"];

//     if (!key) throw new Error("code not provided");
//     const result = await validateResetCode(key, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 400);
//   }
// });
// router.post(`/change_password_forgot`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const newPassword = body["new_password"];
//     const confirmedPassword = body["confirmed_password"];
//     const key = body["key"];

//     if (!newPassword || !confirmedPassword || !key)
//       throw new Error("email or code not provided");
//     const result = await changePasswordReset(
//       newPassword,
//       confirmedPassword,
//       key,
//       c
//     );
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
// router.post(`/verify_email`, async (c) => {
//   try {
//     const body = await c.req.json();

//     const email = body["email"];
//     const key = body["key"];

//     if (!email || !key) throw new Error("email or code not provided");
//     const result = await verifyEmail(email, key, c);
//     return result;
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });

export default router;
