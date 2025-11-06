"use client";

import { motion } from "framer-motion";
import { Menu, FilePlus2, LayoutDashboard, Home, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/clerk-react";

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-darkBg transition-colors">
      
      {/* // SIDEBAR */}
      <motion.aside
        animate={{ width: open ? 260 : 70 }}
        className="
          h-screen border-r 
          bg-white/50 dark:bg-neutral-900/30 
          backdrop-blur-xl shadow-lg
          flex flex-col transition-all duration-300
        "
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/10 dark:border-white/10">
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

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4 text-gray-700 dark:text-gray-200">

          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg 
              hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <Home className="h-5 w-5" />
            {open && <span>Home</span>}
          </a>

          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg 
              bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10"
          >
            <LayoutDashboard className="h-5 w-5" />
            {open && <span>Dashboard</span>}
          </a>

          <a
            href="/dashboard/new-invoice"
            className="flex items-center gap-3 px-3 py-2 rounded-lg 
              hover:bg-black/10 dark:hover:bg-white/10 transition"
          >
            <FilePlus2 className="h-5 w-5" />
            {open && <span>Create Invoice</span>}
          </a>

          <a
            className="flex items-center gap-3 px-3 py-2 rounded-lg 
              hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
            {open && <span>Settings</span>}
          </a>

        </nav>
      </motion.aside>

      {/* // MAIN CONTENT */}
      <section className="flex-1 p-8">

        {/* TOP HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-white">
            Invoice Builder
          </h2>

          <div className="flex items-center gap-3">
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
              + New Invoice
            </Button>

            {/* User Avatar */}
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* CONTENT BOX */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            bg-white dark:bg-neutral-900 
            border dark:border-neutral-700 
            shadow-md rounded-xl p-10 min-h-[60vh]
            transition-colors
          "
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Builder Coming Soon...
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This is where your invoice sections — From, To, Details, Line Items,
            Summary, Payments, etc — will be added.
          </p>

          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Tell me when you want me to generate the entire builder UI.
          </p>
        </motion.div>

      </section>
    </div>
  );
}
