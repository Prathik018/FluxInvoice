"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full flex justify-center pt-6 px-4 sticky top-4 z-50 pointer-events-none">
      {/* Center Dock Header */}
      <div
        className="
          pointer-events-auto
          backdrop-blur-sm
          bg-white/10 border border-white/20
          shadow-2xl
          rounded-3xl
          px-6 py-2
          max-w-3xl w-full
          flex items-center justify-between
          transition-all
        "
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="FluxInvoice logo"
          className="group inline-flex items-center gap-2"
        >
         <span className="text-white font-extrabold tracking-wider text-2xl">FluxInvoice</span>
        </Link>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <SignedIn>
            <Link to="/dashboard">
              <Button className="btn-primary rounded-full">Dashboard</Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <Link to="/sign-in">
              <Button variant="outline" className="btn-primary">Sign In</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  rootBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Trigger */}
        <button
          className="md:hidden p-2 rounded-xl bg-white/20 backdrop-blur-xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="
            absolute top-[95px]
            w-[90%] max-w-3xl
            mx-auto
            backdrop-blur-2xl
            bg-white/10 border border-white/20
            rounded-3xl shadow-xl
            py-4 px-6 space-y-4
          "
        >
          <SignedIn>
            <Link to="/dashboard">
              <Button className="btn-primary w-full rounded-full">Dashboard</Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <Link to="/sign-in">
              <Button variant="outline" className="w-full rounded-full">Sign In</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex justify-center pt-2">
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "w-16 h-16",
                    avatarBox: "w-16 h-16 border border-white/30 rounded-full shadow-md",
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