"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Palette, Receipt, CheckCircle, Shield, Timer } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <main className="min-h-screen bg-lightBg dark:bg-darkBg text-[#1B1B1B] dark:text-white transition-colors">

      {/* Header */}
      <Header />

      {/* HERO SECTION */}
      <section className="px-6 md:px-12 pt-20 pb-28 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              The Smarter Way to
              <span className="text-[#4f46e5]"> Create Invoices</span>
            </h1>

            <p className="mt-5 text-lg text-gray-700 dark:text-gray-300 max-w-md">
              Save hours of manual work and create polished, tax-ready invoices instantly.
              Build, preview, customize, and download - all in one seamless workspace.
            </p>

            <div className="mt-8 flex gap-4">
              <a href="/dashboard">
                <Button size="lg" className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8">
                  Start Building
                </Button>
              </a>

              <a href="#features">
                <Button size="lg" variant="outline" className="px-8">
                  Explore Features
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Abstract Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center relative"
          >
            <div className="w-[260px] h-[260px] rounded-full bg-[#4f46e5]/20 dark:bg-[#4f46e5]/30 blur-3xl absolute -bottom-10"></div>
            <div className="w-[240px] h-[240px] rounded-xl bg-white dark:bg-neutral-900 border shadow-xl flex items-center justify-center relative z-10">
              <Sparkles className="h-20 w-20 text-[#4f46e5]" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: "1",
              title: "Add Your Details",
              desc: "Fill out From/To information, invoice details, line items, and payment fields."
            },
            {
              step: "2",
              title: "Customize & Preview",
              desc: "Apply theme colors, add taxes, discounts, signatures, and live-preview instantly."
            },
            {
              step: "3",
              title: "Download or Share",
              desc: "Export as PDF, email it, or save it locally to access any time."
            }
          ].map((s, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white dark:bg-neutral-900 shadow-md border dark:border-neutral-700 rounded-xl p-8 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-xl font-bold">
                {s.step}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Powerful Features Designed for You
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Live Preview", desc: "Changes update instantly as you type.", icon: Sparkles },
            { title: "Custom Fields", desc: "Add VAT, GST, notes & custom tags.", icon: FileText },
            { title: "Theme Colors", desc: "Choose accent colors matching your brand.", icon: Palette },
            { title: "Save in Browser", desc: "Invoices stored locally with one click.", icon: Receipt },
            { title: "Highly Secure", desc: "All your data stays on your device.", icon: Shield },
            { title: "Fast & Lightweight", desc: "Optimized for speed and usability.", icon: Timer }
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

      {/* CTA SECTION */}
      <section className="py-20 px-6 md:px-12 bg-[#F0F8FF] dark:bg-[#0A0F13] text-[#1B1B1B] dark:text-white transition-colors">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold">
            Create Your First Invoice Today
          </h3>

          <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Experience an effortless way to build, customize, and share invoices in seconds.
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
                Launch Builder
              </Button>
            </motion.div>
          </a>
        </div>
      </section>
      {/* FAQ SECTION */}
      <section className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is FluxInvoice completely free to use?</AccordionTrigger>
            <AccordionContent>
              Yes — all invoice-building features, including line items, taxes,
              discounts, logo uploads, and PDF export, are completely free and run
              directly inside your browser with no usage limits.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Can I create professional PDFs?</AccordionTrigger>
            <AccordionContent>
              Absolutely. FluxInvoice generates high-resolution, print-ready PDFs.
              They are formatted automatically to fit a single clean page, making them
              suitable for sharing with clients or including in official documentation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>What happens to my saved invoices?</AccordionTrigger>
            <AccordionContent>
              Your invoices are stored securely in your browser using LocalStorage.
              They never leave your device, ensuring privacy and allowing you to
              access them instantly without waiting for sync or loading times.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Do I need an account to use the builder?</AccordionTrigger>
            <AccordionContent>
              No account is required to create, save, and download invoices. However,
              signing in allows you to unlock extra features such as dashboard access,
              multi-device consistency, and a more personalized experience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Can I customize items, taxes, and totals?</AccordionTrigger>
            <AccordionContent>
              Yes, you can add unlimited line items, apply individual tax
              percentages, include optional descriptions, and adjust charges like
              discounts and shipping. The totals update automatically in real time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Does FluxInvoice support logos and brand identity?</AccordionTrigger>
            <AccordionContent>
              Yes, you can upload a high-quality logo and it will appear instantly in
              the invoice preview and the final PDF. This helps maintain your brand's
              professionalism when sending invoices to clients.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>


      {/* FOOTER */}
      <footer className="border-t dark:border-neutral-700 py-6 text-center text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} fluxInvoice. All rights reserved.
      </footer>

    </main>
  );
}
