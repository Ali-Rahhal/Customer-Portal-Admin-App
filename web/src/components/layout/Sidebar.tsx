"use client";

import Image from "next/image";
import { Button, Divider, Link } from "@heroui/react";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import { useTranslations } from "next-intl";

import { useCompanyAssets } from "@/hooks/useCompanyAssets";

const navigation = [
  {
    key: "dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    key: "products",
    href: "#",
    icon: Package,
  },
  {
    key: "orders",
    href: "#",
    icon: ShoppingCart,
  },
  {
    key: "clientRequests",
    href: "/client-requests",
    icon: Users,
  },
  {
    key: "settings",
    href: "#",
    icon: Settings,
  },
];

type SidebarProps = {
  onNavigate?: () => void;
  onLogout: () => void;
};

export default function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const t = useTranslations("sidebar");

  const { companyHydrated, companyName, companyLogo } = useCompanyAssets();

  return (
    <div className="flex h-full flex-col">
      {/* Company */}
      <div className="flex h-20 items-center gap-3 px-5">
        {companyHydrated && companyLogo ? (
          <Image
            src={companyLogo}
            alt={companyName || t("company")}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        ) : (
          <div className="h-10 w-10 animate-pulse rounded-lg bg-default-200" />
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {companyHydrated ? companyName : t("loading")}
          </p>

          <p className="text-xs text-default-500">{t("administrator")}</p>
        </div>
      </div>

      <Divider />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-default-400">
          {t("navigation")}
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  item.href === "/"
                    ? "bg-primary text-primary-foreground"
                    : "text-default-600 hover:bg-default-100 hover:text-foreground"
                }`}
                onClick={onNavigate}
              >
                <Icon size={19} />

                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Divider />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="light"
          className="w-full justify-start text-default-600"
          onPress={onLogout}
        >
          <LogOut size={19} />

          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
