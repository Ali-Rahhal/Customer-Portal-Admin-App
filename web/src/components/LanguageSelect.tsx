"use client";

import { Select, SelectItem } from "@heroui/react";
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;

    if (!newLocale || newLocale === locale) return;

    router.replace(pathname, {
      locale: newLocale,
    });
  };

  return (
    <div className={className}>
      <Select
        aria-label="Select language"
        selectedKeys={[locale]}
        onChange={handleChange}
        className="w-full"
        variant="bordered"
        radius="lg"
      >
        {languages.map((language) => (
          <SelectItem key={language.key} textValue={language.name}>
            <div className="flex items-center gap-2">
              <ReactCountryFlag
                countryCode={language.flag}
                svg
                className="h-5 w-5"
              />

              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
