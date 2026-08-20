"use client";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

import ReactCountryFlag from "react-country-flag";

const languages = [
  {
    key: "en",
    name: "English",
    flag: "GB",
  },
  {
    key: "fr",
    name: "Français",
    flag: "FR",
  },
];

export default function LanguageSelect({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const selectedLanguage = languages.find(
    (language) => language.key === locale,
  );

  const handleChange = (key: React.Key) => {
    const newLocale = String(key);

    if (!newLocale || newLocale === locale) return;

    router.replace(pathname, {
      locale: newLocale,
    });
  };

  return (
    <div className={className}>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="bordered"
            radius="full"
            className="h-10 w-10 min-w-10"
            aria-label="Select language"
          >
            {selectedLanguage && (
              <ReactCountryFlag
                countryCode={selectedLanguage.flag}
                svg
                className="h-5 w-5"
              />
            )}
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Select language"
          selectedKeys={new Set([locale])}
          selectionMode="single"
          onAction={handleChange}
        >
          {languages.map((language) => (
            <DropdownItem key={language.key} textValue={language.name}>
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode={language.flag}
                  svg
                  className="h-5 w-5"
                />

                <span>{language.name}</span>
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
