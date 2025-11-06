"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Palette, Receipt, Shield, Timer } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <main className="relative min-h-screen text-[#1B1B1B] dark:text-white transition-colors">

      {/* Full-screen soft gradient background */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#eef2ff] via-white to-[#f7faff] dark:from-[#0b0d13] dark:via-[#0d0f16] dark:to-black" />

      {/* Header */}
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-32 px-6 md:px-12 max-w-4xl mx-auto text-center">

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mx-auto max-w-3xl"
        >
          The Smarter Way to  
          <br />
          <span className="text-[#4f46e5]">Create & Manage Invoices</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto"
        >
          Build polished invoices in minutes — with real-time preview, tax tools, branding, and instant PDF export.
        </motion.p>

        {/* Hero Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/dashboard">
            <Button
              size="lg"
              className="px-10 py-5 text-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-xl"
            >
              Start Building
            </Button>
          </a>

          <a href="#features">
            <Button
              size="lg"
              variant="outline"
              className="
                px-10 py-5 text-lg backdrop-blur-xl border-white/20
                bg-white/30 dark:bg-white/10
                hover:bg-white/40 hover:dark:bg-white/20 transition
              "
            >
              Explore Features
            </Button>
          </a>
        </motion.div>

      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Add Your Details",
              desc: "Fill From/To info, invoice metadata, line items, taxes and charges.",
            },
            {
              title: "Customize & Preview",
              desc: "Live preview, theme colors, branding, tax rules, and signatures.",
            },
            {
              title: "Download or Save",
              desc: "Export as PDF or save securely in your browser.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="
                border rounded-2xl p-8 shadow-xl 
                backdrop-blur-xl
                bg-white/30 dark:bg-neutral-900/20
                border-white/40 dark:border-white/10
                hover:-translate-y-2 hover:shadow-2xl transition
              "
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-[#4f46e5]/20 flex items-center justify-center text-xl font-bold text-[#4f46e5]">
                {i + 1}
              </div>

              <h3 className="mt-5 text-xl font-semibold">{card.title}</h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          Powerful Features Designed for You
        </h2>

        <div className="grid md:grid-cols-3 gap-7">
          {[
            { title: "Live Preview", desc: "Every change updates instantly.", icon: Sparkles },
            { title: "Custom Fields", desc: "Add VAT, GST, notes, tags & more.", icon: FileText },
            { title: "Brand Colors", desc: "Match invoices with your brand theme.", icon: Palette },
            { title: "Saved Invoices", desc: "Locally stored and instantly accessible.", icon: Receipt },
            { title: "Secure & Private", desc: "Your invoice data never leaves your device.", icon: Shield },
            { title: "Fast & Lightweight", desc: "Smooth and optimized experience.", icon: Timer },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="
                border rounded-2xl p-6 shadow-xl
                backdrop-blur-xl
                bg-white/30 dark:bg-neutral-900/20
                border-white/40 dark:border-white/10
                hover:-translate-y-2 hover:shadow-2xl transition
              "
            >
              <f.icon className="h-10 w-10 text-[#4f46e5]" />
              <h3 className="text-lg font-semibold mt-4">{f.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 px-6 md:px-12">
        <div
          className="
            max-w-5xl mx-auto text-center p-14 rounded-3xl
            bg-white/30 dark:bg-white/10 backdrop-blur-xl
            border border-white/40 dark:border-white/10
            shadow-2xl
          "
        >
          <h3 className="text-3xl md:text-4xl font-bold">
            Create Your First Invoice Today
          </h3>

          <p className="mt-5 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the fastest and most intuitive invoice builder designed for professionals.
          </p>

          <a href="/dashboard">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [-6, 0, -6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="
                  mt-10 px-12 py-6 text-lg font-semibold
                  bg-[#4f46e5] hover:bg-[#4338ca]
                  text-white shadow-xl rounded-full
                "
              >
                Launch Builder
              </Button>
            </motion.div>
          </a>
        </div>
      </section>

      {/* FAQ — full long version you had earlier */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">

          <AccordionItem value="item-1">
            <AccordionTrigger>Is FluxInvoice completely free to use?</AccordionTrigger>
            <AccordionContent>
              Yes — all invoice-building features, including line items, taxes, discounts,
              logo uploads, and PDF export, are fully free and run inside your browser.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Can I create professional PDFs?</AccordionTrigger>
            <AccordionContent>
              PDFs are high-resolution, clean, and automatically formatted to a single page
              — ideal for clients and documentation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What happens to my saved invoices?</AccordionTrigger>
            <AccordionContent>
              All saved invoices stay securely inside your browser using LocalStorage and
              never leave your device.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Do I need an account to use the builder?</AccordionTrigger>
            <AccordionContent>
              No — an account is optional. If you sign in, you unlock dashboard access and
              a consistent multi-device experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I customize items, taxes, and totals?</AccordionTrigger>
            <AccordionContent>
              Yes — add unlimited line items, apply custom tax percentages, add descriptions,
              and adjust discounts, shipping, and totals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Does FluxInvoice support brand identity?</AccordionTrigger>
            <AccordionContent>
              Yes — upload a business logo and signature to create on-brand, professional invoices instantly.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </section>

      <footer className="border-t dark:border-neutral-700 py-6 text-center text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} FluxInvoice. All rights reserved.
      </footer>

    </main>
  );
}
