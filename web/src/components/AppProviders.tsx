"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

import { useAccountStore } from "@/stores/AccountStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";

import NavigationProgressBar from "@/components/NavigationProgressBar";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { refreshUserInfo } = useAccountStore();

  const { isAuth, logout } = useAuthStore();

  const { companyHydrated, companyDisabled, companyName, companyFavicon } =
    useCompanyAssets();

  // --------------------------------------------------
  // Company disabled check
  // --------------------------------------------------

  useEffect(() => {
    if (!companyHydrated) return;

    if (companyDisabled) {
      logout();
      router.push("/login");
    }
  }, [companyHydrated, companyDisabled, logout, router]);

  // --------------------------------------------------
  // Refresh user
  // --------------------------------------------------

  useEffect(() => {
    if (!isAuth) return;

    refreshUserInfo();
  }, [pathname, isAuth, refreshUserInfo]);

  // --------------------------------------------------
  // Dynamic company title
  // --------------------------------------------------

  useEffect(() => {
    if (!companyHydrated) return;

    document.title = companyName;

    if (companyFavicon) {
      let favicon = document.querySelector(
        "link[rel='icon']",
      ) as HTMLLinkElement | null;

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = companyFavicon;
    }
  }, [companyHydrated, companyName, companyFavicon]);

  return (
    <HeroUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <NavigationProgressBar />
        <ToastProvider
          placement="top-right"
          toastProps={{
            timeout: 3000,
          }}
        />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
