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

import { Check, Search, X, RefreshCw } from "lucide-react";

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
  first_name: string | null;
  last_name: string | null;
  region: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  db_name: string | null;
  db_email: string | null;
  db_phone_number: string | null;
  db_region: string | null;
  db_address: string | null;
  db_latitude: number | null;
  db_longitude: number | null;
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

  const [actionLoading, setActionLoading] = useState<{
    clientCode: string;
    action: "approve" | "reject";
  } | null>(null);

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

  const handleApprove = async (clientCode: string) => {
    try {
      setActionLoading({
        clientCode,
        action: "approve",
      });

      await acceptClient(clientCode);

      addToast({
        title: t("requestApproved"),
        color: "success",
      });

      setSelectedClient(null);

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

  const handleReject = async (clientCode: string) => {
    try {
      setActionLoading({
        clientCode,
        action: "reject",
      });

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

              <TableColumn key="moh_number" allowsSorting>
                {t("mohNumber").toUpperCase()}
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

                  {/* Moh Number */}
                  <TableCell>
                    <span className="font-medium text-foreground">
                      {client.moh_number}
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

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="solid"
                        startContent={<Check size={16} />}
                        isLoading={
                          actionLoading?.clientCode === client.client_code &&
                          actionLoading?.action === "approve"
                        }
                        isDisabled={actionLoading !== null}
                        onPress={() => setSelectedClient(client)}
                      >
                        {t("approve")}
                      </Button>

                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<X size={16} />}
                        isLoading={
                          actionLoading?.clientCode === client.client_code &&
                          actionLoading?.action === "reject"
                        }
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
                    ? "border-2 border-warning-200 bg-warning-50 p-3"
                    : "p-3"
                }
              >
                <div className="space-y-3">
                  {/* Client header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {client.name || "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-default-500">
                        {client.client_code}
                      </p>
                    </div>

                    {client.status_id === 99 && (
                      <span className="shrink-0 rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-medium text-warning-700">
                        {t("unknown")}
                      </span>
                    )}
                  </div>

                  {/* Compact information grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-default-100 pt-3">
                    {/* MOH number */}
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
                        {t("mohNumber")}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-default-600">
                        {client.moh_number || "—"}
                      </p>
                    </div>

                    {/* Request date */}
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
                        {t("requestDate")}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-default-600">
                        {formatDate(client.request_date)}
                      </p>
                    </div>

                    {/* Days */}
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
                        {t("days")}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-default-600">
                        {getDaysSince(client.request_date)}
                      </p>
                    </div>

                    {/* Created by */}
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-default-400">
                        {t("createdBy")}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-default-600">
                        {client.created_by || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-default-100 pt-3">
                    <Button
                      size="sm"
                      color="primary"
                      variant="solid"
                      startContent={<Check size={15} />}
                      isLoading={
                        actionLoading?.clientCode === client.client_code &&
                        actionLoading?.action === "approve"
                      }
                      isDisabled={actionLoading !== null}
                      className="h-8 flex-1 text-xs"
                      onPress={() => setSelectedClient(client)}
                    >
                      {t("approve")}
                    </Button>

                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<X size={15} />}
                      isLoading={
                        actionLoading?.clientCode === client.client_code &&
                        actionLoading?.action === "reject"
                      }
                      isDisabled={actionLoading !== null}
                      className="h-8 flex-1 text-xs"
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
          if (!open && actionLoading === null) {
            setSelectedClient(null);
          }
        }}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-4",
        }}
      >
        <ModalContent>
          {selectedClient && (
            <>
              <ModalHeader className="border-b border-default-100 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold">{t("approve")}</h3>

                  <p className="mt-1 text-sm font-normal text-default-500">
                    {selectedClient.status_id === 99
                      ? t("newClientDetails")
                      : t("compareClientDetails")}
                  </p>
                </div>
              </ModalHeader>

              <ModalBody>
                {/* =====================================================
              STATUS 99 - NEW CLIENT
          ===================================================== */}
                {selectedClient.status_id === 99 ? (
                  <div className="space-y-5">
                    <SectionTitle title={t("clientInfo")} />

                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                      <DetailRow
                        label={t("code")}
                        value={selectedClient.client_code}
                      />

                      <DetailRow
                        label={t("name")}
                        value={selectedClient.name}
                      />

                      <DetailRow
                        label={t("mohNumber")}
                        value={selectedClient.moh_number}
                      />

                      <DetailRow
                        label={t("firstName")}
                        value={selectedClient.first_name}
                      />

                      <DetailRow
                        label={t("lastName")}
                        value={selectedClient.last_name}
                      />

                      <DetailRow
                        label={t("phoneNumber")}
                        value={selectedClient.phone_number}
                      />

                      <DetailRow
                        label={t("email")}
                        value={selectedClient.email}
                        breakWords
                      />

                      <DetailRow
                        label={t("region")}
                        value={selectedClient.region}
                      />

                      <DetailRow
                        label={t("address")}
                        value={selectedClient.address}
                        breakWords
                      />

                      <DetailRow
                        label={t("latitude")}
                        value={selectedClient.latitude}
                      />

                      <DetailRow
                        label={t("longitude")}
                        value={selectedClient.longitude}
                      />
                    </div>
                  </div>
                ) : (
                  /* =====================================================
               STATUS 7 - CLIENT INFO + DB COMPARISON
            ===================================================== */
                  <div className="space-y-5">
                    {/* Client Information */}
                    <section>
                      <SectionTitle title={t("clientInfo")} />

                      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <DetailRow
                          label={t("code")}
                          value={selectedClient.client_code}
                        />

                        <DetailRow
                          label={t("name")}
                          value={selectedClient.name}
                        />

                        <DetailRow
                          label={t("mohNumber")}
                          value={selectedClient.moh_number}
                        />

                        <DetailRow
                          label={t("firstName")}
                          value={selectedClient.first_name}
                        />

                        <DetailRow
                          label={t("lastName")}
                          value={selectedClient.last_name}
                        />
                      </div>
                    </section>

                    {/* Comparison */}
                    <section className="border-t border-default-200 pt-5">
                      <SectionTitle title={t("compareClientDetails")} />

                      {/* Column headers */}
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="rounded-md bg-default-100 px-3 py-2">
                          <p className="text-xs font-semibold text-default-600 sm:text-sm">
                            {t("clientInfo")}
                          </p>
                        </div>

                        <div className="rounded-md bg-primary-50 px-3 py-2">
                          <p className="text-xs font-semibold text-primary-700 sm:text-sm">
                            {t("dbInfo")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-2">
                        <CompareRow
                          label={t("name")}
                          clientValue={selectedClient.name}
                          dbValue={selectedClient.db_name}
                        />

                        <CompareRow
                          label={t("email")}
                          clientValue={selectedClient.email}
                          dbValue={selectedClient.db_email}
                        />

                        <CompareRow
                          label={t("phoneNumber")}
                          clientValue={selectedClient.phone_number}
                          dbValue={selectedClient.db_phone_number}
                        />

                        <CompareRow
                          label={t("region")}
                          clientValue={selectedClient.region}
                          dbValue={selectedClient.db_region}
                        />

                        <CompareRow
                          label={t("address")}
                          clientValue={selectedClient.address}
                          dbValue={selectedClient.db_address}
                        />

                        <CompareRow
                          label={t("latitude")}
                          clientValue={selectedClient.latitude}
                          dbValue={selectedClient.db_latitude}
                        />

                        <CompareRow
                          label={t("longitude")}
                          clientValue={selectedClient.longitude}
                          dbValue={selectedClient.db_longitude}
                        />
                      </div>
                    </section>
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-default-100 px-5 py-3">
                <Button
                  variant="flat"
                  isDisabled={actionLoading !== null}
                  onPress={() => setSelectedClient(null)}
                >
                  {t("cancel")}
                </Button>

                <Button
                  color="primary"
                  startContent={
                    actionLoading?.clientCode !== selectedClient.client_code ||
                    actionLoading?.action !== "approve" ? (
                      <Check size={16} />
                    ) : undefined
                  }
                  isLoading={
                    actionLoading?.clientCode === selectedClient.client_code &&
                    actionLoading?.action === "approve"
                  }
                  isDisabled={actionLoading !== null}
                  onPress={() => handleApprove(selectedClient.client_code)}
                >
                  {t("approve")}
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

function DetailRow({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string | number | null | undefined;
  breakWords?: boolean;
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
        {label}
      </p>

      <p
        className={`mt-0.5 text-sm font-medium text-default-700 ${
          breakWords ? "wrap-break-word" : "truncate"
        }`}
        title={displayValue}
      >
        {displayValue}
      </p>
    </div>
  );
}

function CompareRow({
  label,
  clientValue,
  dbValue,
}: {
  label: string;
  clientValue: string | number | null | undefined;
  dbValue: string | number | null | undefined;
}) {
  const displayValue = (value: string | number | null | undefined) =>
    value === null || value === undefined || value === "" ? "—" : String(value);

  const clientDisplay = displayValue(clientValue);
  const dbDisplay = displayValue(dbValue);

  const different = clientDisplay !== dbDisplay;

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-default-400">
        {label}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div
          className={`min-w-0 rounded-md border px-3 py-2 ${
            different
              ? "border-warning-300 bg-warning-50"
              : "border-default-200 bg-default-50"
          }`}
        >
          <p className="wrap-break-word text-sm text-default-700">
            {clientDisplay}
          </p>
        </div>

        <div
          className={`min-w-0 rounded-md border px-3 py-2 ${
            different
              ? "border-warning-300 bg-warning-50"
              : "border-default-200 bg-default-50"
          }`}
        >
          <p className="wrap-break-word text-sm text-default-700">
            {dbDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-1 rounded-full bg-primary" />

      <p className="text-sm font-semibold text-default-700">{title}</p>
    </div>
  );
}
