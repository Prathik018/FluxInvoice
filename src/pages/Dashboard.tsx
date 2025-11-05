"use client";

import { motion } from "framer-motion";
import { Menu, FilePlus2, LayoutDashboard, Home, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#F8F7F0]">
      
      {/* ========================
          SIDEBAR
      ============================ */}
      <motion.aside
        animate={{ width: open ? 260 : 70 }}
        className="h-screen border-r bg-white shadow-sm flex flex-col transition-all duration-300"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h1
            className={`font-bold text-xl transition-all ${
              open ? "opacity-100" : "opacity-0 w-0"
            }`}
          >
            fluxInvoice
          </h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-4 text-gray-700">

          {/* Home */}
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <Home className="h-5 w-5" />
            {open && <span>Home</span>}
          </a>

          {/* Dashboard */}
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 border"
          >
            <LayoutDashboard className="h-5 w-5" />
            {open && <span>Dashboard</span>}
          </a>

          {/* Create Invoice */}
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <FilePlus2 className="h-5 w-5" />
            {open && <span>Create Invoice</span>}
          </a>

          {/* Settings (future) */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
            <Settings className="h-5 w-5" />
            {open && <span>Settings</span>}
          </div>
        </nav>
      </motion.aside>

      {/* ========================
          MAIN CONTENT AREA
      ============================ */}
      <section className="flex-1 p-8">

        {/* TOP HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-[#1B1B1B]">Invoice Builder</h2>

          <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
            + New Invoice
          </Button>
        </div>

        {/* CONTENT BOX */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border shadow-md rounded-xl p-10 min-h-[60vh]"
        >
          <h3 className="text-xl font-semibold text-gray-800">
            Builder Coming Soon...
          </h3>
          <p className="text-gray-600 mt-2">
            This is where your invoice sections — From, To, Details, Line Items,
            Summary, Payments, etc — will be added.
          </p>

          <p className="mt-4 text-gray-500">
            Tell me when you want me to generate the entire builder UI.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
