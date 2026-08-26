"use client";

import {
  ShieldCheck,
  Truck,
  RefreshCw,
  FileText,
  HelpCircle,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Package,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import type { Settings } from "@/lib/types";

export function ShippingPolicyPage({ settings }: { settings: Settings }) {
  const { navigate } = useRouter();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Truck size={24} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Shipping & Delivery Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to know about how we deliver fresh snacks across India.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">1. Shipping Charges & Free Delivery</h2>
          <p className="mt-2">
            We offer <strong className="text-primary">FREE Shipping on all orders above ₹{settings.freeShippingThreshold}</strong> anywhere in India. For orders below ₹{settings.freeShippingThreshold}, a flat standard shipping fee of ₹{settings.shippingFee} is applicable.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">2. Processing & Dispatch Timeline</h2>
          <p className="mt-2">
            All our chana and peanut snacks are batch-roasted and vacuum packed for maximum freshness. Orders are typically processed and dispatched within <strong className="text-foreground">24 to 48 business hours</strong> from our facility.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">3. Estimated Delivery Times</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Delhi NCR & Northern India:</strong> 2 - 3 business days</li>
            <li><strong>Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 3 - 5 business days</li>
            <li><strong>Rest of India:</strong> 4 - 7 business days</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">4. Trusted Courier Partners</h2>
          <p className="mt-2">
            We partner with India's leading logistics providers including BlueDart, Delhivery, DTDC, Xpressbees, and India Post to ensure your package arrives in pristine condition.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">5. Tracking Your Shipment</h2>
          <p className="mt-2">
            Once your order is handed over to the courier, you will receive an SMS and email notification with your AWB tracking link. You can also track your shipment anytime on our{" "}
            <button onClick={() => navigate("/track")} className="font-semibold text-primary underline">
              Track Order page
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RefundPolicyPage({ settings }: { settings: Settings }) {
  const { navigate } = useRouter();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <RefreshCw size={24} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Return & Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          100% Quality Satisfaction Guarantee. Your trust is our highest priority.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">1. 7-Day Quality Guarantee</h2>
          <p className="mt-2">
            As our products are perishable roasted food items, we cannot accept general returns of opened packages. However, if your order arrives <strong className="text-foreground">damaged, tampered with, expired, or incorrect</strong>, we offer a <strong className="text-primary">100% Free Replacement or Full Refund</strong> within 7 days of delivery.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">2. How to Request a Replacement or Refund</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Take a clear photo or short video of the damaged packaging/product.</li>
            <li>Send your Order Number and photos to our support email at <a href={`mailto:${settings.email}`} className="text-primary underline">{settings.email}</a> or WhatsApp us at <a href={`tel:${settings.phone}`} className="text-primary underline">{settings.phone}</a>.</li>
            <li>Our quality control team will inspect and approve your replacement or refund within 24 hours.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">3. Refund Processing Time</h2>
          <p className="mt-2">
            Approved refunds are credited directly to your original payment method (Bank Account, UPI, or Credit/Debit Card) within <strong className="text-foreground">3 to 5 business days</strong>. For Cash on Delivery orders, we issue direct bank/UPI transfers or store credit as per your preference.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage({ settings }: { settings: Settings }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck size={24} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How {settings.brandName} collects, protects, and handles your personal information.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
          <p className="mt-2">
            When you purchase from our store, we collect necessary contact information including your full name, shipping address, email address, phone number, and order preferences to fulfill and deliver your snack orders.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">2. Payment Security & Encryption</h2>
          <p className="mt-2">
            We do <strong>NOT</strong> store any debit/credit card numbers or banking passwords on our servers. All digital transactions are securely processed through RBI-compliant, 256-bit encrypted payment gateways like Razorpay and verified UPI infrastructure.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">3. How We Use Your Data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To process, dispatch, and track your orders.</li>
            <li>To send order confirmation and tracking status emails/SMS.</li>
            <li>To provide timely customer support and answer inquiries.</li>
            <li>To send occasional discounts, new snack launches, and festive promotions (you can unsubscribe anytime).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function TermsPage({ settings }: { settings: Settings }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileText size={24} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Terms and conditions governing your use of {settings.brandName}.
        </p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">1. Agreement to Terms</h2>
          <p className="mt-2">
            By accessing and purchasing from {settings.brandName}, you agree to be bound by these terms, our Shipping Policy, and Return Policy in accordance with Indian consumer laws.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">2. Product Quality & Shelf Life</h2>
          <p className="mt-2">
            All our products are 100% vegetarian, authentic roasted chickpeas and peanuts. Each pack contains natural ingredients, shelf life details (typically 6-9 months), and storage recommendations. Please store in a cool, dry place away from direct sunlight.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground">3. Pricing & Offers</h2>
          <p className="mt-2">
            Prices displayed on our website are inclusive of all applicable taxes (GST). We reserve the right to modify prices, bundle offers, and coupon codes without prior notice.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQPage({ settings }: { settings: Settings }) {
  const { navigate } = useRouter();

  const faqs = [
    {
      category: "Snacks & Ingredients",
      items: [
        {
          q: "What makes Satnam Singh Chana snacks special?",
          a: "We roast desi chickpeas and premium Gujarat peanuts in small batches using traditional roasting methods. Our snacks are 100% natural, high in plant protein and dietary fiber, and vacuum sealed to lock in crunchy freshness without artificial preservatives.",
        },
        {
          q: "Are all products 100% vegetarian?",
          a: "Yes! Every single product and flavor produced by Satnam Singh Chana is 100% vegetarian and prepared in a pure vegetarian facility.",
        },
        {
          q: "What is the shelf life of your snacks?",
          a: "Our vacuum-sealed packs have a shelf life of 6 to 9 months from the date of manufacturing. Once opened, we recommend storing them in an airtight container to preserve crispiness.",
        },
      ],
    },
    {
      category: "Orders & Shipping",
      items: [
        {
          q: "How do I get Free Shipping?",
          a: `All orders with a total value of ₹${settings.freeShippingThreshold} or more automatically qualify for FREE Shipping across India!`,
        },
        {
          q: "How can I track my order?",
          a: "You can track your order live by entering your Order ID, phone number, or email on our Track Order page.",
        },
        {
          q: "How long will delivery take?",
          a: "Orders in North India are typically delivered in 2-3 business days. Metro cities take 3-5 days, and other locations across India take 4-7 business days.",
        },
      ],
    },
    {
      category: "Payments & Returns",
      items: [
        {
          q: "What payment methods are supported?",
          a: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, Wallets, and Cash on Delivery (COD).",
        },
        {
          q: "What if my package arrives damaged?",
          a: "We offer a 100% hassle-free replacement or refund within 7 days of delivery. Just contact us with your order number and a photo of the damaged package.",
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle size={24} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find fast answers to common questions about our snacks, shipping, and orders.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {faqs.map((sec, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-playfair text-lg font-bold text-primary">{sec.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {sec.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${idx}-${i}`}>
                  <AccordionTrigger className="text-left font-semibold text-sm hover:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Support box */}
      <div className="mt-10 rounded-2xl bg-brand-gradient p-8 text-center text-primary-foreground">
        <h2 className="font-playfair text-2xl font-bold">Still Have Questions?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/90">
          Our friendly customer support team is always here to assist you!
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/contact")}>
            Contact Support
          </Button>
          <a
            href={`tel:${settings.phone}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30"
          >
            <Phone size={15} /> {settings.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
