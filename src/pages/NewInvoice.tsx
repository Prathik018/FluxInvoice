"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Check, ChevronDownIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


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
  id: number;
  name: string;
  qty: number;
  price: number; // rate -> price
  description?: string;
  gstPct?: number; // taxPct -> gstPct
};

type Currency = { code: string; name: string; flag: string };

const CURRENCIES: Currency[] = [
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
];

type ThemeKey = "red" | "green" | "blue" | "orange" | "black";

const THEMES: Record<
  ThemeKey,
  { name: string; primary: string; primarySoft: string; primaryBorder: string; onPrimary: string }
> = {
  red: { name: "Red", primary: "#ef4444", primarySoft: "#fee2e2", primaryBorder: "#fecaca", onPrimary: "#ffffff" },
  green: { name: "Green", primary: "#10b981", primarySoft: "#d1fae5", primaryBorder: "#a7f3d0", onPrimary: "#062e24" },
  blue: { name: "Blue", primary: "#3b82f6", primarySoft: "#dbeafe", primaryBorder: "#bfdbfe", onPrimary: "#0b1a33" },
  orange: { name: "Orange", primary: "#f59e0b", primarySoft: "#fef3c7", primaryBorder: "#fde68a", onPrimary: "#291a00" },
  black: { name: "Black", primary: "#111827", primarySoft: "#e5e7eb", primaryBorder: "#d1d5db", onPrimary: "#ffffff" },
};


export default function NewInvoice() {
  /* Theme */
  const [themeKey, setThemeKey] = useState<ThemeKey>("blue");
  const theme = THEMES[themeKey];

  /* Payment details */
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  /* Parties */
  const [from, setFrom] = useState<Party>({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "" });
  const [to, setTo] = useState<Party>({ name: "", email: "", phone: "", address: "", city: "", zip: "", country: "" });

  /* Branding */
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<string | null>(null);

  /* Save dialog */
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  /* Invoice meta */
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  /* Currency */
  const [currency, setCurrency] = useState<string>("INR");
  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  /* Items */
  const [items, setItems] = useState<LineItem[]>([
    { id: Date.now(), name: "", qty: 0, price: 0, description: "", gstPct: 0 },
  ]);

  /* Charges */
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);

  /* Notes & terms */
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>("");

  /* Preview ref */
  const previewRef = useRef<HTMLDivElement>(null);

  /* Items operations */
  const addItem = () =>
    setItems((prev) => [...prev, { id: Date.now(), name: "", qty: 1, price: 0, description: "", gstPct: 0 }]);

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  /* Totals */
  const { subtotal, perItemGstTotal, total } = useMemo(() => {
    const _subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const _perItemGst = items.reduce((sum, it) => {
      const line = (Number(it.qty) || 0) * (Number(it.price) || 0);
      return sum + line * ((Number(it.gstPct) || 0) / 100);
    }, 0);
    const _total = _subtotal + _perItemGst - (Number(discount) || 0) + (Number(shipping) || 0);
    return { subtotal: _subtotal, perItemGstTotal: _perItemGst, total: _total };
  }, [items, discount, shipping]);

  /* Currency format */
  const fmt = (n: number) =>
    `${currency} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /* PDF generator */
  const downloadPDF = async () => {
    if (!previewRef.current) return;

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: "#FFFFFF",
      useCORS: true,
      onclone: (doc) => {
        const root = doc.querySelector("html");
        root?.classList.remove("dark");
        const all = doc.querySelectorAll<HTMLElement>("*");
        all.forEach((el) => {
          const style = getComputedStyle(el);
          if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "white";
          if (style.color.includes("oklch")) el.style.color = "black";
          if (style.borderColor.includes("oklch")) el.style.borderColor = "black";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const paddingTop = 40;
    const paddingBottom = 40;
    const availableHeight = pageHeight - paddingTop - paddingBottom;

    const scale = Math.min(pageWidth / canvas.width, availableHeight / canvas.height);
    const finalWidth = canvas.width * scale;
    const finalHeight = canvas.height * scale;
    const x = (pageWidth - finalWidth) / 2;
    const y = paddingTop;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(`invoice_${invoiceNumber || ""}.pdf`);
  };

  /* Save invoice */
  const saveInvoice = () => {
    const invoice = {
      id: Date.now(),
      from,
      to,
      issueDate,
      dueDate,
      invoiceNumber,
      currency,
      items,
      discount,
      shipping,
      notes,
      terms,
      bankName,
      accountNumber,
      accountName,
      upiId,
      upiName,
      total,
      themeKey,
      savedAt: new Date().toISOString(),
    };

    const saved = JSON.parse(localStorage.getItem("invoices") || "[]");
    saved.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(saved));
    setShowSaveDialog(true);
  };

  /* Theme bubble button */
  const ThemeBubble = ({
    color,
    label,
    active,
    onClick,
  }: {
    color: string;
    label: string;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="relative h-8 w-8 rounded-full border transition-transform hover:scale-105 focus:outline-none"
      style={{ backgroundColor: color, borderColor: "rgba(255,255,255,0.25)" }}
      title={label}
    >
      {active && (
        <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <Check className="h-4 w-4" color="#ffffff" />
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );


  return (
    <main className="min-h-screen spotlight-bg text-white ">
      {/* container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12 ">
        {/* top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Invoice</h1>

          <div className="flex gap-3">
            <Button className="btn-primary rounded-full" onClick={saveInvoice}>
              Save Invoice
            </Button>
            <Button
              className="btn-primary rounded-full"
              style={{ backgroundColor: "#fff", color: "#000" }}
              onClick={downloadPDF}
            >
              Download PDF
            </Button>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* LEFT: FORM (scrollable on desktop) */}
          <div
            className="
              flex-1 
              min-h-[60vh]
              lg:max-h-[calc(100vh-8rem)]
              overflow-y-auto
              pr-0 lg:pr-2
              space-y-8
              bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl
              p-5 md:p-8
            "
          >
            {/* From */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Bill From</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput label="Your name or company" value={from.name} onChange={(v) => setFrom({ ...from, name: v })} />
                <LabeledInput label="Email" value={from.email} onChange={(v) => setFrom({ ...from, email: v })} />
                <LabeledInput label="Phone number" value={from.phone} onChange={(v) => setFrom({ ...from, phone: v })} />
                <LabeledInput label="Address" value={from.address} onChange={(v) => setFrom({ ...from, address: v })} />
                <LabeledInput label="City" value={from.city} onChange={(v) => setFrom({ ...from, city: v })} />
                <LabeledInput label="Zip code" value={from.zip} onChange={(v) => setFrom({ ...from, zip: v })} />
                <LabeledInput label="Country" value={from.country} onChange={(v) => setFrom({ ...from, country: v })} />
              </div>
            </section>

            {/* To */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Bill To</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput label="Client name or company" value={to.name} onChange={(v) => setTo({ ...to, name: v })} />
                <LabeledInput label="Client email" value={to.email} onChange={(v) => setTo({ ...to, email: v })} />
                <LabeledInput label="Client phone" value={to.phone} onChange={(v) => setTo({ ...to, phone: v })} />
                <LabeledInput label="Address" value={to.address} onChange={(v) => setTo({ ...to, address: v })} />
                <LabeledInput label="City" value={to.city} onChange={(v) => setTo({ ...to, city: v })} />
                <LabeledInput label="Zip code" value={to.zip} onChange={(v) => setTo({ ...to, zip: v })} />
                <LabeledInput label="Country" value={to.country} onChange={(v) => setTo({ ...to, country: v })} />
              </div>
            </section>

            {/* Invoice Details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Issue Date */}
                <div>
                  <label className="text-sm font-medium">Issue Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between mt-1  bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                        {issueDate ? format(new Date(issueDate), "PPP") : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={issueDate ? new Date(issueDate) : undefined}
                        onSelect={(d) => d && setIssueDate(format(d, "yyyy-MM-dd"))}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between mt-1 bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                        {dueDate ? format(new Date(dueDate), "PPP") : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 opacity-60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate ? new Date(dueDate) : undefined}
                        onSelect={(d) => d && setDueDate(format(d, "yyyy-MM-dd"))}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Currency */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Currency</label>
                  <div className="mt-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between border bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                          <span className="flex items-center gap-2">
                            <span className="text-lg" aria-hidden>{selectedCurrency.flag}</span>
                            <span className="font-medium">{selectedCurrency.code}</span>
                            <span className="text-white/60">{selectedCurrency.name}</span>
                          </span>
                          <ChevronDownIcon className="h-4 w-4 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-w-md ">
                        <DropdownMenuLabel>Select currency</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {CURRENCIES.map((curr) => (
                          <DropdownMenuItem
                            key={curr.code}
                            onClick={() => setCurrency(curr.code)}
                            className="flex items-center gap-3"
                          >
                            <span className="text-lg" aria-hidden>{curr.flag}</span>
                            <span className="w-14 font-semibold">{curr.code}</span>
                            <span className="text-muted-foreground">{curr.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div>
                  <LabeledInput label="Invoice number" value={invoiceNumber} onChange={(v) => setInvoiceNumber(v)} />
                </div>
              </div>
            </section>

            {/* Branding */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Branding</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="text-sm font-medium">Upload Logo</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-2 cursor-pointer bg-white/10 border-white/20 text-white placeholder-white/60"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setLogoFile(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                  {logoFile && <img src={logoFile} className="mt-3 h-20 object-contain rounded-md border border-white/20" />}
                </div>

                {/* Signature */}
                <div>
                  <label className="text-sm font-medium">Upload Signature</label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-2 cursor-pointer bg-white/10 border-white/20 text-white placeholder-white/60"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setSignatureFile(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                  {signatureFile && <img src={signatureFile} className="mt-3 h-20 object-contain rounded-md border border-white/20" />}
                </div>
              </div>

              {/* Theme */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Theme Color</h3>
                <div className="flex items-center gap-3">
                  <ThemeBubble color={THEMES.red.primary} label="Red" active={themeKey === "red"} onClick={() => setThemeKey("red")} />
                  <ThemeBubble color={THEMES.green.primary} label="Green" active={themeKey === "green"} onClick={() => setThemeKey("green")} />
                  <ThemeBubble color={THEMES.blue.primary} label="Blue" active={themeKey === "blue"} onClick={() => setThemeKey("blue")} />
                  <ThemeBubble color={THEMES.orange.primary} label="Orange" active={themeKey === "orange"} onClick={() => setThemeKey("orange")} />
                  <ThemeBubble color={THEMES.black.primary} label="Black" active={themeKey === "black"} onClick={() => setThemeKey("black")} />
                </div>
              </div>
            </section>

            {/* Payment details */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput label="Bank name" value={bankName} onChange={setBankName} />
                <LabeledInput label="Account number" value={accountNumber} onChange={setAccountNumber} />
                <LabeledInput label="Account holder name" value={accountName} onChange={setAccountName} />
                <LabeledInput label="UPI id" value={upiId} onChange={setUpiId} />
                <LabeledInput label="UPI name" value={upiName} onChange={setUpiName} />
              </div>
            </section>

            {/* Product Information */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold">Product Information</h2>
                <Button onClick={addItem} className="btn-primary rounded-full flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-5 bg-white/5 border border-white/20 backdrop-blur-xl"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-semibold">Item</h3>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="hover:bg-white/10">
                        <Trash2 className="h-5 w-5 text-red-400" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <LabeledInput label="Item name" value={item.name} onChange={(v) => updateItem(item.id, { name: v })} />
                      <LabeledInput
                        label="Quantity"
                        type="number"
                        value={item.qty || ""}
                        onChange={(v) => updateItem(item.id, { qty: Number(v) || 0 })}
                      />
                      <LabeledInput
                        label="Price"
                        type="number"
                        value={item.price || ""}
                        onChange={(v) => updateItem(item.id, { price: Number(v) || 0 })}
                      />
                      <LabeledInput
                        label={currency === "INR" ? "GST percent" : "Tax percent"}
                        type="number"
                        value={item.gstPct || ""}
                        onChange={(v) => updateItem(item.id, { gstPct: Number(v) || 0 })}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Optional description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className="bg-white/5 border-white/20 text-white placeholder-white"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Charges */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Charges</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <LabeledInput
                  label="Discount amount"
                  type="number"
                  value={discount || ""}
                  onChange={(v) => setDiscount(Number(v) || 0)}
                />
                <LabeledInput
                  label="Shipping amount"
                  type="number"
                  value={shipping || ""}
                  onChange={(v) => setShipping(Number(v) || 0)}
                />
              </div>
            </section>

            {/* Notes / Terms */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Notes and Terms</h2>
              <div className="mb-3">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Optional notes for the client"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment terms</label>
                <Textarea
                  placeholder="Due upon receipt, Net 15, Net 30, etc"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/60"
                />
              </div>
            </section>

            <div className="pb-2" />
          </div>

          {/* RIGHT: PREVIEW (sticky on desktop) */}
          <div className="w-full lg:w-[50%] mt-8 lg:mt-0">
            <div className="sticky top-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 md:p-8 shadow-xl">
                <div
                  ref={previewRef}
                  className="max-w-[700px] mx-auto bg-white text-black rounded-xl border overflow-visible"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  {/* Top accent strip */}
                  <div style={{ backgroundColor: theme.primary }} className="h-2 rounded-t-xl" />

                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {logoFile ? (
                          <img src={logoFile} className="h-12 w-auto object-contain" alt="logo" />
                        ) : (
                          <div
                            className="h-12 w-12 rounded-md grid place-items-center text-xs font-semibold"
                            style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                          >
                            LOGO
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
                            {from.name || "Your Business"}
                          </h2>
                          {from.email ? <p className="text-xs text-gray-600">{from.email}</p> : null}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className="inline-block px-3 py-1 text-sm font-bold rounded-md"
                          style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
                        >
                          INVOICE
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          No: <span className="font-semibold">{invoiceNumber || "-"}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Issue: <span className="font-medium">{issueDate ? format(new Date(issueDate), "PPP") : "-"}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: <span className="font-medium">{dueDate ? format(new Date(dueDate), "PPP") : "-"}</span>
                        </p>
                      </div>
                    </div>

                    {/* From / To */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                      <div className="rounded-lg p-4 border" style={{ borderColor: theme.primaryBorder }}>
                        <h3 className="font-semibold mb-2" style={{ color: theme.primary }}>
                          From
                        </h3>
                        <p className="text-sm leading-6">
                          {from.name || "-"}
                          <br />
                          {from.address && (
                            <>
                              {from.address}
                              <br />
                            </>
                          )}
                          {(from.city || from.zip) && (
                            <>
                              {[from.city, from.zip].filter(Boolean).join(" ")}
                              <br />
                            </>
                          )}
                          {from.country && (
                            <>
                              {from.country}
                              <br />
                            </>
                          )}
                          {from.email && (
                            <>
                              {from.email}
                              <br />
                            </>
                          )}
                          {from.phone}
                        </p>
                      </div>

                      <div className="rounded-lg p-4 border" style={{ borderColor: theme.primaryBorder }}>
                        <h3 className="font-semibold mb-2" style={{ color: theme.primary }}>
                          Bill To
                        </h3>
                        <p className="text-sm leading-6">
                          {to.name || "-"}
                          <br />
                          {to.address && (
                            <>
                              {to.address}
                              <br />
                            </>
                          )}
                          {(to.city || to.zip) && (
                            <>
                              {[to.city, to.zip].filter(Boolean).join(" ")}
                              <br />
                            </>
                          )}
                          {to.country && (
                            <>
                              {to.country}
                              <br />
                            </>
                          )}
                          {to.email && (
                            <>
                              {to.email}
                              <br />
                            </>
                          )}
                          {to.phone}
                        </p>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="mt-6 overflow-hidden rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: theme.primarySoft }} className="text-gray-800">
                            <th className="text-left p-3">Item</th>
                            <th className="text-right p-3">Qty</th>
                            <th className="text-right p-3">Price</th>
                            <th className="text-right p-3">{currency === "INR" ? "GST" : "Tax"} %</th>
                            <th className="text-right p-3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it) => {
                            const line = (Number(it.qty) || 0) * (Number(it.price) || 0);
                            return (
                              <tr key={it.id} className="border-t" style={{ borderColor: "#e5e7eb" }}>
                                <td className="p-3 align-top">
                                  <div className="font-medium">{it.name || "-"}</div>
                                  {it.description ? (
                                    <div className="text-xs text-gray-600 mt-1">{it.description}</div>
                                  ) : null}
                                </td>
                                <td className="p-3 text-right">{Number(it.qty) || 0}</td>
                                <td className="p-3 text-right">{fmt(Number(it.price) || 0)}</td>
                                <td className="p-3 text-right">{Number(it.gstPct) || 0}%</td>
                                <td className="p-3 text-right">{fmt(line)}</td>
                              </tr>
                            );
                          })}
                          {items.length === 0 && (
                            <tr>
                              <td className="p-3 text-center text-gray-500" colSpan={5}>
                                No items added
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals & Notes */}
                    <div className="mt-6 grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2" style={{ color: theme.primary }}>
                          Notes
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{notes || "-"}</p>

                        <h4 className="font-semibold mt-4 mb-2" style={{ color: theme.primary }}>
                          Payment Terms
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{terms || "-"}</p>

                        <div className="mt-6">
                          <h4 className="font-semibold mb-2" style={{ color: theme.primary }}>
                            Payment Details
                          </h4>
                          <p className="text-sm leading-6">
                            {bankName && <>Bank: {bankName}<br /></>}
                            {accountNumber && <>Account No: {accountNumber}<br /></>}
                            {accountName && <>Account Name: {accountName}<br /></>}
                            {upiId && <>UPI ID: {upiId}<br /></>}
                            {upiName && <>UPI Name: {upiName}<br /></>}
                          </p>
                        </div>
                      </div>

                      <div
                        className="rounded-lg p-4 shadow-sm"
                        style={{ backgroundColor: theme.primarySoft, border: `1px solid ${theme.primaryBorder}` }}
                      >
                        <div className="flex justify-between py-1">
                          <span>Subtotal</span>
                          <span className="font-medium">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Per item {currency === "INR" ? "GST" : "Tax"}</span>
                          <span className="font-medium">{fmt(perItemGstTotal)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Discount</span>
                          <span className="font-medium">- {fmt(discount || 0)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Shipping</span>
                          <span className="font-medium">{fmt(shipping || 0)}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center py-1 text-lg font-bold">
                          <span>Total</span>
                          <span
                            className="px-2 py-1 rounded"
                            style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
                          >
                            {fmt(total)}
                          </span>
                        </div>
                      </div>

                      {signatureFile && (
                        <div className="md:col-span-2 flex justify-end">
                          <div className="text-right">
                            <p className="text-sm mb-2 text-gray-600">Authorized Signature</p>
                            <img src={signatureFile} className="h-20 object-contain ml-auto" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

               
              </div>
            </div>
          </div>
          {/* END RIGHT */}
        </div>
      </div>

      {/* Save Confirmation */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="bg-white/10 border border-white/20 backdrop-blur-xl text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Invoice Saved</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Your invoice has been saved successfully. You can find it inside <strong>Saved Invoices</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="btn-primary" onClick={() => setShowSaveDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

/* Small helper component  */

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={value as any}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/60"
      />
    </div>
  );
}














