"use client";

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

import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ArrowUpDown,
} from "lucide-react";

// ------------------ Types ------------------

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
  template?: string;
  total: number;
  savedAt?: string;
};

// ------------------ Helpers ------------------

function loadInvoices(): SavedInvoice[] {
  try {
    const raw = localStorage.getItem("invoices");
    return raw ? (JSON.parse(raw) as SavedInvoice[]) : [];
  } catch {
    return [];
  }
}

function saveInvoices(list: SavedInvoice[]) {
  localStorage.setItem("invoices", JSON.stringify(list));
}

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

// ------------------ Component ------------------

export default function SavedInvoices() {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "old" | "amountDesc" | "amountAsc">("new");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<SavedInvoice | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);


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

  // ------------------ Actions ------------------

  const onPreview = (inv: SavedInvoice) => {
    setPreviewInvoice(inv);
    setPreviewOpen(true);
  };

  const onEdit = (inv: SavedInvoice) => {
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

  // ------------------ UI ------------------

  return (
    <main className="min-h-screen spotlight-bg text-white px-6 md:px-10 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Invoices</h1>
          <p className="text-sm text-white/70">Search, sort and manage your stored invoices</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
            <Input
              className="pl-8 w-64 bg-white/10 border-white/20 text-white placeholder-white/50"
              placeholder="Search by client or number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="btn-primary"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-black/80 border-white/20 backdrop-blur-xl text-white"
            >
              <DropdownMenuItem onClick={() => setSortBy("new")}>Newest first</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("old")}>Oldest first</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("amountDesc")}>Amount high → low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amountAsc")}>Amount low → high</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="btn-primary rounded-full" onClick={() => navigate("/dashboard/new-invoice")}>
            + New Invoice
          </Button>
        </div>
      </div>

      <Separator className="my-6 max-w-6xl mx-auto bg-white/20" />

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="max-w-6xl mx-auto">
          <Card className="p-10 bg-white/10 backdrop-blur-xl border-white/20 text-white rounded-2xl">
            <h3 className="text-lg font-semibold">No invoices found</h3>
            <p className="text-white/70 mt-2">Try changing your search or create a new invoice</p>
            <Button className="btn-primary mt-4 rounded-full" onClick={() => navigate("/dashboard/new-invoice")}>
              Create Invoice
            </Button>
          </Card>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((inv) => (
          <div
            key={inv.id}
            className="group relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white capitalize">{inv.template || "classic"}</Badge>
                <span className="text-xs text-white/60">
                  {new Date(inv.savedAt || inv.issueDate || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-black/80 border-white/20 backdrop-blur-xl text-white"
                >
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

            {/* Body */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-white/60">Invoice</div>
                  <div className="text-lg font-semibold">#{inv.invoiceNumber || "DRAFT"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60">Total</div>
                  <div className="text-lg font-bold">
                    {fmt(inv.currency || "INR", inv.total || 0)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <div className="text-white/60">From</div>
                <div className="font-medium">{inv.from?.name || "-"}</div>
              </div>

              <div className="mt-2 text-sm">
                <div className="text-white/60">Bill to</div>
                <div className="font-medium">{inv.to?.name || "-"}</div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-white/60">
                  Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    size="sm"
                    variant="outline"
                    className="btn-primary"
                    onClick={() => onPreview(inv)}
                  >
                    View
                  </Button>

                  <Button size="sm" className="btn-primary" onClick={() => onEdit(inv)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl bg-black/80 backdrop-blur-xl border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Invoice preview</DialogTitle>
            <DialogDescription className="text-white/60">
              Read-only preview of the selected invoice
            </DialogDescription>
          </DialogHeader>

          {previewInvoice && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-extrabold">INVOICE</div>
                  <div className="text-sm text-white/70">
                    #{previewInvoice.invoiceNumber || "DRAFT"}
                  </div>
                </div>

                <div className="text-right text-sm text-white/70">
                  <div>Issue: {previewInvoice.issueDate || "-"}</div>
                  <div>Due: {previewInvoice.dueDate || "-"}</div>
                  <div>Currency: {previewInvoice.currency || "INR"}</div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* From / To */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-1">From</div>
                  <div className="text-sm text-white/80">
                    {previewInvoice.from?.name}
                    <br />
                    {previewInvoice.from?.address}
                    <br />
                    {[previewInvoice.from?.city, previewInvoice.from?.zip]
                      .filter(Boolean)
                      .join(" ")}
                    <br />
                    {previewInvoice.from?.country}
                    <br />
                    {previewInvoice.from?.email}
                    <br />
                    {previewInvoice.from?.phone}
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-1">Bill To</div>
                  <div className="text-sm text-white/80">
                    {previewInvoice.to?.name}
                    <br />
                    {previewInvoice.to?.address}
                    <br />
                    {[previewInvoice.to?.city, previewInvoice.to?.zip]
                      .filter(Boolean)
                      .join(" ")}
                    <br />
                    {previewInvoice.to?.country}
                    <br />
                    {previewInvoice.to?.email}
                    <br />
                    {previewInvoice.to?.phone}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden border border-white/15 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-white/10">
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
                      const line =
                        (Number(it.qty) || 0) * (Number(it.rate) || 0);

                      return (
                        <tr key={String(it.id)} className="border-t border-white/10">
                          <td className="p-3">
                            <div className="font-medium">{it.name || "-"}</div>
                            {it.description && (
                              <div className="text-xs text-white/60 mt-1">
                                {it.description}
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-right">{Number(it.qty)}</td>

                          <td className="p-3 text-right">
                            {fmt(
                              previewInvoice.currency || "INR",
                              Number(it.rate) || 0
                            )}
                          </td>

                          <td className="p-3 text-right">
                            {Number(it.taxPct) || 0}%
                          </td>

                          <td className="p-3 text-right">
                            {fmt(previewInvoice.currency || "INR", line)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-2">Notes</div>
                  <div className="text-sm whitespace-pre-line text-white/80">
                    {previewInvoice.notes || "-"}
                  </div>

                  <div className="font-semibold mt-4 mb-2">Payment Terms</div>
                  <div className="text-sm whitespace-pre-line text-white/80">
                    {previewInvoice.terms || "-"}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/15">
                  <div className="flex justify-between py-1">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {fmt(
                        previewInvoice.currency || "INR",
                        previewInvoice.items?.reduce(
                          (s, it) =>
                            s +
                            (Number(it.qty) || 0) * (Number(it.rate) || 0),
                          0
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span>Tax</span>
                    <span className="font-medium">
                      {fmt(
                        previewInvoice.currency || "INR",
                        previewInvoice.items?.reduce((s, it) => {
                          const base =
                            (Number(it.qty) || 0) * (Number(it.rate) || 0);
                          return (
                            s +
                            base * ((Number(it.taxPct) || 0) / 100)
                          );
                        }, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span>Discount</span>
                    <span className="font-medium">
                      - {fmt(previewInvoice.currency || "INR", previewInvoice.discount || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {fmt(previewInvoice.currency || "INR", previewInvoice.shipping || 0)}
                    </span>
                  </div>

                  <Separator className="my-3 bg-white/10" />

                  <div className="flex justify-between py-1 text-lg font-bold">
                    <span>Total</span>
                    <span>{fmt(previewInvoice.currency || "INR", previewInvoice.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="btn-primary"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>

            {previewInvoice && (
              <>
                <Button
                  variant="secondary"
                  className="btn-primary"
                  onClick={() => onDuplicate(previewInvoice)}
                >
                  Duplicate
                </Button>

                
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
