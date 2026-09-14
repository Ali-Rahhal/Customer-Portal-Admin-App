import type { Context, Next } from "hono";

import {
  checkLicense,
  type CompanyId,
  COMPANY_IDS,
} from "../utils/licenseService";

const isCompanyId = (value: string): value is CompanyId => {
  return COMPANY_IDS.includes(value as CompanyId);
};

export const licenseMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path;
  if (
    path.includes("login") ||
    path.includes("logout") ||
    path.includes("validate")
  ) {
    return next();
  }

  const companyIdValue = String(
    process.env.DEFAULT_COMPANY ?? "",
  ).toUpperCase();

  if (!isCompanyId(companyIdValue)) {
    return c.json(
      {
        message: `Unsupported company: ${companyIdValue || "undefined"}`,
        code: "LICENSE_EXPIRED",
        result: null,
      },
      400,
    );
  }

  const license = await checkLicense(companyIdValue);

  if (!license.valid) {
    return c.json(
      {
        message: license.message ?? "License expired",
        code: "LICENSE_EXPIRED",
        result: null,
      },
      license.message === "License expired" ? 401 : 403,
    );
  }

  await next();
};
