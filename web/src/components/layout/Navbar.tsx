"use client";

import { Button } from "@heroui/react";
import { Link } from "@/i18n/navigation";

import { Menu, Maximize, Minimize, Settings } from "lucide-react";

import { useState } from "react";

import Image from "next/image";

import { useCompanyAssets } from "@/hooks/useCompanyAssets";

import LanguageSelect from "@/components/LanguageSelect";

type NavbarProps = {
  title: string;
  onMenuPress: () => void;
  onSettingsPress: () => void;
};

export default function Navbar({
  title,
  onMenuPress,
  onSettingsPress,
}: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { companyHydrated, companyLogo, companyName } = useCompanyAssets();

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore fullscreen errors
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-blue-500 px-4 dark:bg-blue-700 sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Logo */}
        {companyHydrated && companyLogo ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm">
            <div className="relative h-full w-full">
              <Link href="/" className="absolute inset-0">
                <Image
                  src={companyLogo}
                  alt={companyName || "Company"}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-white/30" />
        )}

        {/* Navigation */}
        <Button
          isIconOnly
          variant="light"
          aria-label="Open navigation"
          onPress={onMenuPress}
          className="text-white hover:bg-blue-600 dark:hover:bg-blue-800"
        >
          <Menu size={21} />
        </Button>

        {/* Fullscreen */}
        <Button
          isIconOnly
          variant="light"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onPress={handleFullscreen}
          className="text-white hover:bg-blue-600 dark:hover:bg-blue-800"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>

        {/* Page title */}
        <h1 className="ml-1 truncate text-lg font-semibold text-white">
          {title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1">
        <LanguageSelect />

        <Button
          isIconOnly
          variant="light"
          aria-label="Settings"
          onPress={onSettingsPress}
          className="text-white hover:bg-blue-600 dark:hover:bg-blue-800"
        >
          <Settings size={20} />
        </Button>
      </div>
    </header>
  );
}
