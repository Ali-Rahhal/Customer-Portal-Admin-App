import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Companies, CompanyId, CompanyConfig } from "@/utils/configCompanies";

type CompanyStore = {
  hydrated: boolean;
  companyDisabled: boolean;

  companyId: CompanyId;

  setCompany: (companyId: CompanyId) => void;

  setHydrated: (v: boolean) => void;

  getCompanyConfig: () => CompanyConfig;
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      companyDisabled: false,

      companyId: (process.env.NEXT_PUBLIC_DEFAULT_COMPANY || "DU") as CompanyId,

      setCompany: (companyId) => {
        set({ companyId });
      },

      setHydrated: (v) => set({ hydrated: v }),

      getCompanyConfig: () => {
        const state = get();

        return Companies[state.companyId];
      },
    }),
    {
      name: "company",
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const company = Companies[state.companyId];

        if (!company || !company.enabled) {
          state.companyDisabled = true;
        }

        state?.setHydrated(true);
      },
    },
  ),
);
