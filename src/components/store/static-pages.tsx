"use client";

import Image from "next/image";
import { Leaf, Smile, Heart, Award, Truck, ShieldCheck, Users, Sprout, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/lib/router";
import { useState } from "react";
import { toast } from "sonner";
import type { Settings } from "@/lib/types";

export function AboutPage() {
  const { navigate } = useRouter();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-primary-foreground md:p-12">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">Our Story</p>
          <h1 className="mt-2 font-playfair text-3xl font-bold sm:text-4xl md:text-5xl">
            Taste of Tradition
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-primary-foreground/90 sm:text-base">
            Three generations of expertise in roasting the finest chana and peanuts. From our farms to your table.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="relative h-64 overflow-hidden rounded-2xl md:h-full">
          <Image src="/brand/about-banner.png" alt="Farm to table" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col justify-center gap-3">
          <h2 className="font-playfair text-2xl font-bold">From Humble Beginnings</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Satnam Singh Chana began as a small family business with a simple mission: to bring
            authentic, traditionally roasted chana and peanuts to every Indian household. What
            started in a tiny kitchen has grown into a trusted brand loved by thousands.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We source the finest desi chickpeas and premium peanuts directly from farmers, roast
            them in small batches using time-honored techniques, and vacuum-pack them to preserve
            that signature crunch and flavor.
          </p>
          <Button onClick={() => navigate("/products")} className="w-fit gap-2">
            Explore Our Products
          </Button>
        </div>
      </div>

      {/* Values */}
      <div className="mt-10">
        <h2 className="mb-6 text-center font-playfair text-2xl font-bold sm:text-3xl">Our Values</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            { icon: Sprout, title: "Farm Direct", desc: "Sourced directly from trusted farmers" },
            { icon: Leaf, title: "100% Natural", desc: "No preservatives, no artificial colors" },
            { icon: Award, title: "Premium Quality", desc: "Handpicked & quality checked" },
            { icon: Truck, title: "Fresh Delivery", desc: "Vacuum packed & fast shipping" },
          ].map((v) => (
            <div key={v.title} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <v.icon size={22} />
              </div>
              <h3 className="font-bold">{v.title}</h3>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 rounded-3xl bg-muted/30 p-6 md:grid-cols-4">
        {[
          { value: "50,000+", label: "Happy Customers", icon: Users },
          { value: "24", label: "Premium Products", icon: Award },
          { value: "4.7/5", label: "Average Rating", icon: Heart },
          { value: "3", label: "Generations", icon: Smile },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center">
            <s.icon className="mb-1 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Message sent! We'll get back to you soon. 📬");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Get in Touch</p>
        <h1 className="mt-2 font-playfair text-3xl font-bold sm:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Have a question, feedback, or need help with an order? We{"'"}d love to hear from you!
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Contact info */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-bold">Contact Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-semibold">Address</p>
                  <p className="text-muted-foreground">{settings.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-primary hover:underline">{settings.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href={`tel:${settings.phone}`} className="text-primary hover:underline">{settings.phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-muted-foreground">Mon - Sat: 9:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="font-bold">Need quick help?</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              For order-related queries, please include your order number in the subject. We typically respond within 24 hours.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 font-bold">Send a Message</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="c-name">Name *</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-email">Email *</Label>
                <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="c-subject">Subject *</Label>
              <Input id="c-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="c-message">Message *</Label>
              <Textarea id="c-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              {submitting ? "Sending..." : <>Send Message <Send size={15} /></>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RecipesPage() {
  const { navigate } = useRouter();
  const recipes = [
    { title: "Spicy Chana Chaat", desc: "A tangy, spicy chaat made with roasted chana, onions, tomatoes and chutneys.", time: "10 min", difficulty: "Easy", image: "/products/flavored-chana.png" },
    { title: "Peanut Butter Smoothie", desc: "Creamy protein-packed smoothie with peanut butter, banana and milk.", time: "5 min", difficulty: "Easy", image: "/products/roasted-peanuts-salted.png" },
    { title: "Sattu Drink", desc: "Refreshing summer drink with roasted chana flour, water and spices.", time: "5 min", difficulty: "Easy", image: "/products/roasted-chana-plain.png" },
    { title: "Chana Namkeen Mix", desc: "Festive snack mix with roasted chana, peanuts, sev and spices.", time: "15 min", difficulty: "Medium", image: "/products/combo-pack.png" },
    { title: "Peanut Chikki Crush", desc: "Crushed peanut chikki over ice cream for a crunchy dessert.", time: "5 min", difficulty: "Easy", image: "/products/chikki.png" },
    { title: "Hing Jeera Chana Soup", desc: "Comforting soup with hing-jeera chana, tomatoes and herbs.", time: "20 min", difficulty: "Medium", image: "/products/flavored-chana.png" },
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kitchen Inspiration</p>
        <h1 className="mt-2 font-playfair text-3xl font-bold sm:text-4xl">Recipes</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Delicious recipes you can whip up with our roasted chana and peanuts.
        </p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
          <div key={r.title} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-video overflow-hidden">
              <Image src={r.image} alt={r.title} fill className="object-cover transition-transform group-hover:scale-110" sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="absolute left-2 top-2 flex gap-1.5">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-foreground">{r.time}</span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{r.difficulty}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold leading-tight">{r.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.desc}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 -ml-2 gap-1 text-primary"
                onClick={() => toast.info("Full recipe coming soon! 📝")}
              >
                View Recipe →
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-3xl bg-brand-gradient p-8 text-center text-primary-foreground">
        <h2 className="font-playfair text-2xl font-bold">Have a Recipe to Share?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/90">
          Tag us on social media with your creations using our products!
        </p>
        <Button variant="secondary" className="mt-4 gap-2" onClick={() => navigate("/contact")}>
          Share Your Recipe
        </Button>
      </div>
    </div>
  );
}
