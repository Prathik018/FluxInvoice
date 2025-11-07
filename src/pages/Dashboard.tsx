"use client";

import { motion } from "framer-motion";
import { FilePlus2, Home, Archive, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Create New Invoice",
      desc: "Start a fresh invoice with editable client, items, and payment details.",
      icon: FilePlus2,
      onClick: () => navigate("/dashboard/new-invoice"),
    },
    {
      title: "View Saved Invoices",
      desc: "Access all your saved invoices securely from local storage.",
      icon: Archive,
      onClick: () => navigate("/dashboard/invoices"),
    },
    {
      title: "Go to Home",
      desc: "Return to the homepage and explore more about FluxInvoice.",
      icon: Home,
      onClick: () => navigate("/"),
    },
    {
      title: "Settings (Coming Soon)",
      desc: "Manage preferences, currency formats, and themes.",
      icon: Settings,
      onClick: () => alert("Settings feature coming soon!"),
    },
  ];

  return (
    <main className="min-h-screen bg-lightBg dark:bg-darkBg transition-colors flex flex-col p-6 md:p-10">
      
      {/* top header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-white">
          Dashboard
        </h2>

        <div className="flex items-center gap-3">
          <Button
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
            onClick={() => navigate("/dashboard/new-invoice")}
          >
            + New Invoice
          </Button>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* main content */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          bg-white dark:bg-neutral-900 
          border dark:border-neutral-700 
          shadow-md rounded-xl p-8 md:p-10
          transition-colors
        "
      >
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Welcome back! 👋
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          Manage your entire invoicing workflow from one simple dashboard.
          Create, save, and organize invoices effortlessly with real-time previews and secure local storage.
        </p>

        {/* navigation cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              className="
                cursor-pointer group
                p-6 border dark:border-neutral-700 rounded-xl
                bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md
                transition-all duration-200
                hover:-translate-y-1
              "
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-lg bg-[#4f46e5]/10 flex items-center justify-center group-hover:bg-[#4f46e5]/20 transition-colors">
                  <action.icon className="h-6 w-6 text-[#4f46e5]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {action.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* footer */}
      <footer className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} FluxInvoice. All rights reserved.
      </footer>
    </main>
  );
}
