"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Smile,
  Heart,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  Quote,
  BadgeIndianRupee,
  Flame,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shared/product-card";
import { StarRating } from "@/components/shared/star-rating";
import { BannerView, SmartImg } from "@/components/store/banner-view";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Product, Category, Settings } from "@/lib/types";
import type { Banner, HomeConfig, HomeSectionId, StorefrontData } from "@/lib/storefront-types";

interface HomeProps {
  products: Product[];
  categories: Category[];
  storefront: StorefrontData;
  settings: Settings;
}

export function Home({ products, categories, storefront, settings }: HomeProps) {
  const { banners, config } = storefront;
  const byPlacement = (p: Banner["placement"]) =>
    banners.filter((b) => b.placement === p).sort((a, b) => a.order - b.order);

  const sections: Record<HomeSectionId, React.ReactNode> = {
    hero: <HeroSlider banners={byPlacement("hero")} autoplay={config.heroAutoplaySeconds} />,
    trustStrip: <TrustStrip freeShip={settings.freeShippingThreshold} />,
    categories: <CategoryTiles categories={categories} products={products} title={config.categoriesTitle} />,
    tenPacks: <TenRupeePacks products={products} categories={categories} config={config} />,
    promo: <PromoBanners banners={byPlacement("promo")} />,
    deals: <DealsOfDay products={products} config={config} />,
    popular: <PopularProducts products={products} categories={categories} config={config} />,
    wide: <WideBanners banners={byPlacement("wide")} />,
    bestsellers: <Bestsellers products={products} title={config.bestsellersTitle} />,
    whyUs: <WhyUs />,
    testimonials: <Testimonials />,
    newsletter: <Newsletter />,
  };

  return (
    <div className="flex flex-col">
      {config.sections
        .filter((s) => s.enabled)
        .map((s) => (
          <div key={s.id}>{sections[s.id]}</div>
        ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero slider                                                         */
/* ------------------------------------------------------------------ */

function HeroSlider({ banners, autoplay }: { banners: Banner[]; autoplay: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = banners.length;

  useEffect(() => {
    if (count < 2 || paused || !autoplay) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), Math.max(2, autoplay) * 1000);
    return () => clearInterval(t);
  }, [count, paused, autoplay]);

  if (count === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.22,.8,.26,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div key={b.id} className="w-full shrink-0" aria-hidden={i !== index}>
            <BannerView banner={b} variant="hero" priority={i === 0} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-lg backdrop-blur transition hover:bg-white md:flex"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground shadow-lg backdrop-blur transition hover:bg-white md:flex"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === index ? "w-8 bg-[#0f6b43]" : "w-2.5 bg-black/25 hover:bg-black/40"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */

function TrustStrip({ freeShip }: { freeShip: number }) {
  const items = [
    { icon: Leaf, title: "No Added Colour", sub: "No preservatives" },
    { icon: Flame, title: "Traditionally Roasted", sub: "The way we have since 1992" },
    { icon: ShieldCheck, title: "Export Quality", sub: "High-protein sing & chana" },
    { icon: Truck, title: `Free Shipping ₹${freeShip}+`, sub: "Pan-India delivery" },
    { icon: BadgeIndianRupee, title: "Cash on Delivery", sub: "Pay when it arrives" },
  ];
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-4 sm:px-6 lg:justify-between">
        {items.map((it) => (
          <div key={it.title} className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f6b43]/10 text-[#0f6b43]">
              <it.icon size={19} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="text-[11px] text-muted-foreground">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const TILE_COLORS = ["#efd27a", "#ec8f8f", "#f6b98a", "#b9655c", "#cfe6b0", "#bcd7ef"];

function CategoryTiles({
  categories,
  products,
  title,
}: {
  categories: Category[];
  products: Product[];
  title: string;
}) {
  const { navigate } = useRouter();
  if (!categories.length) return null;
  const imageFor = (c: Category) =>
    c.image || products.find((p) => p.categoryId === c.id)?.images?.[0] || "/products/satnam/khari-sing.webp";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <SectionTitle title={title} />
      <div
        className={cn(
          "no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 sm:mx-auto sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0",
          categories.length >= 5 ? "lg:grid-cols-5" : categories.length === 4 ? "lg:grid-cols-4" : "lg:max-w-4xl"
        )}
      >
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => navigate(`/category/${c.slug}`)}
            className="group flex w-[46%] shrink-0 snap-start flex-col items-center gap-3 text-center sm:w-auto"
          >
            <div
              className="relative aspect-[1/0.95] w-full overflow-hidden rounded-xl"
              style={{ backgroundColor: c.color && c.color !== "#fef3c7" ? c.color : TILE_COLORS[i % TILE_COLORS.length] }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.45),transparent_62%)]" />
              <div className="absolute inset-[8%] transition-transform duration-500 [filter:drop-shadow(0_12px_14px_rgba(0,0,0,0.25))] group-hover:-translate-y-1 group-hover:scale-105">
                <SmartImg src={imageFor(c)} alt={c.name} sizes="(max-width:640px) 45vw, 20vw" className="object-contain" />
              </div>
              {c.icon && (
                <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow">
                  {c.icon}
                </span>
              )}
            </div>
            <div>
              <p className="text-base font-medium text-foreground sm:text-lg">{c.name}</p>
              <span className="mt-1 inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium text-foreground/80 transition-colors group-hover:border-[#0f6b43] group-hover:text-[#0f6b43]">
                Shop Collection <ArrowUpRight size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TenRupeePacks({
  products,
  categories,
  config,
}: {
  products: Product[];
  categories: Category[];
  config: HomeConfig;
}) {
  const { navigate } = useRouter();
  const cat = categories.find((c) => c.slug === config.tenPacksCategory);
  const list = cat ? products.filter((p) => p.categoryId === cat.id) : [];
  if (!list.length) return null;
  return (
    <section className="relative overflow-hidden bg-[#ffe27a] py-10 md:py-14">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-white/25" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <span className="flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full bg-[#1f3554] font-display text-4xl font-extrabold text-[#ffe27a] shadow-xl ring-4 ring-white">
            ₹10
          </span>
          <h2 className="font-display text-3xl font-extrabold text-[#1f2a24] sm:text-4xl">{config.tenPacksTitle}</h2>
          <p className="max-w-xs text-sm text-[#1f2a24]/75">
            Handy ₹10 packs of your favourite Satnam snacks — for the bag, the office drawer or the tiffin.
          </p>
          <Button
            className="gap-2 rounded-full bg-[#1f3554] px-6 hover:bg-[#162741]"
            onClick={() => navigate(`/category/${cat!.slug}`)}
          >
            Shop all ₹10 packs <ArrowRight size={16} />
          </Button>
        </div>
        <Rail arrows={list.length > 3}>
          {list.map((p) => (
            <div key={p.id} className="w-[48%] shrink-0 snap-start sm:w-[32%] lg:w-[calc(33.33%-11px)]">
              <ProductCard product={p} />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  );
}

function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
      <div className={cn("grid gap-5", banners.length > 1 && "md:grid-cols-2")}>
        {banners.slice(0, 4).map((b) => (
          <BannerView key={b.id} banner={b} variant="promo" />
        ))}
      </div>
    </section>
  );
}

function WideBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6">
      {banners.map((b) => (
        <BannerView key={b.id} banner={b} variant="wide" />
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Deals of the day                                                    */
/* ------------------------------------------------------------------ */

function nextMidnightIST(now: number) {
  const IST = 5.5 * 3600 * 1000;
  const day = 24 * 3600 * 1000;
  return Math.floor((now + IST) / day) * day + day - IST;
}

function useCountdown(config: HomeConfig) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (now === null || config.dealsTimer === "off") return null;
  const target =
    config.dealsTimer === "fixed" && config.dealsEndsAt ? new Date(config.dealsEndsAt).getTime() : nextMidnightIST(now);
  const diff = Math.max(0, target - now);
  if (config.dealsTimer === "fixed" && diff === 0) return null;
  const s = Math.floor(diff / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function DealsOfDay({ products, config }: { products: Product[]; config: HomeConfig }) {
  const deals = products.filter((p) => p.isDealOfDay).slice(0, 12);
  const left = useCountdown(config);
  if (!deals.length) return null;
  const cells = left
    ? [...(left.d ? [{ v: left.d, l: "Days" }] : []), { v: left.h, l: "Hrs" }, { v: left.m, l: "Min" }, { v: left.s, l: "Sec" }]
    : [];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mb-7 flex flex-col items-center gap-3 text-center">
        <h2 className="font-display text-3xl font-bold text-[#1f3b4d] sm:text-[2.6rem]">{config.dealsTitle}</h2>
        {cells.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-semibold text-destructive">
              <Flame size={16} /> Ends in
            </span>
            {cells.map((c) => (
              <span key={c.l} className="flex min-w-[52px] flex-col items-center rounded-lg bg-[#1f3b4d] px-2 py-1 text-white">
                <span className="font-display text-lg font-bold leading-none tabular-nums">{String(c.v).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-75">{c.l}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <Rail>
        {deals.map((p) => (
          <div key={p.id} className="w-[48%] shrink-0 snap-start sm:w-[32%] lg:w-[calc(25%-12px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </Rail>
    </section>
  );
}

function Rail({ children, arrows = true }: { children: React.ReactNode; arrows?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:gap-4">
        {children}
      </div>
      {arrows && (
      <>
      <button
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-[38%] hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute -right-4 top-[38%] hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-muted md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
      </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PopularProducts({
  products,
  categories,
  config,
}: {
  products: Product[];
  categories: Category[];
  config: HomeConfig;
}) {
  const { navigate } = useRouter();
  const tabs = useMemo(() => {
    const list = config.popularTabs.length
      ? config.popularTabs.map((s) => categories.find((c) => c.slug === s)).filter(Boolean) as Category[]
      : categories;
    return [{ id: "all", slug: "", name: "All" } as Pick<Category, "id" | "slug" | "name">, ...list.filter((c) => (c.productCount ?? 1) > 0)];
  }, [categories, config.popularTabs]);
  const [active, setActive] = useState("all");

  const shown = useMemo(() => {
    const list = active === "all" ? products : products.filter((p) => p.categoryId === active);
    return [...list].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);
  }, [products, active]);

  const activeSlug = tabs.find((t) => t.id === active)?.slug;

  return (
    <section className="bg-[#f7f5ef] py-10 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl font-bold text-[#1f3b4d] sm:text-[2.6rem]">{config.popularTitle}</h2>
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors sm:text-base",
                  active === t.id ? "border-[#1f3b4d] text-[#1f3b4d]" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="gap-2 rounded-full border-[#1f3b4d] px-8 text-[#1f3b4d] hover:bg-[#1f3b4d] hover:text-white"
            onClick={() => navigate(activeSlug ? `/category/${activeSlug}` : "/products")}
          >
            View all products <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Bestsellers({ products, title }: { products: Product[]; title: string }) {
  const list = products.filter((p) => p.isBestseller).slice(0, 8);
  // With a small catalog this would just repeat Popular Products
  if (list.length < 3) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <SectionTitle title={title} />
      <Rail>
        {list.map((p) => (
          <div key={p.id} className="w-[48%] shrink-0 snap-start sm:w-[32%] lg:w-[calc(25%-12px)]">
            <ProductCard product={p} />
          </div>
        ))}
      </Rail>
    </section>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="mb-7 text-center font-display text-3xl font-bold text-[#1f3b4d] sm:text-[2.6rem]">{title}</h2>
  );
}

/* ------------------------------------------------------------------ */

function WhyUs() {
  const items = [
    {
      icon: Leaf,
      title: "Freshness",
      desc: "Roasted the traditional way and packed fresh, so every pack opens crisp and crunchy.",
      color: "text-emerald-700 bg-emerald-100",
    },
    {
      icon: Smile,
      title: "Taste",
      desc: "From classic Khari Sing to chatpata Masala Chana — the taste Gujarat has trusted since 1992.",
      color: "text-amber-700 bg-amber-100",
    },
    {
      icon: Heart,
      title: "Health",
      desc: "High in protein with no added colour or preservatives. Snacking you don't have to hide.",
      color: "text-rose-700 bg-rose-100",
    },
  ];
  return (
    <section className="bg-[#0f5132] py-12 text-white md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#f5c542]">Since 1992 · Quality is our recipe!</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">From Farm to Table — The Finest Quality</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3 rounded-2xl bg-white/[0.06] p-7 text-center ring-1 ring-white/10">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${f.color}`}>
                <f.icon size={26} />
              </div>
              <h3 className="font-display text-2xl font-bold">{f.title}</h3>
              <p className="text-sm text-white/75">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    rating: 5,
    text: "The Khari Sing peanuts are the best I've ever had! Extra crispy and perfectly salted. The vacuum packaging keeps them fresh for months.",
  },
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Ordered the flavoured chana combo and loved every flavour. Black pepper and mirch masala are my favourites — perfect evening snack!",
  },
  {
    name: "Amit Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "Being from Gujarat, I know my peanuts. These are authentic, fresh and crunchy. Delivery was quick and packing was excellent.",
  },
];

function Testimonials() {
  return (
    <section className="bg-[#f7f5ef] py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionTitle title="What Our Customers Say" />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <Quote className="absolute right-4 top-4 h-8 w-8 text-[#0f6b43]/15" />
              <StarRating rating={t.rating} size={16} />
              <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f6b43]/10 font-bold text-[#0f6b43]">
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
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    setLoading(true);
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error();
      toast.success("You're in! Watch your inbox for exclusive offers 🎉");
      setEmail("");
    } catch {
      toast.error("Could not subscribe, please try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[#efd27a] px-6 py-10 text-center sm:px-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/25" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/20" />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0f6b43] shadow">
            <Mail size={22} />
          </span>
          <h2 className="font-display text-2xl font-bold text-[#1f2a24] sm:text-3xl">Get offers before everyone else</h2>
          <p className="text-sm text-[#1f2a24]/75">New flavours, festive combos and members-only coupons. No spam, promise.</p>
          <form onSubmit={submit} className="mt-2 flex w-full max-w-md gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-11 flex-1 rounded-full border-0 bg-white px-5"
            />
            <Button type="submit" disabled={loading} className="h-11 rounded-full bg-[#0f6b43] px-6 hover:bg-[#0c5a38]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
