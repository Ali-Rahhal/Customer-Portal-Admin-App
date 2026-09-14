import axios from "axios";

export type CompanyId = "DU" | "SADCO" | "UPO" | "VI" | "FDC";

type LicenseResult = {
  valid: boolean;
  expiresAt: number;
  message?: string;
};

type CachedLicense = {
  expiresAt: number;
  checkedAt: number;
};

// 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

const licenseCache = new Map<CompanyId, CachedLicense>();

export const COMPANY_IDS: CompanyId[] = ["DU", "SADCO", "UPO", "VI", "FDC"];

export async function checkLicense(
  companyId: CompanyId,
): Promise<LicenseResult> {
  if (process.env.SKIP_ACTIVATION === "true") {
    return {
      valid: true,
      expiresAt: 0,
    };
  }

  const now = Date.now();
  const currentTimestamp = Math.floor(now / 1000);

  // ---------------------------------------------------------
  // Check cache
  // ---------------------------------------------------------

  const cached = licenseCache.get(companyId);

  if (cached) {
    const cacheStillValid = now - cached.checkedAt < CACHE_DURATION;

    const licenseStillValid = cached.expiresAt > currentTimestamp;

    if (cacheStillValid && licenseStillValid) {
      return {
        valid: true,
        expiresAt: cached.expiresAt,
      };
    }

    // Cache expired → remove it
    licenseCache.delete(companyId);
  }

  // ---------------------------------------------------------
  // Get activation configuration
  // ---------------------------------------------------------

  const config = {
    username: process.env.ACTIVATION_USERNAME,
    password: process.env.ACTIVATION_PASSWORD,
    serialNumber: process.env.ACTIVATION_SERIAL_NUMBER,
  };

  if (!config.username || !config.password || !config.serialNumber) {
    console.error(`Missing activation configuration for company: ${companyId}`);

    return {
      valid: false,
      expiresAt: 0,
      message: "License configuration is missing",
    };
  }

  if (!process.env.ACTIVATION_URL) {
    console.error("ACTIVATION_URL is not configured");

    return {
      valid: false,
      expiresAt: 0,
      message: "License configuration is missing",
    };
  }

  // ---------------------------------------------------------
  // Check license
  // ---------------------------------------------------------

  try {
    const response = await axios.post(
      `${process.env.ACTIVATION_URL}/check_licence`,
      {
        username: config.username,
        password: config.password,
        serial_number: config.serialNumber,
        package_name: process.env.ACTIVATION_PACKAGE_NAME,
        version: process.env.ACTIVATION_VERSION,
      },
      {
        timeout: 10_000,
      },
    );

    const data = response.data;

    const token = data?.result?.token;
    const expiryTimestamp = Number(data?.result?.expiry_timestamp);

    // -------------------------------------------------------
    // Invalid / expired license
    // -------------------------------------------------------

    if (!token || !expiryTimestamp || expiryTimestamp <= currentTimestamp) {
      return {
        valid: false,
        expiresAt: expiryTimestamp || 0,
        message: "License expired",
      };
    }

    // -------------------------------------------------------
    // Valid license → CACHE IT
    // -------------------------------------------------------

    licenseCache.set(companyId, {
      expiresAt: expiryTimestamp,
      checkedAt: now,
    });

    return {
      valid: true,
      expiresAt: expiryTimestamp,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ??
        error.message ??
        "License verification failed";

      console.error(
        `License check failed for ${companyId}:`,
        error.response?.data ?? error.message,
      );

      return {
        valid: false,
        expiresAt: 0,
        message,
      };
    }

    console.error(`License check failed for ${companyId}:`, error);

    return {
      valid: false,
      expiresAt: 0,
      message: "License verification failed",
    };
  }
}
