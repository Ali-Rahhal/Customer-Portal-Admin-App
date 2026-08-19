"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  addToast,
} from "@heroui/react";

import { Check, Search, X } from "lucide-react";

import { useTranslations } from "next-intl";

import Layout from "@/components/layout/Layout";

import {
  getPendingClients,
  rejectClient,
  acceptClient,
} from "@/utils/apiCalls";

interface PendingClient {
  client_code: string;
  name: string;
  request_date: string;
}

const PAGE_SIZE = 10;

export default function ClientRequestsPage() {
  const t = useTranslations("clientRequests");

  const [clients, setClients] = useState<PendingClient[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      const skip = (page - 1) * PAGE_SIZE;

      const response = await getPendingClients(PAGE_SIZE, skip, search);

      const result = response.data.result;

      setClients(result?.data ?? []);
      setTotal(result?.total ?? 0);
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || t("fetchError"),
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, t]);

  useEffect(() => {
    let cancelled = false;

    const loadClients = async () => {
      try {
        setLoading(true);

        const skip = (page - 1) * PAGE_SIZE;

        const response = await getPendingClients(PAGE_SIZE, skip, search);

        if (cancelled) return;

        const result = response.data.result;

        setClients(result?.data ?? []);
        setTotal(result?.total ?? 0);
      } catch (error: any) {
        if (cancelled) return;

        addToast({
          title: error?.response?.data?.message || t("fetchError"),
          color: "danger",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      cancelled = true;
    };
  }, [page, search, t]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleReject = async (clientCode: string) => {
    try {
      setActionLoading(clientCode);

      await rejectClient(clientCode);

      addToast({
        title: t("requestRejected"),
        color: "success",
      });

      if (clients.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchClients();
      }
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || t("rejectError"),
        color: "danger",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (clientCode: string) => {
    try {
      setActionLoading(clientCode);

      await acceptClient(clientCode);

      addToast({
        title: t("requestApproved"),
        color: "success",
      });

      if (clients.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchClients();
      }
    } catch (error: any) {
      addToast({
        title: error?.response?.data?.message || t("approveError"),
        color: "danger",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout title={t("title")} subtitle={t("subtitle")}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm text-default-500">{t("description")}</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            value={search}
            onValueChange={handleSearch}
            placeholder={t("searchPlaceholder")}
            startContent={<Search size={18} className="text-default-400" />}
            isClearable
            onClear={() => handleSearch("")}
            className="w-full sm:max-w-sm"
          />
        </div>

        {/* Desktop table */}
        <Card className="hidden overflow-hidden sm:block">
          <Table aria-label={t("title")} removeWrapper>
            <TableHeader>
              <TableColumn>{t("name").toUpperCase()}</TableColumn>
              <TableColumn>{t("code").toUpperCase()}</TableColumn>
              <TableColumn>{t("requestDate").toUpperCase()}</TableColumn>
              <TableColumn>{t("actions").toUpperCase()}</TableColumn>
            </TableHeader>

            <TableBody
              emptyContent={loading ? t("loading") : t("noRequests")}
              isLoading={loading}
              loadingContent={<Spinner />}
            >
              {clients.map((client) => (
                <TableRow key={client.client_code}>
                  <TableCell>
                    <span className="font-medium">{client.name}</span>
                  </TableCell>

                  <TableCell>
                    <span className="text-default-500">
                      {client.client_code}
                    </span>
                  </TableCell>

                  <TableCell>{formatDate(client.request_date)}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Check size={16} />}
                        isLoading={actionLoading === client.client_code}
                        isDisabled={actionLoading !== null}
                        onPress={() => handleApprove(client.client_code)}
                      >
                        {t("approve")}
                      </Button>

                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<X size={16} />}
                        isLoading={actionLoading === client.client_code}
                        isDisabled={actionLoading !== null}
                        onPress={() => handleReject(client.client_code)}
                      >
                        {t("reject")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Mobile cards */}
        <div className="space-y-3 sm:hidden">
          {loading ? (
            <Card className="flex items-center justify-center p-8">
              <Spinner />
            </Card>
          ) : clients.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-default-500">{t("noRequests")}</p>
            </Card>
          ) : (
            clients.map((client) => (
              <Card key={client.client_code} className="p-4">
                <div className="space-y-4">
                  {/* Client information */}
                  <div>
                    <p className="font-semibold text-foreground">
                      {client.name}
                    </p>

                    <p className="mt-1 text-sm text-default-500">
                      {client.client_code}
                    </p>
                  </div>

                  {/* Request date */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("requestDate")}
                    </p>

                    <p className="mt-1 text-sm text-default-600">
                      {formatDate(client.request_date)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-default-100 pt-3">
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      startContent={<Check size={16} />}
                      isLoading={actionLoading === client.client_code}
                      isDisabled={actionLoading !== null}
                      className="flex-1"
                      onPress={() => handleApprove(client.client_code)}
                    >
                      {t("approve")}
                    </Button>

                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<X size={16} />}
                      isLoading={actionLoading === client.client_code}
                      isDisabled={actionLoading !== null}
                      className="flex-1"
                      onPress={() => handleReject(client.client_code)}
                    >
                      {t("reject")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-default-500">
              {t("page")} {page} {t("pageOf")} {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={page === 1 || loading}
                onPress={() => setPage((currentPage) => currentPage - 1)}
              >
                {t("previous")}
              </Button>

              <Button
                size="sm"
                variant="flat"
                isDisabled={page === totalPages || loading}
                onPress={() => setPage((currentPage) => currentPage + 1)}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
