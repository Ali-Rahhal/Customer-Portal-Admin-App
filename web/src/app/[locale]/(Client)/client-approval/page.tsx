"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Pagination,
  addToast,
} from "@heroui/react";
import type { SortDescriptor } from "@react-types/shared";

import { Check, Search, X, Eye, RefreshCw } from "lucide-react";

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
  created_by: string;
  status_id: number;
  email: string | null;
  phone_number: string | null;
  moh_number: string | null;
}

type SortColumn = "client_code" | "description" | "last_edited";

const SORT_COLUMN_MAP: Record<string, SortColumn> = {
  client_code: "client_code",
  name: "description",
  request_date: "last_edited",
};

const PAGE_SIZE = 10;

export default function ClientApprovalPage() {
  const t = useTranslations("clientApproval");

  const [clients, setClients] = useState<PendingClient[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "request_date",
    direction: "descending",
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "known" | "unknown">(
    "all",
  );

  const [selectedClient, setSelectedClient] = useState<PendingClient | null>(
    null,
  );

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      const skip = (page - 1) * PAGE_SIZE;

      const sortBy =
        SORT_COLUMN_MAP[String(sortDescriptor.column)] ?? "last_edited";

      const sortOrder =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await getPendingClients(
        PAGE_SIZE,
        skip,
        search,
        sortBy,
        sortOrder,
        statusFilter,
      );

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
  }, [page, search, sortDescriptor, statusFilter, t]);

  useEffect(() => {
    let cancelled = false;

    const loadClients = async () => {
      try {
        setLoading(true);

        const skip = (page - 1) * PAGE_SIZE;

        const sortBy =
          SORT_COLUMN_MAP[String(sortDescriptor.column)] ?? "last_edited";

        const sortOrder =
          sortDescriptor.direction === "ascending" ? "asc" : "desc";

        const response = await getPendingClients(
          PAGE_SIZE,
          skip,
          search,
          sortBy,
          sortOrder,
          statusFilter,
        );

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
  }, [page, search, sortDescriptor, statusFilter, t]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleRefresh = async () => {
    try {
      setLoading(true);

      const skip = (page - 1) * PAGE_SIZE;

      const sortBy =
        SORT_COLUMN_MAP[String(sortDescriptor.column)] ?? "last_edited";

      const sortOrder =
        sortDescriptor.direction === "ascending" ? "asc" : "desc";

      const response = await getPendingClients(
        PAGE_SIZE,
        skip,
        search,
        sortBy,
        sortOrder,
        statusFilter,
      );

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
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
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
    <Layout title={t("title")}>
      <div className="w-full">
        {/* Desktop table */}
        <Card className="hidden w-full overflow-hidden sm:block">
          {/* Table top section */}
          <div className="flex flex-col gap-4 border-b border-default-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Pending counter */}
              <p className="text-base font-semibold text-primary-600">
                {t("pending")}:{" "}
                <span className="text-xl font-bold text-primary-700">
                  {total}
                </span>
              </p>

              {/* Client type filter */}
              <Select
                size="sm"
                aria-label={t("clientType")}
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];

                  if (
                    value === "all" ||
                    value === "known" ||
                    value === "unknown"
                  ) {
                    setStatusFilter(value);
                    setPage(1);
                  }
                }}
                className="w-full sm:w-40"
              >
                <SelectItem key="all">{t("allClients")}</SelectItem>

                <SelectItem key="known">{t("knownClients")}</SelectItem>

                <SelectItem key="unknown">{t("unknownClients")}</SelectItem>
              </Select>

              <Button
                size="sm"
                variant="flat"
                isIconOnly
                isLoading={loading}
                aria-label={t("refresh")}
                onPress={handleRefresh}
              >
                <RefreshCw size={17} />
              </Button>
            </div>

            {/* Search */}
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

          {/* Table */}
          <Table
            aria-label={t("title")}
            isStriped={true}
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            radius="none"
          >
            <TableHeader>
              <TableColumn key="client_code" allowsSorting>
                {t("code").toUpperCase()}
              </TableColumn>

              <TableColumn key="name" allowsSorting>
                {t("name").toUpperCase()}
              </TableColumn>

              <TableColumn key="created_by">
                {t("createdBy").toUpperCase()}
              </TableColumn>

              <TableColumn key="request_date" allowsSorting>
                {t("requestDate").toUpperCase()}
              </TableColumn>

              <TableColumn key="days">{t("days").toUpperCase()}</TableColumn>

              <TableColumn key="details">
                {t("moreDetails").toUpperCase()}
              </TableColumn>

              <TableColumn key="actions">
                {t("actions").toUpperCase()}
              </TableColumn>
            </TableHeader>

            <TableBody
              emptyContent={loading ? t("loading") : t("noRequests")}
              isLoading={loading}
              loadingContent={<Spinner />}
            >
              {clients.map((client) => (
                <TableRow
                  key={client.client_code}
                  className={
                    client.status_id === 99 ? "bg-warning-50" : undefined
                  }
                >
                  {/* Code */}
                  <TableCell>
                    <span className="font-medium text-foreground">
                      {client.client_code}
                    </span>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <span className="font-medium">{client.name}</span>
                  </TableCell>

                  {/* Created By */}
                  <TableCell>
                    <span className="text-default-500">
                      {client.created_by || "—"}
                    </span>
                  </TableCell>

                  {/* Request Date */}
                  <TableCell>{formatDate(client.request_date)}</TableCell>

                  {/* Days */}
                  <TableCell>
                    <span className="font-medium">
                      {getDaysSince(client.request_date)}
                    </span>
                  </TableCell>

                  {/* Details */}
                  <TableCell>
                    {client.status_id === 99 ? (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="warning"
                        aria-label={t("viewDetails")}
                        onPress={() => setSelectedClient(client)}
                      >
                        <Eye size={17} />
                      </Button>
                    ) : (
                      <span className="text-default-300">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="solid"
                        startContent={<Check size={16} />}
                        isLoading={actionLoading === client.client_code}
                        isDisabled={actionLoading !== null}
                        onPress={() => handleApprove(client.client_code)}
                      >
                        {t("approve")}
                      </Button>

                      <Button
                        size="sm"
                        color="primary"
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

        {/* Mobile sort + cards */}
        <div className="space-y-3 sm:hidden">
          {/* Pending + Search */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-primary-600">
              {t("pending")}:{" "}
              <span className="text-xl font-bold text-primary-700">
                {total}
              </span>
            </p>

            {/* Filter */}
            <div className="flex gap-2">
              <Select
                size="sm"
                label={t("clientType")}
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0];

                  if (
                    value === "all" ||
                    value === "known" ||
                    value === "unknown"
                  ) {
                    setStatusFilter(value);
                    setPage(1);
                  }
                }}
                className="flex-1"
              >
                <SelectItem key="all">{t("allClients")}</SelectItem>
                <SelectItem key="known">{t("knownClients")}</SelectItem>
                <SelectItem key="unknown">{t("unknownClients")}</SelectItem>
              </Select>

              <Button
                isIconOnly
                variant="flat"
                aria-label={t("refresh")}
                isLoading={loading}
                onPress={handleRefresh}
                className="mt-auto"
              >
                <RefreshCw size={17} />
              </Button>
            </div>

            {/* Search */}
            <Input
              value={search}
              onValueChange={handleSearch}
              placeholder={t("searchPlaceholder")}
              startContent={<Search size={18} className="text-default-400" />}
              isClearable
              onClear={() => handleSearch("")}
            />
          </div>

          {/* Mobile sort */}
          <div className="flex gap-2">
            <Select
              label={t("sortBy")}
              size="sm"
              selectedKeys={[String(sortDescriptor.column)]}
              onSelectionChange={(keys) => {
                const column = Array.from(keys)[0];

                if (!column) return;

                setSortDescriptor((current) => ({
                  ...current,
                  column: String(column),
                }));

                setPage(1);
              }}
              className="flex-1"
            >
              <SelectItem key="client_code">{t("code")}</SelectItem>

              <SelectItem key="name">{t("name")}</SelectItem>

              <SelectItem key="request_date">{t("requestDate")}</SelectItem>
            </Select>

            <Button
              isIconOnly
              variant="flat"
              aria-label={
                sortDescriptor.direction === "ascending"
                  ? t("ascending")
                  : t("descending")
              }
              onPress={() => {
                setSortDescriptor((current) => ({
                  ...current,
                  direction:
                    current.direction === "ascending"
                      ? "descending"
                      : "ascending",
                }));
                setPage(1);
              }}
              className="mt-auto"
            >
              {sortDescriptor.direction === "ascending" ? "↑" : "↓"}
            </Button>
          </div>

          {/* Existing mobile cards */}
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
              <Card
                key={client.client_code}
                className={
                  client.status_id === 99
                    ? "border-2 border-warning-200 bg-warning-50 p-4"
                    : "p-4"
                }
              >
                <div className="space-y-4">
                  {/* Client information */}
                  <div>
                    <p className="font-semibold text-foreground">
                      {client.name}
                    </p>

                    <p className="mt-1 text-sm text-default-500">
                      {client.client_code}
                    </p>

                    {client.status_id === 99 && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="flat"
                          color="warning"
                          startContent={<Eye size={16} />}
                          onPress={() => setSelectedClient(client)}
                        >
                          {t("moreDetails")}
                        </Button>
                      </div>
                    )}
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

                  {/* Days */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("days")}
                    </p>

                    <p className="mt-1 text-sm font-medium text-default-600">
                      {getDaysSince(client.request_date)}
                    </p>
                  </div>

                  {/* Created by */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("createdBy")}
                    </p>

                    <p className="mt-1 text-sm text-default-600">
                      {client.created_by || "-"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-default-100 pt-3">
                    <Button
                      size="sm"
                      color="primary"
                      variant="solid"
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
                      color="primary"
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
          <div className="mt-5 flex flex-col items-center gap-3">
            <p className="text-sm text-default-500">
              {t("page")} {page} {t("pageOf")} {totalPages}
            </p>

            <Pagination
              page={page}
              total={totalPages}
              onChange={setPage}
              showControls
              isDisabled={loading}
              size="sm"
              variant="flat"
            />
          </div>
        )}
      </div>
      <Modal
        isOpen={selectedClient !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClient(null);
          }
        }}
      >
        <ModalContent>
          {selectedClient && (
            <>
              <ModalHeader>{t("moreDetails")}</ModalHeader>

              <ModalBody>
                <div className="space-y-4">
                  {/* Client Code */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("code")}
                    </p>

                    <p className="mt-1 font-medium">
                      {selectedClient.client_code}
                    </p>
                  </div>

                  {/* MOH */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("mohNumber")}
                    </p>

                    <p className="mt-1">{selectedClient.moh_number || "—"}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("phoneNumber")}
                    </p>

                    <p className="mt-1">{selectedClient.phone_number || "—"}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                      {t("email")}
                    </p>

                    <p className="mt-1 break-all">
                      {selectedClient.email || "—"}
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button variant="flat" onPress={() => setSelectedClient(null)}>
                  {t("close")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Layout>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getDaysSince(date: string) {
  const requestDate = new Date(date);
  const now = new Date();

  const difference = now.getTime() - requestDate.getTime();

  return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
}
