"use client";

import { Link, usePathname } from "@/i18n/navigation";

import { Accordion, AccordionItem, Button, Divider } from "@heroui/react";

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCheck,
  UserRound,
  FileCheck,
  LogIn,
  CheckCircle2,
} from "lucide-react";

import { FaFacebook, FaInstagram } from "react-icons/fa6";

import { useTranslations } from "next-intl";

import { useAccountStore } from "@/stores/AccountStore";

import pkg from "../../../package.json";

type NavigationSidebarProps = {
  onNavigate?: () => void;
};

export default function NavigationSidebar({
  onNavigate,
}: NavigationSidebarProps) {
  const t = useTranslations("navigationSidebar");
  const pathname = usePathname();

  const { name } = useAccountStore();

  const isActive = (href: string) => {
    if (!href || href === "#") {
      return false;
    }

    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
      isActive(href)
        ? "bg-blue-500/15 font-medium text-blue-600 dark:bg-blue-400/15 dark:text-blue-400"
        : "text-default-600 hover:bg-default-100 hover:text-foreground"
    }`;

  // Determine which accordion should be open
  const defaultExpandedKeys = (() => {
    if (isActive("/")) {
      return new Set(["dashboard"]);
    }

    if (isActive("/client-approval")) {
      return new Set(["client"]);
    }

    return new Set<string>();
  })();

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* User */}
      <div className="flex flex-col items-center px-5 py-6">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-default-100">
          <UserRound size={40} className="text-default-400" />
        </div>

        <p className="mt-3 max-w-full truncate text-sm font-semibold text-foreground">
          {name || t("user")}
        </p>
      </div>

      <Divider />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <Accordion
          selectionMode="multiple"
          variant="light"
          showDivider={false}
          defaultExpandedKeys={defaultExpandedKeys}
          className="w-full px-0"
          itemClasses={{
            base: "w-full",
            heading: "w-full",
            trigger: "w-full rounded-lg px-3 py-3 hover:bg-default-100",
            title: "text-foreground",
            content: "w-full px-0",
            indicator: "text-default-500",
          }}
        >
          {/* Dashboard */}
          <AccordionItem
            key="dashboard"
            aria-label={t("dashboard")}
            title={
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />

                <span className="text-sm font-medium">{t("dashboard")}</span>
              </div>
            }
          >
            <Link href="/" onClick={onNavigate} className={linkClass("/")}>
              <LayoutDashboard size={17} />

              <span>{t("mainDashboard")}</span>
            </Link>
          </AccordionItem>

          {/* Client */}
          <AccordionItem
            key="client"
            aria-label={t("client")}
            title={
              <div className="flex items-center gap-3">
                <Users size={18} />

                <span className="text-sm font-medium">{t("client")}</span>
              </div>
            }
          >
            <div className="w-full space-y-1">
              <Link
                href="/client-approval"
                onClick={onNavigate}
                className={linkClass("/client-approval")}
              >
                <UserCheck size={17} />

                <span>{t("clientApproval")}</span>
              </Link>

              <Link href="#" onClick={onNavigate} className={linkClass("")}>
                <UserRound size={17} />

                <span>{t("clientList")}</span>
              </Link>

              <Link href="#" onClick={onNavigate} className={linkClass("")}>
                <FileCheck size={17} />

                <span>{t("approvalReports")}</span>
              </Link>

              <Link href="#" onClick={onNavigate} className={linkClass("")}>
                <LogIn size={17} />

                <span>{t("clientLogins")}</span>
              </Link>
            </div>
          </AccordionItem>

          {/* Orders */}
          <AccordionItem
            key="orders"
            aria-label={t("orders")}
            title={
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} />

                <span className="text-sm font-medium">{t("orders")}</span>
              </div>
            }
          >
            <Link href="#" onClick={onNavigate} className={linkClass("")}>
              <CheckCircle2 size={17} />

              <span>{t("confirmedOrders")}</span>
            </Link>
          </AccordionItem>
        </Accordion>
      </nav>

      <Divider />

      {/* Footer */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            as="a"
            href="#"
            rel="noopener noreferrer"
            isIconOnly
            variant="light"
            aria-label="Facebook"
            className="text-default-600 hover:bg-default-100"
          >
            <FaFacebook size={18} />
          </Button>

          <Button
            as="a"
            href="#"
            rel="noopener noreferrer"
            isIconOnly
            variant="light"
            aria-label="Instagram"
            className="text-default-600 hover:bg-default-100"
          >
            <FaInstagram size={18} />
          </Button>
        </div>

        <p className="mt-2 text-center text-xs text-default-400">
          {t("version") + " " + pkg.version}
        </p>
      </div>
    </div>
  );
}
