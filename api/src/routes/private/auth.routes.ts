import { Hono } from "hono";
import {
  getUserDetails,
  changePassword,
} from "../../controllers/AuthController";
import { getUserId } from "../../utils/auth.utils";
const router = new Hono();

router.get(`/user`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = "";
    return c.json({ message: "Get user success", result: result }, 200);
  } catch (e: any) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

router.get(`/user_details`, async (c) => {
  try {
    const userId = await getUserId(c);
    const result = await getUserDetails(userId);
    return c.json({ message: "Get user success", result: result }, 200);
  } catch (e: any) {
    return c.json({ message: e.message, result: null }, 400);
  }
});

// router.post(`/update_user_detail`, async (c) => {
//   try {
//     const userId = await getUserId(c);
//     const { first_name, last_name, phone_number, address } = await c.req.json();
//     const result = await updateUserDetails({
//       userId: userId,
//       first_name: first_name,
//       last_name: last_name,
//       phone: phone_number,
//       address: address,
//     });
//     return c.json({ message: "Get user success", result: result }, 200);
//   } catch (e) {
//     return c.json({ message: e.message, result: null }, 401);
//   }
// });
router.post(`/change_password`, async (c) => {
  try {
    const userId = await getUserId(c);
    const { old_password, new_password, confirmed_password } =
      await c.req.json();
    const result = await changePassword({
      userId: userId,
      oldPassword: old_password,
      newPassword: new_password,
      confirmedPassword: confirmed_password,
    });
    return c.json({ message: "Password changed", result: result }, 200);
  } catch (e: any) {
    return c.json({ message: e.message, result: null }, 401);
  }
});

export default router;
