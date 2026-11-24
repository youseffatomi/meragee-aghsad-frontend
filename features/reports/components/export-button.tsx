"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { bffEndpoints } from "@/config/api-endpoints";
import type { ActionFailure } from "@/types/result";
import type {
  ReportExportType,
  ReportInvoiceFilterStatus,
  ReportInvoiceSort,
} from "@/types/domain";

type ExportButtonProps = {
  fromDate: string;
  toDate: string;
  search: string;
  status: ReportInvoiceFilterStatus;
  sort: ReportInvoiceSort;
};

const TYPES: readonly { value: ReportExportType; label: string }[] = [
  { value: "invoices", label: "فاکتورها" },
  { value: "installments", label: "اقساط" },
  { value: "customers", label: "مشتریان" },
  { value: "products", label: "محصولات" },
];

/** Reads the filename the backend chose, falling back to a sensible default. */
function filenameFrom(header: string | null, type: ReportExportType): string {
  if (header) {
    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);

    const plain = /filename="?([^";]+)"?/i.exec(header);
    if (plain?.[1]) return plain[1];
  }

  return `report-${type}.csv`;
}

/**
 * Downloads the full dataset as CSV.
 *
 * A plain anchor cannot carry the `httpOnly` access token, so the request goes
 * through the BFF route. Fetching as a blob rather than navigating means a
 * backend error stays on the page as a toast instead of replacing the report
 * with raw JSON.
 */
export function ExportButton({
  fromDate,
  toDate,
  search,
  status,
  sort,
}: ExportButtonProps) {
  const [type, setType] = useState<ReportExportType>("invoices");
  const [loading, setLoading] = useState(false);

  async function download() {
    const params = new URLSearchParams({ type });
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (search.trim()) params.set("search", search.trim());
    if (status !== "all") params.set("status", status);
    if (sort !== "startDate") params.set("sort", sort);

    setLoading(true);
    try {
      const response = await fetch(`${bffEndpoints.reports.export}?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const failure = (await response.json().catch(() => null)) as ActionFailure | null;
        toast.error(failure?.message ?? "دانلود فایل ناموفق بود.");
        return;
      }

      const blob = await response.blob();
      const filename = filenameFrom(response.headers.get("content-disposition"), type);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("فایل CSV دانلود شد.");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="نوع فایل خروجی"
        value={type}
        onChange={(event) => setType(event.target.value as ReportExportType)}
        className="h-11 w-32"
      >
        {TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>

      <Button
        type="button"
        variant="secondary"
        isLoading={loading}
        onClick={download}
        className="whitespace-nowrap"
      >
        <Download className="size-4" aria-hidden="true" />
        خروجی CSV
      </Button>
    </div>
  );
}
