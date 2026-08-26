"use client";

import Image from "next/image";
import {
  ArrowRight,
  Leaf,
  Smile,
  Heart,
  Star,
  ShieldCheck,
  Award,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shared/product-card";
import { StarRating } from "@/components/shared/star-rating";
import { useRouter } from "@/lib/router";
import type { Product, Category } from "@/lib/types";
import { useRef } from "react";

interface HomeProps {
  products: Product[];
  categories: Category[];
}

export function Home({ products, categories }: HomeProps) {
  const { navigate } = useRouter();

  const featuredCategories = categories.slice(0, 5);
  const dealsOfDay = products.filter((p) => p.isDealOfDay).slice(0, 8);
  const bestsellers = products.filter((p) => p.isBestseller).slice(0, 4);
  const popularPeanuts = products
    .filter((p) => p.category?.slug === "roasted-peanuts" || p.category?.slug === "flavored-peanuts")
    .slice(0, 4);
  const popularChana = products
    .filter((p) => p.category?.slug === "roasted-chana" || p.category?.slug === "flavored-chana")
    .slice(0, 4);
  const combos = products.filter((p) => p.category?.slug === "kitchen-essentials").slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-amber-50 to-primary/5">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/brand/hero-banner.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16 lg:py-20">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Leaf size={13} /> 100% Natural • Farm Fresh • Vacuum Packed
            </span>
            <h1 className="font-playfair text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Roasted to <span className="text-primary">Perfection</span>,
              <br />
              Packed with <span className="text-amber-brand">Goodness</span>
            </h1>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              Premium roasted chana & peanuts from {`India's`} finest farms. Traditionally roasted,
              boldly flavored, and vacuum-packed to lock in that signature crunch. The healthy snack
              you{"'"}ll crave.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="gap-2 rounded-full px-6 text-base shadow-lg"
                onClick={() => navigate("/products")}
              >
                Shop Now <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full px-6 text-base"
                onClick={() => navigate("/category/kitchen-essentials")}
              >
                View Combo Packs
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground sm:text-sm">
              <span className="flex items-center gap-1.5">
                <StarRating rating={4.7} size={14} showValue />
                <span className="font-semibold text-foreground">4.7/5</span> from 2,800+ reviews
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-primary" /> FSSAI Certified
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={15} className="text-primary" /> Free ship ₹499+
              </span>
            </div>
          </div>

          {/* Hero product collage */}
          <div className="relative hidden h-[380px] md:block">
            <div className="absolute right-0 top-0 h-56 w-56 overflow-hidden rounded-3xl border-4 border-card shadow-2xl">
              <Image src="/products/roasted-chana-plain.png" alt="Roasted Chana" fill className="object-cover" sizes="224px" />
            </div>
            <div className="absolute left-4 top-24 h-48 w-48 overflow-hidden rounded-3xl border-4 border-card shadow-2xl">
              <Image src="/products/roasted-peanuts-salted.png" alt="Roasted Peanuts" fill className="object-cover" sizes="192px" />
            </div>
            <div className="absolute bottom-0 right-16 h-44 w-44 overflow-hidden rounded-3xl border-4 border-card shadow-2xl">
              <Image src="/products/flavored-chana.png" alt="Flavored Chana" fill className="object-cover" sizes="176px" />
            </div>
            <div className="absolute bottom-8 left-0 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Premium Quality</p>
                <p className="text-[10px] text-muted-foreground">Since 1985</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative border-t border-border/60 bg-card/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-xs font-semibold text-foreground/80 sm:text-sm">
            <span className="flex items-center gap-1.5">🥜 100% Natural Peanuts</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="flex items-center gap-1.5">🫘 Protein-Rich Chana</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="flex items-center gap-1.5">⚡ Traditionally Roasted</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="flex items-center gap-1.5">🌿 No Preservatives</span>
            <span className="hidden text-muted-foreground sm:inline">•</span>
            <span className="flex items-center gap-1.5">📦 Vacuum Packed</span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Explore Our Range
            </p>
            <h2 className="font-playfair text-2xl font-bold sm:text-3xl">Featured Categories</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-primary"
            onClick={() => navigate("/products")}
          >
            View all <ArrowRight size={15} />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {featuredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border/60 p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ backgroundColor: cat.color || "#fef3c7" }}
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110 sm:h-24 sm:w-24">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    {cat.icon}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-foreground">{cat.name}</p>
                {cat.productCount !== undefined && (
                  <p className="text-[11px] text-foreground/60">{cat.productCount} products</p>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Shop <ArrowRight size={11} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Two-column highlight */}
      {bestsellers.length >= 2 && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {bestsellers.slice(0, 2).map((p, idx) => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.slug}`)}
                className={`group relative flex overflow-hidden rounded-3xl p-6 text-left shadow-md transition-all hover:shadow-xl ${
                  idx === 0
                    ? "bg-gradient-to-br from-amber-100 to-amber-200"
                    : "bg-gradient-to-br from-emerald-100 to-emerald-200"
                }`}
              >
                <div className="relative z-10 flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {idx === 0 ? "Gujarat's Famous" : "All-Time Classic"}
                  </p>
                  <h3 className="font-playfair text-xl font-bold leading-tight text-foreground sm:text-2xl">
                    {p.name.split("(")[0].trim()}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {idx === 0 ? "Extra-Crispy, Extra-Satisfying" : "Crunchy, Salty, Delicious"}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                      Shop Now <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform group-hover:rotate-6 sm:h-44 sm:w-44">
                  {p.images?.[0] && (
                    <Image src={p.images[0]} alt={p.name} fill sizes="176px" className="object-cover" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Deals of the Day */}
      {dealsOfDay.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-destructive">
                <Clock size={13} /> Limited Time
              </p>
              <h2 className="font-playfair text-2xl font-bold sm:text-3xl">Deals of the Day</h2>
            </div>
          </div>
          <Carousel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
              {dealsOfDay.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Carousel>
        </section>
      )}

      {/* Popular Products with tabs */}
      <section className="bg-muted/30 py-10 md:py-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Customer Favorites
            </p>
            <h2 className="font-playfair text-2xl font-bold sm:text-3xl">Popular Products</h2>
          </div>

          {/* Peanuts tab */}
          {popularPeanuts.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="text-2xl">🥜</span> Peanuts
                </h3>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => navigate("/category/roasted-peanuts")}>
                  Shop all <ArrowRight size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                {popularPeanuts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Chana tab */}
          {popularChana.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="text-2xl">🫘</span> Chana
                </h3>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => navigate("/category/roasted-chana")}>
                  Shop all <ArrowRight size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                {popularChana.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Combos */}
          {combos.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="text-2xl">📦</span> Combo Packs
                </h3>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => navigate("/category/kitchen-essentials")}>
                  Shop all <ArrowRight size={14} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
                {combos.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Satnam Singh Chana */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 via-amber-50/50 to-primary/5 p-6 md:p-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why Choose Us?
            </p>
            <h2 className="font-playfair text-2xl font-bold sm:text-3xl md:text-4xl">
              From Farm to Table — The Finest Quality
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Three generations of expertise in roasting the perfect chana and peanuts.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Leaf,
                title: "Freshness",
                desc: "Experience the unmatched freshness of our chana & peanuts. Rapid processing and airtight vacuum packaging lock in flavor and nutrition.",
                color: "text-emerald-600 bg-emerald-100",
              },
              {
                icon: Smile,
                title: "Taste",
                desc: "Savor the rich, nutty flavor that has delighted taste buds for generations. A perfect blend of tradition and taste in every bite.",
                color: "text-amber-600 bg-amber-100",
              },
              {
                icon: Heart,
                title: "Health",
                desc: "Packed with protein, fiber, and essential nutrients, our snacks are a wholesome choice for you and your family.",
                color: "text-rose-600 bg-rose-100",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center gap-3 rounded-2xl bg-card p-6 text-center shadow-sm"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${f.color}`}>
                  <f.icon size={26} />
                </div>
                <h3 className="font-playfair text-xl font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Loved by Thousands
            </p>
            <h2 className="font-playfair text-2xl font-bold sm:text-3xl">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
              >
                <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/15" />
                <StarRating rating={t.rating} size={16} />
                <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-primary-foreground shadow-xl md:p-12">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <h2 className="font-playfair text-2xl font-bold sm:text-3xl md:text-4xl">
              Ready to Taste the Difference?
            </h2>
            <p className="max-w-xl text-sm text-primary-foreground/90 sm:text-base">
              Join 50,000+ happy customers. Use code <span className="rounded bg-white/20 px-2 py-0.5 font-bold">WELCOME10</span> for 10% off your first order.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 rounded-full px-8 text-base shadow-lg"
              onClick={() => navigate("/products")}
            >
              Start Shopping <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    rating: 5,
    text: "The Khari Sing peanuts are the best I've ever had! Extra crispy and perfectly salted. The vacuum packaging keeps them fresh for months. Will order again!",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "I ordered the flavored chana combo and loved every flavor. The black pepper and mirch masala are my favorites. Healthy and tasty — perfect evening snack!",
  },
  {
    name: "Amit Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "Being from Gujarat, I know my peanuts. These are authentic, fresh and crunchy. Delivery was quick and the packaging was excellent. Highly recommended!",
  },
];

function Carousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar overflow-x-auto">
        {children}
      </div>
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
