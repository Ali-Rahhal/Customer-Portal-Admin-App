"use client";

import { Link } from "@/i18n/navigation";

import { Button, Divider, Switch } from "@heroui/react";

import { LockKeyhole, LogOut, Info } from "lucide-react";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/AuthStore";

type SettingsSidebarProps = {
  onClose?: () => void;
};

export default function SettingsSidebar({ onClose }: SettingsSidebarProps) {
  const router = useRouter();

  const { logout } = useAuthStore();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && theme === "dark";

  const handleLogout = async () => {
    await logout();

    router.push("/login");
  };

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-default-200 px-5">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Account */}
        <section className="px-5 py-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-default-400">
            Account
          </h3>

          <div className="space-y-1">
            <Link
              href="#"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-default-700 transition-colors hover:bg-default-100"
            >
              <LockKeyhole size={18} />
              <span>Change Password</span>
            </Link>

            <Button
              variant="light"
              className="h-auto w-full justify-start gap-3 px-3 py-2.5 text-sm font-normal text-danger"
              onPress={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </section>

        <Divider />

        {/* Appearance */}
        <section className="px-5 py-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-default-400">
            Appearance
          </h3>

          <div className="flex items-center justify-between rounded-lg px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>

              <p className="text-xs text-default-400">Use a dark appearance</p>
            </div>

            <Switch
              size="sm"
              isSelected={isDarkMode}
              isDisabled={!mounted}
              onValueChange={(enabled) => setTheme(enabled ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
        </section>

        <Divider />

        {/* About */}
        <section className="px-5 py-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-default-400">
            About
          </h3>

          <Link
            href="#"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-default-700 transition-colors hover:bg-default-100"
          >
            <Info size={18} />
            <span>About</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
