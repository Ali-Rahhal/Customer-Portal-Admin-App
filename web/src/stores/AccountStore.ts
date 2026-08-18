import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserDetails } from "../utils/apiCalls";
import { useAuthStore } from "./AuthStore";

type AccountStore = {
  hydrated: boolean;

  name: string;
  code: string;
  email: string;
  //   phone: string;
  //   address: string;
  status: number | null;

  setHydrated: (v: boolean) => void;

  setAccount: (data: {
    name: string;
    code: string;
    email: string;
    // phone: string;
    // address: string;
    status: number | null;
  }) => void;

  refreshUserInfo: () => void;
};

export const useAccountStore = create<AccountStore>()(
  persist(
    (set, get) => ({
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      name: "",
      code: "",
      email: "",
      //   phone: "",
      //   address: "",
      status: null,

      refreshUserInfo: async () => {
        if (!useAuthStore.getState().isAuth) return;

        try {
          const res = await getUserDetails();

          set({
            name: res.data.result.description,
            code: res.data.result.user_code,
            email: res.data.result.email,
            // phone: res.data.result.phone,
            // address: res.data.result.address,
            status: res.data.result.status,
          });
        } catch (e) {
          useAuthStore.getState().logout();
          set({
            name: "",
            code: "",
            email: "",
            // phone: "",
            // address: "",
            status: null,
          });
        }
      },

      setAccount: ({ name, code, email, status }) =>
        set({ name, code, email, status }),
    }),
    {
      name: "account",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
