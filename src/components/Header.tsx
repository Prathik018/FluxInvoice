"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";              // ✅ Removed Sun, Moon
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full flex justify-center pt-6 px-4 sticky top-0 z-50">
      <div
        className="
        max-w-5xl w-full
        flex items-center justify-between
        px-6 py-3
        rounded-2xl
        border shadow-xl
        bg-white/20 dark:bg-neutral-900/10
        backdrop-blur-xl
        transition-all
      "
      >
        {/* Logo */}
        <Link to="/" aria-label="FluxInvoice logo" className="group inline-flex items-center gap-2">
          <span
            className="
              text-2xl md:text-[28px] font-extrabold tracking-tight
              [font-feature-settings:'ss01','ss02','cv11'] 
              bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#10B981]
              bg-clip-text text-transparent
              transition-transform duration-300 group-hover:scale-[1.02]
            "
          >
            Flux
            <span className="text-black dark:text-white bg-clip-text">
              Invoice
            </span>
          </span>

          <span
            className="
              h-[6px] w-8 rounded-full 
              bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#10B981]
              opacity-80 group-hover:opacity-100 transition-opacity
            "
          />
        </Link>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dashboard (Signed-in) */}
          <SignedIn>
            <Link to="/dashboard">
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                Dashboard
              </Button>
            </Link>
          </SignedIn>

          {/* Sign In (Signed-out) */}
          <SignedOut>
            <Link to="/sign-in">
              <Button variant="outline" className="hover:bg-white/30">
                Sign In
              </Button>
            </Link>
          </SignedOut>

          {/* Avatar */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  rootBox: "w-12 h-12",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="
            md:hidden
            absolute top-[90px]
            w-[90%]
            max-w-5xl
            bg-white/80 dark:bg-neutral-900/80
            backdrop-blur-2xl
            border rounded-2xl shadow-xl
            py-4 px-6 space-y-3
          "
        >
          {/* Dashboard */}
          <SignedIn>
            <Link to="/dashboard">
              <Button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                Dashboard
              </Button>
            </Link>
          </SignedIn>

          {/* Sign in */}
          <SignedOut>
            <Link to="/sign-in">
              <Button className="w-full" variant="outline">
                Sign In
              </Button>
            </Link>
          </SignedOut>

          {/* Avatar */}
          <SignedIn>
            <div className="flex justify-center pt-2">
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "w-16 h-16",
                    avatarBox:
                      "w-16 h-16 border border-white/40 rounded-full shadow-md",
                  },
                }}
              />
            </div>
          </SignedIn>
        </motion.div>
      )}
    </header>
  );
}
