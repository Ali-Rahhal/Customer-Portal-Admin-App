"use client";

import { Card } from "@heroui/react";
import { Package, ShoppingCart, Users, ChevronRight } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import Layout from "@/components/layout/Layout";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("homepage");

  return (
    <Layout title={t("dashboard")}>
      <div className="mx-auto max-w-7xl">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("welcomeBack")}
          </h2>

          <p className="mt-1 text-sm text-default-500">{t("overview")}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{t("products")}</p>

                <p className="mt-2 text-2xl font-semibold">—</p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Package size={21} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{t("orders")}</p>

                <p className="mt-2 text-2xl font-semibold">—</p>
              </div>

              <div className="rounded-lg bg-success/10 p-3 text-success">
                <ShoppingCart size={21} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{t("clients")}</p>

                <p className="mt-2 text-2xl font-semibold">—</p>
              </div>

              <div className="rounded-lg bg-warning/10 p-3 text-warning">
                <Users size={21} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{t("status")}</p>

                <p className="mt-2 text-lg font-semibold text-success">
                  {t("active")}
                </p>
              </div>

              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <h3 className="mb-3 text-base font-semibold">{t("quickActions")}</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              isPressable
              className="p-5 text-left"
              onPress={() => router.push("/")}
            >
              <QuickAction
                icon={<Package size={20} />}
                title={t("manageProducts")}
                description={t("manageProductsDescription")}
                color="primary"
              />
            </Card>

            <Card
              isPressable
              className="p-5 text-left"
              onPress={() => router.push("/")}
            >
              <QuickAction
                icon={<ShoppingCart size={20} />}
                title={t("viewOrders")}
                description={t("viewOrdersDescription")}
                color="success"
              />
            </Card>

            <Card
              isPressable
              className="p-5 text-left"
              onPress={() => router.push("/client-requests")}
            >
              <QuickAction
                icon={<Users size={20} />}
                title={t("manageClients")}
                description={t("manageClientsDescription")}
                color="warning"
              />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function QuickAction({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "primary" | "success" | "warning";
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-${color}/10 p-3 text-${color}`}>
          {icon}
        </div>

        <div>
          <p className="font-medium">{title}</p>

          <p className="text-sm text-default-500">{description}</p>
        </div>
      </div>

      <ChevronRight size={18} className="text-default-400" />
    </div>
  );
}
