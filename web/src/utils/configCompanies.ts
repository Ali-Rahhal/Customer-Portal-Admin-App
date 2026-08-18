export interface CompanyConfig {
  enabled: boolean;
  id: string;
  name: string;
  abreviation: string;
  logo: string;
  placeholder: string;
  favicon: string;
  about: string;

  transalations: {
    description: string;
    copyright: string;
  };

  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };

  features: {
    survey: boolean;
    complaints: boolean;
    loyalty: boolean;
    expiryDeals: boolean;
  };
}

export const Companies = {
  DU: {
    enabled: true,
    id: "DU",
    name: "Droguerie de L'Union Pharmaceutical Company",
    abreviation: "DU",
    logo: "/assets/img/DU/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  UPO: {
    enabled: false,
    id: "UPO",
    name: "Union Pharmaceutique d'Orient",
    abreviation: "UPO",
    logo: "/assets/img/UPO/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  FDC: {
    enabled: false,
    id: "FDC",
    name: "Food & Drug Corporation",
    abreviation: "FDC",
    logo: "/assets/img/FDC/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  SADCO: {
    enabled: false,
    id: "SADCO",
    name: "Sami Dandan & Co.",
    abreviation: "SADCO",
    logo: "/assets/img/SADCO/logo.png",
    placeholder: "/assets/img/DU/product/PlaceholderImage.jpg",
    favicon: "/assets/img/DU/favicon.ico",
    about: "/assets/img/DU/extra/page-about.jpg",

    transalations: {
      description: "company.description_du",
      copyright: "company.copyright_du",
    },

    social: {
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: true,
      complaints: true,
      loyalty: false,
      expiryDeals: true,
    },
  },
  VI: {
    enabled: false,
    id: "VI",
    name: "Vitalait",
    abreviation: "Vitalait",
    logo: "/assets/img/VITALAIT/logo.png",
    placeholder: "/assets/img/VITALAIT/product/PlaceholderImage.jpg",
    favicon: "/assets/img/VITALAIT/favicon.ico",
    about: "/assets/img/VITALAIT/extra/page-about.jpg",

    transalations: {
      description: "company.description_vitalait",
      copyright: "company.copyright_vitalait",
    },

    social: {
      facebook: "/",
      instagram: "/",
      linkedin: "/",
    },

    features: {
      survey: false,
      complaints: false,
      loyalty: true,
      expiryDeals: true,
    },
  },
};

export type CompanyId = keyof typeof Companies;
