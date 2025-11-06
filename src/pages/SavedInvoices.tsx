"use client";

// this imports libraries and ui
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, MoreHorizontal, Eye, Pencil, Copy, Trash2, ArrowUpDown } from "lucide-react";

// this defines the invoice shape used in localStorage
type Party = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
};

type LineItem = {
  id: number | string;
  name: string;
  qty: number;
  rate: number;
  description?: string;
  taxPct?: number;
};

type SavedInvoice = {
  id: number | string;
  from: Party;
  to: Party;
  issueDate: string;
  dueDate: string;
  invoiceNumber: string;
  currency: string;
  items: LineItem[];
  discount: number;
  shipping: number;
  notes?: string;
  terms?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  upiId?: string;
  upiName?: string;
  template?: string;
  total: number;
  savedAt?: string;
};

// this reads invoices from localStorage
function loadInvoices(): SavedInvoice[] {
  try {
    const raw = localStorage.getItem("invoices");
    return raw ? (JSON.parse(raw) as SavedInvoice[]) : [];
  } catch {
    return [];
  }
}

// this writes invoices to localStorage
function saveInvoices(list: SavedInvoice[]) {
  localStorage.setItem("invoices", JSON.stringify(list));
}

// this formats currency amounts
function fmt(currency: string, n: number) {
  try {
    return `${currency} ${n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default function SavedInvoices() {
  // data state
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "old" | "amountDesc" | "amountAsc">("new");

  // preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(null);

  // router
  const navigate = useNavigate();

  // load on mount
  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  // search and sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = invoices.filter((inv) => {
      const a = inv.invoiceNumber?.toLowerCase() || "";
      const b = inv.to?.name?.toLowerCase() || "";
      const c = inv.from?.name?.toLowerCase() || "";
      return a.includes(q) || b.includes(q) || c.includes(q);
    });

    if (sortBy === "new") {
      list = list.sort(
        (a, b) =>
          new Date(b.savedAt || b.dueDate || "").getTime() -
          new Date(a.savedAt || a.dueDate || "").getTime()
      );
    } else if (sortBy === "old") {
      list = list.sort(
        (a, b) =>
          new Date(a.savedAt || a.dueDate || "").getTime() -
          new Date(b.savedAt || b.dueDate || "").getTime()
      );
    } else if (sortBy === "amountDesc") {
      list = list.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sortBy === "amountAsc") {
      list = list.sort((a, b) => (a.total || 0) - (b.total || 0));
    }

    return list;
  }, [invoices, query, sortBy]);

  // actions
  const onPreview = (inv: SavedInvoice) => {
    setPreviewInvoice(inv);
    setPreviewOpen(true);
  };

  const onEdit = (inv: SavedInvoice) => {
    // set a helper key for the builder to prefill if you add that logic later
    localStorage.setItem("editInvoice", JSON.stringify(inv));
    navigate(`/dashboard/new-invoice?id=${inv.id}`);
  };

  const onDuplicate = (inv: SavedInvoice) => {
    const copy: SavedInvoice = {
      ...inv,
      id: Date.now(),
      invoiceNumber: `${inv.invoiceNumber || "DRAFT"}-COPY`,
      savedAt: new Date().toISOString(),
    };
    const list = [copy, ...invoices];
    setInvoices(list);
    saveInvoices(list);
  };

  const onDelete = (id: SavedInvoice["id"]) => {
    const list = invoices.filter((i) => i.id !== id);
    setInvoices(list);
    saveInvoices(list);
  };

  const onSortChange = (val: typeof sortBy) => setSortBy(val);

  // ui
  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors p-6 md:p-10">
      {/* page header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Saved Invoices</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Search, sort and manage your stored invoices
          </p>
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="pl-8 w-64"
              placeholder="Search by client or number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange("new")}>Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("old")}>Oldest first</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange("amountDesc")}>Amount high to low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange("amountAsc")}>Amount low to high</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={() => navigate("/dashboard/new-invoice")}>
            + New Invoice
          </Button>
        </div>
      </div>

      <Separator className="my-6 max-w-6xl mx-auto" />

      {/* empty state */}
      {filtered.length === 0 && (
        <div className="max-w-6xl mx-auto">
          <Card className="p-10 bg-white dark:bg-neutral-900 border dark:border-neutral-700">
            <h3 className="text-lg font-semibold">No invoices found</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Try changing your search or create a new invoice
            </p>
            <Button className="mt-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={() => navigate("/dashboard/new-invoice")}>
              Create Invoice
            </Button>
          </Card>
        </div>
      )}

      {/* grid */}
      <div className="max-w-6xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="group relative rounded-2xl border bg-white dark:bg-neutral-900 dark:border-neutral-700 shadow-sm overflow-hidden"
          >
            {/* header */}
            <div className="p-4 border-b dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{inv.template || "classic"}</Badge>
                <span className="text-xs text-gray-500">
                  {new Date(inv.savedAt || inv.issueDate || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-70 group-hover:opacity-100">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onPreview(inv)}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(inv)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit in builder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(inv)}>
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(inv.id)}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* body */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-500">Invoice</div>
                  <div className="text-lg font-semibold">#{inv.invoiceNumber || "DRAFT"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-lg font-bold">{fmt(inv.currency || "INR", inv.total || 0)}</div>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <div className="text-gray-500">From</div>
                <div className="font-medium">{inv.from?.name || "-"}</div>
              </div>

              <div className="mt-2 text-sm">
                <div className="text-gray-500">Bill to</div>
                <div className="font-medium">{inv.to?.name || "-"}</div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <Button size="sm" variant="outline" onClick={() => onPreview(inv)}>
                    View
                  </Button>
                  <Button size="sm" onClick={() => onEdit(inv)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice preview</DialogTitle>
            <DialogDescription>Read only preview of the selected invoice</DialogDescription>
          </DialogHeader>

          {previewInvoice ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-extrabold">INVOICE</div>
                  <div className="text-sm text-gray-500">#{previewInvoice.invoiceNumber || "DRAFT"}</div>
                </div>
                <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                  <div>Issue: {previewInvoice.issueDate || "-"}</div>
                  <div>Due: {previewInvoice.dueDate || "-"}</div>
                  <div>Currency: {previewInvoice.currency || "INR"}</div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-1">From</div>
                  <div className="text-sm">
                    {previewInvoice.from?.name}<br />
                    {previewInvoice.from?.address}<br />
                    {[previewInvoice.from?.city, previewInvoice.from?.zip].filter(Boolean).join(" ")}<br />
                    {previewInvoice.from?.country}<br />
                    {previewInvoice.from?.email}<br />
                    {previewInvoice.from?.phone}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Bill To</div>
                  <div className="text-sm">
                    {previewInvoice.to?.name}<br />
                    {previewInvoice.to?.address}<br />
                    {[previewInvoice.to?.city, previewInvoice.to?.zip].filter(Boolean).join(" ")}<br />
                    {previewInvoice.to?.country}<br />
                    {previewInvoice.to?.email}<br />
                    {previewInvoice.to?.phone}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border dark:border-neutral-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th className="text-left p-3">Item</th>
                      <th className="text-right p-3">Qty</th>
                      <th className="text-right p-3">Rate</th>
                      <th className="text-right p-3">Tax %</th>
                      <th className="text-right p-3">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items?.map((it) => {
                      const line = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                      return (
                        <tr key={String(it.id)} className="border-t dark:border-neutral-700">
                          <td className="p-3">
                            <div className="font-medium">{it.name || "-"}</div>
                            {it.description && (
                              <div className="text-xs text-gray-500 mt-1">{it.description}</div>
                            )}
                          </td>
                          <td className="p-3 text-right">{Number(it.qty) || 0}</td>
                          <td className="p-3 text-right">{fmt(previewInvoice.currency || "INR", Number(it.rate) || 0)}</td>
                          <td className="p-3 text-right">{Number(it.taxPct) || 0}%</td>
                          <td className="p-3 text-right">{fmt(previewInvoice.currency || "INR", line)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-2">Notes</div>
                  <div className="text-sm whitespace-pre-line">
                    {previewInvoice.notes || "-"}
                  </div>
                  <div className="font-semibold mt-4 mb-2">Payment Terms</div>
                  <div className="text-sm whitespace-pre-line">
                    {previewInvoice.terms || "-"}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border dark:border-neutral-700">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {fmt(previewInvoice.currency || "INR",
                        previewInvoice.items?.reduce((s, it) => s + (Number(it.qty)||0)*(Number(it.rate)||0), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Per item tax</span>
                    <span className="font-medium">
                      {fmt(previewInvoice.currency || "INR",
                        previewInvoice.items?.reduce((s, it) => {
                          const base = (Number(it.qty)||0)*(Number(it.rate)||0);
                          return s + base * ((Number(it.taxPct)||0)/100);
                        }, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Discount</span>
                    <span className="font-medium">- {fmt(previewInvoice.currency || "INR", previewInvoice.discount || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Shipping</span>
                    <span className="font-medium">{fmt(previewInvoice.currency || "INR", previewInvoice.shipping || 0)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between py-1 text-lg font-bold">
                    <span>Total</span>
                    <span>{fmt(previewInvoice.currency || "INR", previewInvoice.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            {previewInvoice && (
              <>
                <Button variant="secondary" onClick={() => onDuplicate(previewInvoice)}>Duplicate</Button>
                <Button onClick={() => onEdit(previewInvoice)}>Edit in builder</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
