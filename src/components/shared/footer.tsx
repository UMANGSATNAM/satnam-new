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

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success("Subscribed! Check your inbox for a welcome offer 🎁");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Recipes", path: "/recipes" },
    { label: "Contact", path: "/contact" },
    { label: "Track Order", path: "/products" },
  ];

  const policies = [
    { label: "Privacy Policy", path: "/contact" },
    { label: "Refund Policy", path: "/contact" },
    { label: "Shipping Policy", path: "/contact" },
    { label: "Terms of Service", path: "/contact" },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Trust badges */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders above ₹499" },
            { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected payments" },
            { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
            { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer care" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <b.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram banner */}
      <div className="overflow-hidden border-b border-border/60 bg-brand-gradient py-3">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex shrink-0 items-center gap-8 px-4 text-sm font-semibold text-primary-foreground">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-3">
                Follow us on Instagram <Instagram size={15} /> Taste the best chana & peanuts
                <span className="text-lg">⚡</span>
              </span>
            ))}
          </div>
          <div className="animate-marquee flex shrink-0 items-center gap-8 px-4 text-sm font-semibold text-primary-foreground" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-3">
                Follow us on Instagram <Instagram size={15} /> Taste the best chana & peanuts
                <span className="text-lg">⚡</span>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-lg">
              🫘
            </div>
            <div>
              <p className="font-playfair text-lg font-bold leading-none">{settings.brandName}</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
                {settings.tagline}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Premium roasted chana, peanuts & flavored snacks. Farm-fresh, traditionally roasted,
            vacuum packed for freshness.
          </p>
          <div className="flex flex-col gap-1.5 text-sm">
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
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                aria-label="Social media"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
            Featured Collections
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
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

        {/* Quick links */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2 text-sm">
            {quickLinks.map((l) => (
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
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
            Sign Up for Email
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Sign up to get first dibs on new arrivals, sales, exclusive content, events and more!
          </p>
          <form onSubmit={subscribe} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-10 flex-1"
              required
            />
            <Button type="submit" size="sm" className="h-10 gap-1 px-4">
              Subscribe <ArrowRight size={15} />
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Get <span className="font-bold text-primary">10% off</span> your first order 🎁
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs sm:flex-row sm:px-6">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">We accept:</span>
            {["UPI", "GPay", "Paytm", "Visa", "Mastercard", "RuPay"].map((p) => (
              <span
                key={p}
                className="rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground/80"
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
