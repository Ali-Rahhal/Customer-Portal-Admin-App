"use client";

import { Card } from "@heroui/react";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import Layout from "@/components/layout/Layout";

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations("homepage");

  return (
    <Layout title={t("dashboard")}>
      <div className="w-full">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t("products")}
            value="—"
            icon={<Package size={21} />}
            color="primary"
          />

          <StatCard
            title={t("orders")}
            value="—"
            icon={<ShoppingCart size={21} />}
            color="success"
          />

          <StatCard
            title={t("clients")}
            value="—"
            icon={<Users size={21} />}
            color="warning"
          />

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{t("status")}</p>

                <p className="mt-2 text-lg font-semibold text-success">
                  {t("active")}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <div className="h-3 w-3 rounded-full bg-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main charts */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Sales overview */}
          <Card className="p-5 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("salesOverview")}
                </h3>

                <p className="mt-1 text-sm text-default-500">
                  {t("salesOverviewDescription")}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Placeholder chart */}
            <div className="relative h-64 overflow-hidden rounded-lg bg-default-50 p-4">
              <div className="absolute inset-x-4 top-4 flex justify-between text-xs text-default-400">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="absolute inset-x-4 bottom-10 top-10">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="absolute left-0 right-0 border-t border-default-200"
                    style={{ top: `${line * 25}%` }}
                  />
                ))}

                {/* Fake graph */}
                <svg
                  viewBox="0 0 800 200"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points="0,160 100,135 200,145 300,90 400,110 500,65 600,80 700,35 800,55"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary"
                  />

                  <polyline
                    points="0,180 100,165 200,175 300,140 400,150 500,125 600,135 700,105 800,120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    className="text-default-300"
                  />
                </svg>
              </div>

              <div className="absolute inset-x-4 bottom-3 flex justify-between text-xs text-default-400">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </Card>

          {/* Order status */}
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("orderStatus")}
                </h3>

                <p className="mt-1 text-sm text-default-500">
                  {t("orderStatusDescription")}
                </p>
              </div>

              <div className="rounded-lg bg-success/10 p-2 text-success">
                <Activity size={20} />
              </div>
            </div>

            {/* Donut placeholder */}
            <div className="flex justify-center py-3">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-22 border-primary/20">
                <div className="absolute -inset-5.5 rounded-full border-22 border-transparent border-t-primary border-r-primary rotate-[-25deg]" />

                <div className="text-center">
                  <p className="text-2xl font-bold">—</p>
                  <p className="text-xs text-default-500">{t("total")}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <StatusRow
                label={t("completed")}
                value="—"
                icon={<CheckCircle2 size={16} />}
                className="text-success"
              />

              <StatusRow
                label={t("pendingOrders")}
                value="—"
                icon={<Clock3 size={16} />}
                className="text-warning"
              />

              <StatusRow
                label={t("processing")}
                value="—"
                icon={<Activity size={16} />}
                className="text-primary"
              />
            </div>
          </Card>
        </div>

        {/* Secondary charts */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Revenue */}
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t("revenue")}</h3>
                <p className="mt-1 text-sm text-default-500">
                  {t("revenueDescription")}
                </p>
              </div>

              <BarChart3 size={20} className="text-primary" />
            </div>

            <div className="flex h-48 items-end justify-between gap-2">
              {[35, 55, 42, 75, 60, 85, 68, 92, 72, 80, 65, 95].map(
                (height, index) => (
                  <div key={index} className="flex h-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-primary/60"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ),
              )}
            </div>

            <div className="mt-3 flex justify-between text-xs text-default-400">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </Card>

          {/* Clients */}
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t("clientGrowth")}</h3>
                <p className="mt-1 text-sm text-default-500">
                  {t("clientGrowthDescription")}
                </p>
              </div>

              <Users size={20} className="text-warning" />
            </div>

            <div className="relative h-48 rounded-lg bg-default-50">
              <svg
                viewBox="0 0 600 180"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,150 70,140 140,145 210,105 280,120 350,75 420,90 490,45 600,55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-warning"
                />
              </svg>
            </div>

            <div className="mt-3 flex justify-between text-xs text-default-400">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </Card>

          {/* Recent activity */}
          <Card className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t("recentActivity")}</h3>
                <p className="mt-1 text-sm text-default-500">
                  {t("recentActivityDescription")}
                </p>
              </div>

              <Clock3 size={20} className="text-default-400" />
            </div>

            <div className="space-y-4">
              <ActivityItem
                icon={<ShoppingCart size={16} />}
                title={t("newOrder")}
                description="—"
              />

              <ActivityItem
                icon={<Users size={16} />}
                title={t("newClient")}
                description="—"
              />

              <ActivityItem
                icon={<Package size={16} />}
                title={t("productUpdated")}
                description="—"
              />

              <ActivityItem
                icon={<CheckCircle2 size={16} />}
                title={t("orderCompleted")}
                description="—"
              />
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
              onPress={() => router.push("/client-approval")}
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

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-default-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>

        <div className={`rounded-lg bg-${color}/10 p-3 text-${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 ${className}`}>
        {icon}
        <span className="text-sm text-default-600">{label}</span>
      </div>

      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-default-100 p-2 text-default-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-default-400">{description}</p>
      </div>
    </div>
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
