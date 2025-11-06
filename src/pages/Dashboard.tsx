"use client";

import { motion } from "framer-motion";
import { Menu, FilePlus2, LayoutDashboard, Home, Settings, Archive } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [open, setOpen] = useState(true);

  // this is used for react router navigation
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-lightBg dark:bg-darkBg transition-colors">
      
      {/* sidebar */}
      <motion.aside
        animate={{ width: open ? 260 : 70 }}
        className="
          h-screen border-r 
          bg-white/50 dark:bg-neutral-900/30 
          backdrop-blur-xl shadow-lg
          flex flex-col transition-all duration-300
        "
      >
        {/* logo and toggle */}
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

        {/* navigation links */}
        <nav className="flex flex-col gap-2 p-4 text-gray-700 dark:text-gray-200">

          {/* home */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <Home className="h-5 w-5" />
            {open && <span>Home</span>}
          </div>

          {/* dashboard */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 cursor-pointer"
          >
            <LayoutDashboard className="h-5 w-5" />
            {open && <span>Dashboard</span>}
          </div>

          {/* saved invoices */}
          <div
            onClick={() => navigate("/dashboard/invoices")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <Archive className="h-5 w-5" />
            {open && <span>Saved Invoices</span>}
          </div>

          {/* create invoice */}
          <div
            onClick={() => navigate("/dashboard/new-invoice")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <FilePlus2 className="h-5 w-5" />
            {open && <span>Create Invoice</span>}
          </div>

          {/* settings */}
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
          >
            <Settings className="h-5 w-5" />
            {open && <span>Settings</span>}
          </div>
        </nav>
      </motion.aside>

      {/* main */}
      <section className="flex-1 p-8">

        {/* top header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-white">
            Dashboard
          </h2>

          <div className="flex items-center gap-3">

            {/* new invoice button */}
            <Button
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
              onClick={() => navigate("/dashboard/new-invoice")}
            >
              + New Invoice
            </Button>

            {/* avatar */}
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

        {/* main content */}
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
            Welcome to your dashboard
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You can create, edit, save and manage your invoices.
          </p>

          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Use the left sidebar to navigate between pages.
          </p>
        </motion.div>

      </section>
    </div>
  );
}
