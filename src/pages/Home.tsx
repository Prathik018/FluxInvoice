"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Palette,
  Receipt,
  Check
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
<main className="min-h-screen bg-lightBg dark:bg-darkBg text-[#1B1B1B] dark:text-white transition-colors">

      {/* // HEADER */}
      <Header />

      {/* // HERO SECTION */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Create Beautiful
              <span className="text-[#4f46e5]"> Invoices</span>
              <br /> In Seconds.
            </h1>

            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-md">
              Build, preview, customize, and download invoices instantly.
              Clean UI, live preview, tax controls & more — right in your browser.
            </p>

            <div className="mt-6 flex gap-4">
              <a href="/dashboard">
                <Button size="lg" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                  Start Building
                </Button>
              </a>

              <a href="#features">
                <Button size="lg" variant="outline">
                  Explore Features
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right Side Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <div className="rounded-xl border shadow-xl bg-white dark:bg-neutral-900 p-4">
              <img
                src="/sample-logo.png"
                alt="Invoice Preview"
                className="rounded-md w-[420px] h-[300px] object-contain"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* // FEATURES SECTION */}
      <section id="features" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Everything You Need in an Invoice Builder
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Live Preview", desc: "See changes instantly as you type.", icon: Sparkles },
            { title: "Multiple Templates", desc: "Choose Classic or Compact.", icon: FileText },
            { title: "Theme Colors", desc: "Match your brand identity.", icon: Palette },
            { title: "Save in Browser", desc: "Load invoices anytime.", icon: Receipt },
            { title: "Custom Fields", desc: "VAT, GST & more.", icon: Check },
            { title: "Tax & Discounts", desc: "Item-level taxes & totals.", icon: Check }
          ].map((f, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-700 shadow-sm p-6"
            >
              <f.icon className="h-10 w-10 text-[#4f46e5]" />
              <h3 className="text-lg font-semibold mt-4">{f.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* // TEMPLATE SHOWCASE */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Choose Your Preferred Template
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { name: "Classic Template", img: "/classic-template-preview.png" },
            { name: "Compact Template", img: "/compact-template-preview.png" }
          ].map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-700 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b dark:border-neutral-700 font-medium">
                {t.name}
              </div>
              <div className="p-4">
                <div className="rounded-lg border dark:border-neutral-700 overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full object-cover" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* // CTA SECTION */}
      <section className="py-20 px-6 md:px-12 bg-[#F0F8FF] dark:bg-[#0A0F13] text-[#1B1B1B] dark:text-white transition-colors">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold">
            Ready to Create Your First Invoice?
          </h3>

          <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Build, preview, customize, and download polished invoices with ease.
          </p>

          <a href="/dashboard">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [-6, 0, -6] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="
            mt-10 px-10 py-6 text-lg font-semibold
            bg-[#4f46e5] hover:bg-[#4338ca]
            text-white shadow-xl rounded-full
          "
              >
                Launch Invoice Builder
              </Button>
            </motion.div>
          </a>
        </div>
      </section>


      {/* // FAQ SECTION */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is fluxInvoice free?</AccordionTrigger>
            <AccordionContent>
              Yes! All core features run inside your browser—no backend needed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Can I export invoices as PDF?</AccordionTrigger>
            <AccordionContent>
              Yes—PDF generation is built directly into the preview screen.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Are invoices saved automatically?</AccordionTrigger>
            <AccordionContent>
              Yes, invoices are stored in your browser using localStorage.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I change the theme color?</AccordionTrigger>
            <AccordionContent>
              Absolutely! Choose any accent color in the builder.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* // FOOTER */}
      <footer className="border-t dark:border-neutral-700 py-6 text-center text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} fluxInvoice — Built with React, Tailwind, Motion & shadcn/ui
      </footer>

    </main>
  );
}
