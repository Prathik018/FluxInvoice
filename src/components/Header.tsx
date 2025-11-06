"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Header() {
  const { theme, setTheme } = useTheme();
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
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-black dark:text-white"
        >
          FluxInvoice
        </a>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dashboard (signed-in) */}
          <SignedIn>
            <a href="/dashboard">
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                Dashboard
              </Button>
            </a>
          </SignedIn>

          {/* Sign In (signed-out) */}
          <SignedOut>
            <a href="/sign-in">
              <Button variant="outline" className="hover:bg-white/30">
                Sign In
              </Button>
            </a>
          </SignedOut>

          {/* User Avatar */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  rootBox: "w-12 h-12",
                  // avatarBox: "w-12 h-12 border border-white/40 rounded-full shadow-sm",
                },
              }}
            />
          </SignedIn>

          {/* Theme Toggle */}
          <Button
            size="icon"
            variant="outline"
            className="backdrop-blur-md bg-white/40 dark:bg-black/40 border-white/20 dark:border-black/20"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </Button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
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
            <a href="/sign-in">
              <Button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                Dashboard
              </Button>
            </a>
          </SignedIn>

          {/* Sign in */}
          <SignedOut>
            <a href="/sign-in">
              <Button className="w-full" variant="outline">
                Sign In
              </Button>
            </a>
          </SignedOut>

          {/* Theme Toggle */}
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <span className="flex items-center gap-2">
                <Sun className="h-5 w-5" /> Light Mode
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Moon className="h-5 w-5" /> Dark Mode
              </span>
            )}
          </Button>

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
