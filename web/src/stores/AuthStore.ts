import { useAccountStore } from "./AccountStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login, logout } from "../utils/apiCalls";
import { useCompanyStore } from "./CompanyStore";
import { CompanyId } from "@/utils/configCompanies";

type AuthStore = {
  token: string | null;
  isAuth: boolean;

  login: ({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isAuth: false,
      login: async ({ userId, password }) => {
        const result = await login({ userId: userId, password }).then((res) => {
          set({
            isAuth: true,
            token: res.data.result.token,
          });
          useAccountStore.setState({
            status: res.data.result.status,
          });
          return res;
        });

        return result;
      },
      logout: async () => {
        // Logout user code
        set({ isAuth: false, token: null });

        // reset company
        if (useCompanyStore.getState().companyDisabled) {
          useCompanyStore.setState({
            companyId: process.env.NEXT_PUBLIC_DEFAULT_COMPANY as CompanyId,
            companyDisabled: false,
          });
          document.cookie = `companyId=${process.env.NEXT_PUBLIC_DEFAULT_COMPANY}; path=/; max-age=31536000; SameSite=Lax`;
        }

        try {
          await logout();
        } catch (err) {
          console.log(err);
        }
      },
    }),
    {
      name: "authCustomerPortalAdminApp",
    },
  ),
);
