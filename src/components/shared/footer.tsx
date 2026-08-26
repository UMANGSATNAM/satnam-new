"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";
import type { Category, Settings } from "@/lib/types";

interface FooterProps {
  categories: Category[];
  settings: Settings;
}

export function Footer({ categories, settings }: FooterProps) {
  const { navigate } = useRouter();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Subscription failed");
      toast.success("Subscribed successfully! Check your inbox for exclusive offers 🎁");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "All Products", path: "/products" },
    { label: "Track Your Order", path: "/track" },
    { label: "My Account & Orders", path: "/account" },
    { label: "My Wishlist", path: "/wishlist" },
    { label: "Recipes & Ideas", path: "/recipes" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  const policies = [
    { label: "Shipping & Delivery Policy", path: "/shipping-policy" },
    { label: "Return & Refund Policy", path: "/refund-policy" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "FAQs & Help Center", path: "/faq" },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Trust badges */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
          {[
            { icon: Truck, title: "Free Shipping", desc: `On orders above ₹${settings.freeShippingThreshold}` },
            { icon: ShieldCheck, title: "100% Safe Payments", desc: "Razorpay & UPI Protected" },
            { icon: RefreshCw, title: "7-Day Quality Guarantee", desc: "Hassle-free replacement" },
            { icon: Headphones, title: "Direct WhatsApp Support", desc: "Mon-Sat 9 AM - 7 PM" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <b.icon size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">{b.title}</p>
                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram banner */}
      <div className="overflow-hidden border-b border-border/60 bg-brand-gradient py-2.5">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-8 px-4 text-xs sm:text-sm font-semibold text-primary-foreground">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                Follow us on Instagram <Instagram size={14} /> Taste the best roasted chana & peanuts ⚡ Pure Desi Crunchy Goodness 🫘
              </span>
            ))}
          </div>
          <div className="animate-marquee flex shrink-0 items-center gap-8 px-4 text-xs sm:text-sm font-semibold text-primary-foreground" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                Follow us on Instagram <Instagram size={14} /> Taste the best roasted chana & peanuts ⚡ Pure Desi Crunchy Goodness 🫘
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + contact */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-lg text-white">
              🫘
            </div>
            <div>
              <p className="font-playfair text-lg font-bold leading-none">{settings.brandName}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                {settings.tagline}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Authentic, batch-roasted chana, peanuts, and flavorful snack combinations. Handpicked from Indian farms, vacuum sealed for optimal crunch.
          </p>
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="flex items-start gap-2 text-muted-foreground">
              <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
              {settings.address}
            </span>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Mail size={14} className="shrink-0" /> {settings.email}
            </a>
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Phone size={14} className="shrink-0" /> {settings.phone}
            </a>
          </div>
          <div className="flex gap-2 pt-1">
            {[
              { icon: Facebook, href: settings.facebook || "#" },
              { icon: Instagram, href: settings.instagram || "#" },
              { icon: Twitter, href: settings.twitter || "#" },
              { icon: Linkedin, href: settings.linkedin || "#" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                aria-label="Social media"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
            Featured Collections
          </h3>
          <ul className="flex flex-col gap-2 text-xs">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links & Policies */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
            Customer Care & Policies
          </h3>
          <ul className="flex flex-col gap-2 text-xs">
            {quickLinks.slice(0, 4).map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.path)}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </button>
              </li>
            ))}
            {policies.map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => navigate(l.path)}
                  className="text-muted-foreground transition-colors hover:text-primary font-medium"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
            Get 10% Off Your First Order
          </h3>
          <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
            Subscribe for special festival discounts, limited-edition snack launches, and healthy recipes.
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-10 flex-1 text-xs"
              required
            />
            <Button type="submit" size="sm" disabled={subscribing} className="h-10 gap-1 px-3 text-xs font-semibold">
              {subscribing ? "..." : "Join"} <ArrowRight size={13} />
            </Button>
          </form>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CheckCircle2 size={13} className="text-primary" /> Use code <span className="font-bold text-primary">WELCOME10</span> at checkout
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 bg-muted/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs sm:flex-row sm:px-6">
          <p className="text-muted-foreground text-[11px]">
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[11px]">Secured by:</span>
            {["UPI / QR", "Google Pay", "PhonePe", "Paytm", "Cards / NetBanking", "COD"].map((p) => (
              <span
                key={p}
                className="rounded border border-border bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground/80 shadow-2xs"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
