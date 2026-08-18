import { useCompanyStore } from "@/stores/CompanyStore";
import { useShallow } from "zustand/react/shallow";

export const useCompanyAssets = () => {
  return useCompanyStore(
    useShallow((state) => {
      const company = state.getCompanyConfig();

      return {
        companyHydrated: state.hydrated,
        companyDisabled: state.companyDisabled,
        companyId: state.hydrated ? company.id : "",
        companyName: state.hydrated ? company.name : "",
        companyAbreviation: state.hydrated ? company.abreviation : "",
        companyLogo: state.hydrated ? company.logo : "",
        companyPlaceholder: state.hydrated
          ? company.placeholder
          : "/assets/img/global/placeholder.png",
        companyFavicon: state.hydrated ? company.favicon : "",
        companyAbout: state.hydrated ? company.about : "",
        companyDescription: state.hydrated
          ? company.transalations.description
          : "place_holder",
        companyCopyright: state.hydrated
          ? company.transalations.copyright
          : "place_holder",
        companyFacebook: state.hydrated ? company.social.facebook : "#",
        companyLinkedin: state.hydrated ? company.social.linkedin : "#",
        companyInstagram: state.hydrated ? company.social.instagram : "#",
      };
    }),
  );
};
