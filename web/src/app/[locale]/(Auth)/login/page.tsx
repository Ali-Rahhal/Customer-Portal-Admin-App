"use client";

import Image from "next/image";
import { Form, Input, Button, Card, addToast } from "@heroui/react";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/stores/AuthStore";
import { useCompanyAssets } from "@/hooks/useCompanyAssets";
import LanguageSelect from "@/components/LanguageSelect";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");

  const { login } = useAuthStore();
  const { companyHydrated, companyName, companyLogo } = useCompanyAssets();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const userId = String(formData.get("userId") || "").trim();
    const password = String(formData.get("password") || "");

    if (!userId) {
      addToast({
        title: t("usercode_required"),
        description: t("usercode_required_description"),
        color: "warning",
      });

      return;
    }

    if (!password) {
      addToast({
        title: t("password_required"),
        description: t("password_required_description"),
        color: "warning",
      });

      return;
    }

    try {
      await login({
        userId,
        password,
      });

      addToast({
        title: t("success"),
        description: t("success_description"),
        color: "success",
      });

      router.push("/");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("failed_description");

      addToast({
        title: t("failed"),
        description: message,
        color: "danger",
      });
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-default-50 px-4 py-10 sm:px-6">
      <LanguageSelect className="absolute right-5 top-5 z-20 w-40 sm:right-8 sm:top-7" />

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border border-default-200 bg-background p-6 shadow-lg sm:p-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-36 w-64">
            {companyHydrated && companyLogo ? (
              <Image
                src={companyLogo}
                alt={companyName ? `${companyName} logo` : "Company logo"}
                fill
                priority
                className="object-contain"
                sizes="100vw"
              />
            ) : (
              <div className="h-28 w-28 animate-pulse rounded-xl bg-default-200" />
            )}
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {t("administrator_app")}
          </p>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm leading-5 text-default-500">
            {t("subtitle")}
          </p>
        </div>

        {/* Form */}
        <Form
          className="mt-7 flex w-full flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <Input
            id="input-userCode"
            name="userId"
            label={t("usercode")}
            placeholder={t("usercode_placeholder")}
            variant="bordered"
            isRequired
            autoComplete="username"
            className="w-full"
          />

          <Input
            id="input-pass"
            name="password"
            label={t("password")}
            placeholder={t("password_placeholder")}
            type="password"
            variant="bordered"
            isRequired
            autoComplete="current-password"
            className="w-full"
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="mt-2 w-full font-semibold"
          >
            {t("login_button")}
          </Button>
        </Form>

        {/* Footer */}
        <p className="mt-7 text-center text-xs text-default-400">
          {companyHydrated ? companyName : t("administrator_portal")}
        </p>
      </Card>
    </main>
  );
}
