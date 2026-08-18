"use client";

import { Button } from "@heroui/react";
import { Menu } from "lucide-react";

import LanguageSelect from "@/components/LanguageSelect";

type NavbarProps = {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
};

export default function Navbar({ title, subtitle, onMenuPress }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-default-200 bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Button
          isIconOnly
          variant="light"
          className="lg:hidden"
          aria-label="Open menu"
          onPress={onMenuPress}
        >
          <Menu size={21} />
        </Button>

        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>

          {subtitle && (
            <p className="hidden text-xs text-default-500 sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <LanguageSelect className="w-40" />
    </header>
  );
}
