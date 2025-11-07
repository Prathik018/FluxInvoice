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
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// this defines the party structure
type Party = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
};

// this defines each line item
type LineItem = {
  id: number;
  name: string;
  qty: number;
  price: number; // renamed from rate to price
  description?: string;
  gstPct?: number; // renamed from taxPct to gstPct
};

// currency option type
type Currency = {
  code: string;
  name: string;
  flag: string; // using emoji flag as a simple logo
};

// at least 10 currencies
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
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" }
];

// theme keys
type ThemeKey = "red" | "green" | "blue" | "orange" | "black";

const THEMES: Record<
  ThemeKey,
  {
    name: string;
    primary: string;
    primarySoft: string;
    primaryBorder: string;
    onPrimary: string;
  }
> = {
  red: {
    name: "Red",
    primary: "#ef4444",
    primarySoft: "#fee2e2",
    primaryBorder: "#fecaca",
    onPrimary: "#ffffff"
  },
  green: {
    name: "Green",
    primary: "#10b981",
    primarySoft: "#d1fae5",
    primaryBorder: "#a7f3d0",
    onPrimary: "#062e24"
  },
  blue: {
    name: "Blue",
    primary: "#3b82f6",
    primarySoft: "#dbeafe",
    primaryBorder: "#bfdbfe",
    onPrimary: "#0b1a33"
  },
  orange: {
    name: "Orange",
    primary: "#f59e0b",
    primarySoft: "#fef3c7",
    primaryBorder: "#fde68a",
    onPrimary: "#291a00"
  },
  black: {
    name: "Black",
    primary: "#111827",
    primarySoft: "#e5e7eb",
    primaryBorder: "#d1d5db",
    onPrimary: "#ffffff"
  }
};

export default function NewInvoice() {
  // theme
  const [themeKey, setThemeKey] = useState<ThemeKey>("blue");
  const theme = THEMES[themeKey];

  // payment details
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  // bill from
  const [from, setFrom] = useState<Party>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: ""
  });

  // bill to
  const [to, setTo] = useState<Party>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: ""
  });

  // logo and signature
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<string | null>(null);

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // invoice meta
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  // currency selection using dropdown
  const [currency, setCurrency] = useState<string>("INR");

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  // items
  const [items, setItems] = useState<LineItem[]>([
    { id: Date.now(), name: "", qty: 0, price: 0, description: "", gstPct: 0 }
  ]);

  // charges
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);

  // notes and terms
  const [notes, setNotes] = useState<string>("");
  const [terms, setTerms] = useState<string>("");

  // preview ref
  const previewRef = useRef<HTMLDivElement>(null);

  // item add
  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), name: "", qty: 1, price: 0, description: "", gstPct: 0 }
    ]);
  };

  // item remove
  const removeItem = (id: number) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // item update
  const updateItem = (id: number, patch: Partial<LineItem>) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)));
  };

  // totals
  const { subtotal, perItemGstTotal, total } = useMemo(() => {
    const _subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const _perItemGst = items.reduce((sum, it) => {
      const line = (Number(it.qty) || 0) * (Number(it.price) || 0);
      const pct = Number(it.gstPct) || 0;
      return sum + line * (pct / 100);
    }, 0);
    const _total = _subtotal + _perItemGst - (Number(discount) || 0) + (Number(shipping) || 0);
    return { subtotal: _subtotal, perItemGstTotal: _perItemGst, total: _total };
  }, [items, discount, shipping]);

  // currency formatter
  const fmt = (n: number) =>
    `${currency} ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  // pdf generator
  const downloadPDF = async () => {
    if (!previewRef.current) return;

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: "#FFFFFF",
      useCORS: true,
      onclone: doc => {
        const root = doc.querySelector("html");
        root?.classList.remove("dark");
        const all = doc.querySelectorAll<HTMLElement>("*");
        all.forEach(el => {
          const style = getComputedStyle(el);
          if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "white";
          if (style.color.includes("oklch")) el.style.color = "black";
          if (style.borderColor.includes("oklch")) el.style.borderColor = "black";
        });
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const paddingTop = 40;
    const paddingBottom = 40;
    const availableHeight = pageHeight - paddingTop - paddingBottom;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const scale = Math.min(pageWidth / imgWidth, availableHeight / imgHeight);
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;

    const x = (pageWidth - finalWidth) / 2;
    const y = paddingTop;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(`invoice_${invoiceNumber || ""}.pdf`);
  };

  // save invoice
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
      savedAt: new Date().toISOString()
    };

    const saved = JSON.parse(localStorage.getItem("invoices") || "[]");
    saved.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(saved));

    setShowSaveDialog(true);
  };

  // theme bubble button
  const ThemeBubble = ({
    color,
    label,
    active,
    onClick
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
      style={{
        backgroundColor: color,
        borderColor: "rgba(0,0,0,0.08)"
      }}
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
    <div className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors flex flex-col lg:flex-row">
      {/* left form panel */}
      <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto space-y-12 w-full">
        {/* top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl md:text-3xl font-bold">Create Invoice</h1>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={saveInvoice}>
              Save Invoice
            </Button>
            <Button className="text-white" style={{ backgroundColor: theme.primary }} onClick={downloadPDF}>
              Download PDF
            </Button>
          </div>
        </motion.div>

        <Separator />

        {/* bill from */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Bill From</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Your name or company</label>
              <Input placeholder="Enter your business name" value={from.name} onChange={e => setFrom({ ...from, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="example@email.com" value={from.email} onChange={e => setFrom({ ...from, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone number</label>
              <Input placeholder="+91 9876543210" value={from.phone} onChange={e => setFrom({ ...from, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input placeholder="Street and area" value={from.address} onChange={e => setFrom({ ...from, address: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <Input placeholder="City" value={from.city} onChange={e => setFrom({ ...from, city: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Zip code</label>
              <Input placeholder="400001" value={from.zip} onChange={e => setFrom({ ...from, zip: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input placeholder="India" value={from.country} onChange={e => setFrom({ ...from, country: e.target.value })} />
            </div>
          </div>
        </section>

        {/* bill to */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Bill To</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Client name or company</label>
              <Input placeholder="Client or company name" value={to.name} onChange={e => setTo({ ...to, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Client email</label>
              <Input placeholder="client@email.com" value={to.email} onChange={e => setTo({ ...to, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Client phone</label>
              <Input placeholder="+91 9000000000" value={to.phone} onChange={e => setTo({ ...to, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input placeholder="Street and area" value={to.address} onChange={e => setTo({ ...to, address: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <Input placeholder="City" value={to.city} onChange={e => setTo({ ...to, city: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Zip code</label>
              <Input placeholder="400001" value={to.zip} onChange={e => setTo({ ...to, zip: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input placeholder="India" value={to.country} onChange={e => setTo({ ...to, country: e.target.value })} />
            </div>
          </div>
        </section>

        {/* invoice details */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Issue Date */}
            <div>
              <label className="text-sm font-medium">Issue Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mt-1">
                    {issueDate ? format(new Date(issueDate), "PPP") : "Select date"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate ? new Date(issueDate) : undefined}
                    onSelect={d => {
                      if (!d) return;
                      setIssueDate(format(d, "yyyy-MM-dd"));
                    }}
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
                  <Button variant="outline" className="w-full justify-between mt-1">
                    {dueDate ? format(new Date(dueDate), "PPP") : "Select date"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate ? new Date(dueDate) : undefined}
                    onSelect={d => {
                      if (!d) return;
                      setDueDate(format(d, "yyyy-MM-dd"));
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Currency Dropdown */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Currency</label>
              <div className="mt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden>
                          {selectedCurrency.flag}
                        </span>
                        <span className="font-medium">{selectedCurrency.code}</span>
                        <span className="text-muted-foreground">{selectedCurrency.name}</span>
                      </span>
                      <ChevronDownIcon className="h-4 w-4 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-w-md">
                    <DropdownMenuLabel>Select currency</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {CURRENCIES.map(curr => (
                      <DropdownMenuItem
                        key={curr.code}
                        onClick={() => setCurrency(curr.code)}
                        className="flex items-center gap-3"
                      >
                        <span className="text-lg" aria-hidden>
                          {curr.flag}
                        </span>
                        <span className="w-14 font-semibold">{curr.code}</span>
                        <span className="text-muted-foreground">{curr.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Invoice number</label>
              <Input placeholder="INV-2025-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Branding and Theme */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Branding</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="text-sm font-medium">Upload Logo</label>
              <Input
                type="file"
                accept="image/*"
                className="mt-2 cursor-pointer"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setLogoFile(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />

              {logoFile && <img src={logoFile} className="mt-3 h-20 object-contain rounded-md border" />}
            </div>

            {/* Signature Upload */}
            <div>
              <label className="text-sm font-medium">Upload Signature</label>
              <Input
                type="file"
                accept="image/*"
                className="mt-2 cursor-pointer"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setSignatureFile(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />

              {signatureFile && <img src={signatureFile} className="mt-3 h-20 object-contain rounded-md border" />}
            </div>
          </div>

          {/* Theme bubbles */}
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

        {/* payment details */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bank name</label>
              <Input placeholder="HDFC Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Account number</label>
              <Input placeholder="1234567890" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Account holder name</label>
              <Input placeholder="Your full name" value={accountName} onChange={e => setAccountName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">UPI id</label>
              <Input placeholder="name@bank" value={upiId} onChange={e => setUpiId(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">UPI name</label>
              <Input placeholder="Your UPI name" value={upiName} onChange={e => setUpiName(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Product Information */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Product Information</h2>
            <Button onClick={addItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-6">
            {items.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border dark:border-neutral-700 rounded-xl p-5 bg-white dark:bg-neutral-900"
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="font-semibold">Item</h3>
                  <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Item name</label>
                    <Input placeholder="Service or product" value={item.name} onChange={e => updateItem(item.id, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input type="number" placeholder="0.00" value={item.qty || ""} onChange={e => updateItem(item.id, { qty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input type="number" placeholder="0.00" value={item.price || ""} onChange={e => updateItem(item.id, { price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{currency === "INR" ? "GST" : "Tax"} percent</label>
                    <Input type="number" placeholder="0.00" value={item.gstPct || ""} onChange={e => updateItem(item.id, { gstPct: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Optional description" value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* charges */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Charges</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Discount amount</label>
              <Input type="number" placeholder="0.00" value={discount || ""} onChange={e => setDiscount(Number(e.target.value))} />
            </div>

            <div>
              <label className="text-sm font-medium">Shipping amount</label>
              <Input type="number" placeholder="0.00" value={shipping || ""} onChange={e => setShipping(Number(e.target.value))} />
            </div>
          </div>
        </section>

        {/* notes and terms */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Notes and Terms</h2>
          <div className="mb-3">
            <label className="text-sm font-medium">Notes</label>
            <Textarea placeholder="Optional notes for the client" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Payment terms</label>
            <Textarea placeholder="Due upon receipt, Net 15, Net 30, etc" value={terms} onChange={e => setTerms(e.target.value)} />
          </div>
        </section>

        <div className="pb-24" />
      </div>

      {/* right preview */}
      <div className="w-full lg:w-[40%] bg-white dark:bg-neutral-900 border-t lg:border-l dark:border-neutral-700 shadow-xl">
        {/* Sticky wrapper */}
        <div className="p-6 md:p-8 lg:p-10 sticky top-4 overflow-auto max-h-[calc(100vh-2rem)]">
          <div ref={previewRef} className="max-w-[700px] mx-auto bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl border dark:border-neutral-700" style={{ overflow: "visible" }}>
            {/* Top accent strip */}
            <div style={{ backgroundColor: theme.primary }} className="h-2 rounded-t-xl" />

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {logoFile ? (
                    <img src={logoFile} className="h-12 w-auto object-contain" alt="logo" />
                  ) : (
                    <div className="h-12 w-12 rounded-md grid place-items-center text-xs font-semibold" style={{ backgroundColor: theme.primarySoft, color: theme.primary }}>
                      LOGO
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight mt-1">{from.name || "Your Business"}</h2>
                    {from.email ? <p className="text-xs text-gray-600 dark:text-gray-400">{from.email}</p> : null}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 text-sm font-bold rounded-md" style={{ backgroundColor: theme.primary, color: theme.onPrimary }}>
                    INVOICE
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    No: <span className="font-semibold">{invoiceNumber || "-"}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Issue: <span className="font-medium">{issueDate ? format(new Date(issueDate), "PPP") : "-"}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
              <div className="mt-6 overflow-hidden rounded-lg border dark:border-neutral-700">
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
                    {items.map(it => {
                      const line = (Number(it.qty) || 0) * (Number(it.price) || 0);
                      return (
                        <tr key={it.id} className="border-top border-t dark:border-neutral-700 align-top">
                          <td className="p-3">
                            <div className="font-medium">{it.name || "-"}</div>
                            {it.description ? (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{it.description}</div>
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

              {/* Totals and notes */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: theme.primary }}>
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{notes || "-"}</p>

                  <h4 className="font-semibold mt-4 mb-2" style={{ color: theme.primary }}>
                    Payment Terms
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{terms || "-"}</p>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2" style={{ color: theme.primary }}>
                      Payment Details
                    </h4>
                    <p className="text-sm leading-6">
                      {bankName && (
                        <>
                          Bank: {bankName}
                          <br />
                        </>
                      )}
                      {accountNumber && (
                        <>
                          Account No: {accountNumber}
                          <br />
                        </>
                      )}
                      {accountName && (
                        <>
                          Account Name: {accountName}
                          <br />
                        </>
                      )}
                      {upiId && (
                        <>
                          UPI ID: {upiId}
                          <br />
                        </>
                      )}
                      {upiName && (
                        <>
                          UPI Name: {upiName}
                          <br />
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg p-4 border shadow-sm" style={{ backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }}>
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
                    <span className="px-2 py-1 rounded" style={{ backgroundColor: theme.primary, color: theme.onPrimary }}>
                      {fmt(total)}
                    </span>
                  </div>
                </div>

                {signatureFile && (
                  <div className="md:col-span-2 flex justify-end">
                    <div className="text-right">
                      <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">Authorized Signature</p>
                      <img src={signatureFile} className="h-20 object-contain ml-auto" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* actions for small screens */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="secondary" onClick={saveInvoice}>Save</Button>
            <Button className="text-white" style={{ backgroundColor: theme.primary }} onClick={downloadPDF}>Download PDF</Button>
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invoice Saved</AlertDialogTitle>
            <AlertDialogDescription>
              Your invoice has been saved successfully. You can find it inside <strong>Saved Invoices</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSaveDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}




