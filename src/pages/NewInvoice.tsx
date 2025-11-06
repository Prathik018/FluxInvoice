"use client";

// this imports libraries and ui
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
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
    rate: number;
    description?: string;
    taxPct?: number;
};

// this is the page component
export default function NewInvoice() {
    // this stores payment details
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [upiId, setUpiId] = useState("");
    const [upiName, setUpiName] = useState("");

    // removed template state
    // const [template, setTemplate] = useState("classic");

    // this stores bill from data
    const [from, setFrom] = useState<Party>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
        country: "",
    });

    // this stores bill to data
    const [to, setTo] = useState<Party>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
        country: "",
    });

    // logo
    const [logoFile, setLogoFile] = useState<string | null>(null);

    // signature
    const [signatureFile, setSignatureFile] = useState<string | null>(null);

    const [showSaveDialog, setShowSaveDialog] = useState(false);



    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setLogoFile(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setSignatureFile(reader.result as string);
        reader.readAsDataURL(file);
    };


    // this stores invoice meta
    const [issueDate, setIssueDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [invoiceNumber, setInvoiceNumber] = useState<string>("");
    const [currency, setCurrency] = useState<string>("INR");

    // this stores items
    const [items, setItems] = useState<LineItem[]>([
        { id: Date.now(), name: "", qty: 0, rate: 0, description: "", taxPct: 0 },
    ]);

    // this stores charges
    const [discount, setDiscount] = useState<number>(0);
    const [shipping, setShipping] = useState<number>(0);

    // this stores notes and terms
    const [notes, setNotes] = useState<string>("");
    const [terms, setTerms] = useState<string>("");

    // this holds preview node
    const previewRef = useRef<HTMLDivElement>(null);

    // this adds an item
    const addItem = () => {
        setItems((prev) => [
            ...prev,
            { id: Date.now(), name: "", qty: 1, rate: 0, description: "", taxPct: 0 },
        ]);
    };

    // this removes an item
    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    // this patches an item
    const updateItem = (id: number, patch: Partial<LineItem>) => {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    };

    // this calculates totals without global tax
    const { subtotal, perItemTaxTotal, total } = useMemo(() => {
        const _subtotal = items.reduce(
            (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0),
            0
        );
        const _perItemTax = items.reduce((sum, it) => {
            const line = (Number(it.qty) || 0) * (Number(it.rate) || 0);
            const pct = Number(it.taxPct) || 0;
            return sum + line * (pct / 100);
        }, 0);
        const _total =
            _subtotal + _perItemTax - (Number(discount) || 0) + (Number(shipping) || 0);
        return { subtotal: _subtotal, perItemTaxTotal: _perItemTax, total: _total };
    }, [items, discount, shipping]);

    // this formats currency
    const fmt = (n: number) =>
        `${currency} ${n.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    // this generates PDF
    const downloadPDF = async () => {
        if (!previewRef.current) return;

        const canvas = await html2canvas(previewRef.current, {
            scale: 2,
            backgroundColor: "#FFFFFF",
            useCORS: true,

            // apply forced light-mode INSIDE cloned DOM ONLY
            onclone: (doc) => {
                const root = doc.querySelector("html");

                // force light mode in clone — NOT in real page
                root?.classList.remove("dark");

                // fix OKLCH colors
                const all = doc.querySelectorAll("*");
                all.forEach((el: any) => {
                    const style = getComputedStyle(el);

                    if (style.backgroundColor.includes("oklch"))
                        el.style.backgroundColor = "white";

                    if (style.color.includes("oklch"))
                        el.style.color = "black";

                    if (style.borderColor.includes("oklch"))
                        el.style.borderColor = "black";
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



    // this saves the invoice to localStorage
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
            savedAt: new Date().toISOString(),
        };

        const saved = JSON.parse(localStorage.getItem("invoices") || "[]");
        saved.push(invoice);
        localStorage.setItem("invoices", JSON.stringify(saved));

        setShowSaveDialog(true);
    };


    // this renders the layout
    return (
        <div className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors flex flex-col lg:flex-row">

            {/* this is the left form panel */}
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
                        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={downloadPDF}>
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
                            <Input placeholder="Enter your business name" value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input placeholder="example@email.com" value={from.email} onChange={(e) => setFrom({ ...from, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Phone number</label>
                            <Input placeholder="+91 9876543210" value={from.phone} onChange={(e) => setFrom({ ...from, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Address</label>
                            <Input placeholder="Street and area" value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">City</label>
                            <Input placeholder="City" value={from.city} onChange={(e) => setFrom({ ...from, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Zip code</label>
                            <Input placeholder="400001" value={from.zip} onChange={(e) => setFrom({ ...from, zip: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Country</label>
                            <Input placeholder="India" value={from.country} onChange={(e) => setFrom({ ...from, country: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* bill to */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Bill To</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Client name or company</label>
                            <Input placeholder="Client or company name" value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Client email</label>
                            <Input placeholder="client@email.com" value={to.email} onChange={(e) => setTo({ ...to, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Client phone</label>
                            <Input placeholder="+91 9000000000" value={to.phone} onChange={(e) => setTo({ ...to, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Address</label>
                            <Input placeholder="Street and area" value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">City</label>
                            <Input placeholder="City" value={to.city} onChange={(e) => setTo({ ...to, city: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Zip code</label>
                            <Input placeholder="400001" value={to.zip} onChange={(e) => setTo({ ...to, zip: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Country</label>
                            <Input placeholder="India" value={to.country} onChange={(e) => setTo({ ...to, country: e.target.value })} />
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
                                        {issueDate ? format(issueDate, "PPP") : "Select date"}
                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={issueDate ? new Date(issueDate) : undefined}
                                        onSelect={(d) => {
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
                                        {dueDate ? format(dueDate, "PPP") : "Select date"}
                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate ? new Date(dueDate) : undefined}
                                        onSelect={(d) => {
                                            if (!d) return;
                                            setDueDate(format(d, "yyyy-MM-dd"));
                                        }}
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>



                        <div>
                            <label className="text-sm font-medium">Currency</label>
                            <Input placeholder="INR or USD" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Invoice number</label>
                            <Input placeholder="INV-2025-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
                        </div>
                    </div>

                </section>

                {/* Company Logo & Signature */}
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
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => setLogoFile(reader.result as string);
                                    reader.readAsDataURL(file);
                                }}
                            />

                            {logoFile && (
                                <img
                                    src={logoFile}
                                    className="mt-3 h-20 object-contain rounded-md border"
                                />
                            )}
                        </div>

                        {/* Signature Upload */}
                        <div>
                            <label className="text-sm font-medium">Upload Signature</label>
                            <Input
                                type="file"
                                accept="image/*"
                                className="mt-2 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => setSignatureFile(reader.result as string);
                                    reader.readAsDataURL(file);
                                }}
                            />

                            {signatureFile && (
                                <img
                                    src={signatureFile}
                                    className="mt-3 h-20 object-contain rounded-md border"
                                />
                            )}
                        </div>

                    </div>
                </section>


                {/* payment details */}
                <section>
                    <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Bank name</label>
                            <Input placeholder="HDFC Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Account number</label>
                            <Input placeholder="1234567890" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Account holder name</label>
                            <Input placeholder="Your full name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">UPI id</label>
                            <Input placeholder="name@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">UPI name</label>
                            <Input placeholder="Your UPI name" value={upiName} onChange={(e) => setUpiName(e.target.value)} />
                        </div>
                    </div>
                </section>

                {/* Product Information*/}
                <section>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-xl font-semibold">Product Information</h2>
                        <Button onClick={addItem} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {items.map((item) => (
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
                                        <Input placeholder="Service or product" value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={item.qty || ""}
                                            onChange={(e) => updateItem(item.id, { qty: Number(e.target.value) })}
                                        />

                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Rate</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={item.rate || ""}
                                            onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                                        />

                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Tax percent</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={item.taxPct || ""}
                                            onChange={(e) => updateItem(item.id, { taxPct: Number(e.target.value) })}
                                        />

                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea placeholder="Optional description" value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
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
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={discount || ""}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Shipping amount</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={shipping || ""}
                                onChange={(e) => setShipping(Number(e.target.value))}
                            />
                        </div>

                    </div>
                </section>

                {/* notes and terms */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Notes and Terms</h2>
                    <div className="mb-3">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea placeholder="Optional notes for the client" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Payment terms</label>
                        <Textarea placeholder="Due upon receipt, Net 15, Net 30, etc" value={terms} onChange={(e) => setTerms(e.target.value)} />
                    </div>
                </section>

                <div className="pb-24" />
            </div>

            {/* right preview */}
            <div className="w-full lg:w-[40%] bg-white dark:bg-neutral-900 border-t lg:border-l dark:border-neutral-700 shadow-xl">

                {/* Sticky wrapper */}
                <div className="p-6 md:p-8 lg:p-10 sticky top-4 overflow-auto max-h-[calc(100vh-2rem)]">

                    <div
                        ref={previewRef}
                        className="max-w-[700px] mx-auto bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl border dark:border-neutral-700 p-6 md:p-8"
                        style={{ overflow: "visible" }}
                    >

                        {logoFile && (
                            <div className="mb-6 flex justify-start">
                                <img src={logoFile} className="h-16 object-contain" />
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight">INVOICE</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">#{invoiceNumber || "-"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Issue: {issueDate || "-"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Due: {dueDate || "-"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Currency: {currency}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">From</h3>
                                <p className="text-sm leading-6">
                                    {from.name || "-"}<br />
                                    {from.address && <>{from.address}<br /></>}
                                    {(from.city || from.zip) && <>{[from.city, from.zip].filter(Boolean).join(" ")}<br /></>}
                                    {from.country && <>{from.country}<br /></>}
                                    {from.email && <>{from.email}<br /></>}
                                    {from.phone}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Bill To</h3>
                                <p className="text-sm leading-6">
                                    {to.name || "-"}<br />
                                    {to.address && <>{to.address}<br /></>}
                                    {(to.city || to.zip) && <>{[to.city, to.zip].filter(Boolean).join(" ")}<br /></>}
                                    {to.country && <>{to.country}<br /></>}
                                    {to.email && <>{to.email}<br /></>}
                                    {to.phone}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden border dark:border-neutral-700 rounded-lg">
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
                                    {items.map((it) => {
                                        const line = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                                        return (
                                            <tr key={it.id} className="border-t dark:border-neutral-700 align-top">
                                                <td className="p-3">
                                                    <div className="font-medium">{it.name || "-"}</div>
                                                    {it.description ? (
                                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {it.description}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="p-3 text-right">{Number(it.qty) || 0}</td>
                                                <td className="p-3 text-right">{fmt(Number(it.rate) || 0)}</td>
                                                <td className="p-3 text-right">{Number(it.taxPct) || 0}%</td>
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

                        <div className="mt-6 grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Notes</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{notes || "-"}</p>
                                <h4 className="font-semibold mt-4 mb-2">Payment Terms</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{terms || "-"}</p>

                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Payment Details</h4>
                                    <p className="text-sm leading-6">
                                        {bankName && <>Bank: {bankName}<br /></>}
                                        {accountNumber && <>Account No: {accountNumber}<br /></>}
                                        {accountName && <>Account Name: {accountName}<br /></>}
                                        {upiId && <>UPI ID: {upiId}<br /></>}
                                        {upiName && <>UPI Name: {upiName}<br /></>}
                                    </p>
                                </div>
                            </div>

                            {signatureFile && (
                                <div className="mt-10 text-right">
                                    <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">Authorized Signature</p>
                                    <img src={signatureFile} className="h-20 object-contain ml-auto" />
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border dark:border-neutral-700">
                                <div className="flex justify-between py-1">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{fmt(subtotal)}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span>Per item tax</span>
                                    <span className="font-medium">{fmt(perItemTaxTotal)}</span>
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
                                <div className="flex justify-between py-1 text-lg font-bold">
                                    <span>Total</span>
                                    <span>{fmt(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* actions for small screens */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="secondary" onClick={saveInvoice}>Save</Button>
                        <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white" onClick={downloadPDF}>Download PDF</Button>
                    </div>

                </div>
            </div>

            {/* Save Confirmation Dialog */}
            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Invoice Saved</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your invoice has been saved successfully.
                            You can find it inside <strong>Saved Invoices</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowSaveDialog(false)}>
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div>
    );
}


















































