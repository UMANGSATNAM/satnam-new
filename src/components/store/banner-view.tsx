"use client";

import Image from "next/image";
import { ShoppingCart, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import type { Banner } from "@/lib/storefront-types";

/** next/image for bundled assets, unoptimized for admin uploads / external URLs. */
export function SmartImg({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const unoptimized = src.startsWith("/uploads") || /^https?:\/\//.test(src) || src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes || "50vw"}
      priority={priority}
      unoptimized={unoptimized}
      className={className}
    />
  );
}

export function goTo(link?: string) {
  if (!link) return;
  if (/^https?:\/\//.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
  } else {
    navigate(link.replace(/^#/, ""));
  }
}

/** Decorative line-art leaves, like the botanical sketches on premium Indian snack packs. */
function Leaves({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke={color} strokeWidth="1.6" aria-hidden>
      <path d="M100 195 C100 140 96 90 70 30" />
      <path d="M98 150 C70 140 52 118 48 92 C74 100 92 118 98 150Z" />
      <path d="M97 112 C76 100 66 80 66 58 C86 70 96 90 97 112Z" />
      <path d="M100 150 C126 136 142 112 144 86 C120 96 104 118 100 150Z" />
      <path d="M99 108 C118 96 128 76 126 54 C108 66 100 86 99 108Z" />
      <path d="M78 58 C68 44 66 28 72 12 C82 26 84 42 78 58Z" />
    </svg>
  );
}

function Title({ banner, className }: { banner: Banner; className?: string }) {
  const { title, highlight, accentColor } = banner;
  if (highlight && title.includes(highlight)) {
    const [before, ...rest] = title.split(highlight);
    return (
      <h2 className={className}>
        {before}
        <span style={{ color: banner.textTheme === "light" ? "#ffe08a" : accentColor }}>{highlight}</span>
        {rest.join(highlight)}
      </h2>
    );
  }
  return <h2 className={className}>{title}</h2>;
}

export function CouponChip({ code, light }: { code: string; light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(code).catch(() => {});
        setCopied(true);
        toast.success(`Code ${code} copied — apply it at checkout`);
        setTimeout(() => setCopied(false), 1800);
      }}
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-lg border-2 border-dashed px-3 py-1.5 text-xs font-bold tracking-widest transition-transform hover:scale-[1.03] sm:text-sm",
        light ? "border-white/70 bg-white/10 text-white" : "border-current/40 bg-white/70 text-foreground"
      )}
    >
      {code}
      {copied ? <Check size={14} /> : <Copy size={14} className="opacity-70" />}
    </button>
  );
}

type Variant = "hero" | "promo" | "wide" | "popup";

/** Pick dark or white text for a given background hex so buttons stay readable. */
function readableText(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#1f2a24" : "#ffffff";
}

/**
 * Renders any banner. Used on the storefront AND as the live preview inside the admin editor,
 * so what the admin sees is exactly what customers get.
 */
export function BannerView({
  banner,
  variant,
  priority,
  preview,
}: {
  banner: Banner;
  variant: Variant;
  priority?: boolean;
  preview?: boolean;
}) {
  const light = banner.textTheme === "light";
  const accent = banner.accentColor || "#0f6b43";
  const onClick = () => !preview && goTo(banner.ctaLink);

  // ---------- Image mode: ready-made creative ----------
  if (banner.mode === "image") {
    const desktop = banner.desktopImage || banner.image;
    const mobile = banner.mobileImage || desktop;
    const ratio =
      variant === "hero"
        ? "aspect-[4/5] sm:aspect-[16/7] lg:aspect-[16/6]"
        : variant === "promo"
          ? "aspect-[16/9]"
          : variant === "wide"
            ? "aspect-[4/3] sm:aspect-[16/5]"
            : "aspect-square";
    return (
      <div
        role={banner.ctaLink ? "link" : undefined}
        onClick={onClick}
        className={cn(
          "relative w-full overflow-hidden",
          ratio,
          variant !== "hero" && "rounded-2xl",
          banner.ctaLink && !preview && "cursor-pointer"
        )}
        style={{ backgroundColor: banner.bgColor || "#f4efe3" }}
      >
        {desktop ? (
          <>
            <div className={cn("absolute inset-0", mobile !== desktop && "hidden sm:block")}>
              <SmartImg src={desktop} alt={banner.title || "Offer"} priority={priority} sizes="100vw" className="object-cover" />
            </div>
            {mobile !== desktop && mobile && (
              <div className="absolute inset-0 sm:hidden">
                <SmartImg src={mobile} alt={banner.title || "Offer"} priority={priority} sizes="100vw" className="object-cover" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Upload a banner image</div>
        )}
      </div>
    );
  }

  // ---------- Designed mode ----------
  const textColor = light ? "text-white" : "text-[#1f2a24]";
  const subColor = light ? "text-white/85" : "text-[#1f2a24]/75";

  const cta = banner.ctaLabel ? (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition-transform group-hover:scale-105 sm:px-6 sm:py-3"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: readableText(accent) }}
    >
      <ShoppingCart size={16} /> {banner.ctaLabel}
    </span>
  ) : null;

  const productImage = !banner.image ? null : banner.imageStyle === "cutout" ? (
    // Transparent pack shot: no frame, floats with a soft shadow
    <div
      className={cn(
        "relative transition-transform duration-500 [filter:drop-shadow(0_18px_22px_rgba(0,0,0,0.28))] group-hover:-translate-y-1 group-hover:rotate-0",
        variant === "hero" && "aspect-square w-[70%] max-w-[460px] rotate-[4deg] sm:w-full",
        variant === "promo" && "aspect-square w-full rotate-[5deg] scale-110",
        variant === "wide" && "aspect-square w-full rotate-[4deg] scale-125",
        variant === "popup" && "aspect-square w-full"
      )}
    >
      <SmartImg src={banner.image} alt={banner.title} priority={priority} sizes="(max-width: 768px) 70vw, 35vw" className="object-contain" />
    </div>
  ) : (
    <div
      className={cn(
        "relative overflow-hidden border-[6px] border-white/90 shadow-2xl transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.03]",
        variant === "hero" && "aspect-square w-[62%] max-w-[420px] rotate-3 rounded-[2rem] sm:w-full",
        variant === "promo" && "aspect-[4/5] w-full rotate-3 rounded-[1.5rem]",
        variant === "wide" && "aspect-square w-full rotate-2 rounded-full",
        variant === "popup" && "aspect-square w-full rounded-[1.5rem]"
      )}
    >
      <SmartImg src={banner.image} alt={banner.title} priority={priority} sizes="(max-width: 768px) 60vw, 30vw" className="object-cover" />
    </div>
  );

  if (variant === "hero") {
    return (
      <div
        onClick={onClick}
        className={cn("group relative w-full overflow-hidden", !preview && banner.ctaLink && "cursor-pointer")}
        style={{ backgroundColor: banner.bgColor || "#f3d98b" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.45),transparent_55%)]" />
        <Leaves color={light ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.10)"} className="pointer-events-none absolute -bottom-6 left-[42%] hidden h-64 w-64 md:block" />
        <Leaves color={light ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"} className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rotate-180" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 pb-10 pt-8 sm:px-8 md:grid-cols-[1.15fr_1fr] md:py-14 lg:min-h-[460px]">
          <div className={cn("flex flex-col gap-3 sm:gap-4", textColor)}>
            {banner.eyebrow && (
              <span
                className="w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs"
                style={{ backgroundColor: light ? "rgba(255,255,255,0.18)" : `${accent}1f`, color: light ? "#fff" : accent }}
              >
                {banner.eyebrow}
              </span>
            )}
            <Title
              banner={banner}
              className="font-display text-[2.1rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            />
            <span className={cn("h-[3px] w-16 rounded-full", light ? "bg-white/60" : "bg-black/20")} />
            {banner.subtitle && <p className={cn("max-w-md text-sm sm:text-lg", subColor)}>{banner.subtitle}</p>}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {cta}
              {banner.couponCode && <CouponChip code={banner.couponCode} light={light} />}
            </div>
          </div>
          <div className="flex justify-center md:justify-end md:pr-6">{productImage}</div>
        </div>
      </div>
    );
  }

  if (variant === "promo") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group relative grid h-full min-h-[220px] grid-cols-[1.25fr_1fr] items-center gap-3 overflow-hidden rounded-2xl p-5 sm:min-h-[300px] sm:p-8",
          !preview && banner.ctaLink && "cursor-pointer"
        )}
        style={{ backgroundColor: banner.bgColor || "#d9b44a" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.35),transparent_60%)]" />
        <Leaves color={light ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.09)"} className="pointer-events-none absolute -bottom-10 -left-6 h-44 w-44" />
        <div className={cn("relative flex flex-col gap-2 sm:gap-3", textColor)}>
          {banner.eyebrow && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 sm:text-xs">{banner.eyebrow}</span>
          )}
          <Title banner={banner} className="font-display text-xl font-extrabold leading-tight sm:text-3xl lg:text-[2.1rem]" />
          <span className={cn("h-[2px] w-12 rounded-full", light ? "bg-white/60" : "bg-black/20")} />
          {banner.subtitle && <p className={cn("text-xs sm:text-base", subColor)}>{banner.subtitle}</p>}
          {banner.couponCode && <CouponChip code={banner.couponCode} light={light} />}
          <div className="pt-1 [&>span]:px-4 [&>span]:py-2 [&>span]:text-xs sm:[&>span]:text-sm">{cta}</div>
        </div>
        <div className="relative flex justify-center px-1">{productImage}</div>
      </div>
    );
  }

  if (variant === "wide") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group relative overflow-hidden rounded-3xl px-6 py-8 sm:px-12 sm:py-10",
          !preview && banner.ctaLink && "cursor-pointer"
        )}
        style={{ backgroundColor: banner.bgColor || "#0f5132" }}
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-white/5" />
        <Leaves color={light ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)"} className="pointer-events-none absolute -right-6 bottom-0 h-56 w-56" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div className={cn("flex flex-col gap-3", textColor)}>
            {banner.eyebrow && (
              <span
                className="w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ backgroundColor: banner.accentColor || "#f5c542", color: "#1f2a24" }}
              >
                {banner.eyebrow}
              </span>
            )}
            <Title banner={banner} className="font-display text-2xl font-extrabold leading-tight sm:text-4xl" />
            {banner.subtitle && <p className={cn("max-w-xl text-sm sm:text-base", subColor)}>{banner.subtitle}</p>}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {banner.couponCode && <CouponChip code={banner.couponCode} light={light} />}
              {cta}
            </div>
          </div>
          {banner.image && <div className="mx-auto hidden w-48 md:block lg:w-56">{productImage}</div>}
        </div>
      </div>
    );
  }

  // popup
  return (
    <div className="grid overflow-hidden rounded-2xl sm:grid-cols-[0.9fr_1.1fr]" style={{ backgroundColor: banner.bgColor || "#fff6df" }}>
      <div className="relative hidden p-5 sm:block">{productImage}</div>
      <div className={cn("flex flex-col gap-3 p-6 sm:py-8 sm:pl-2 sm:pr-8", textColor)}>
        {banner.eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: light ? "#ffe08a" : accent }}>
            {banner.eyebrow}
          </span>
        )}
        <Title banner={banner} className="font-display text-2xl font-extrabold leading-tight sm:text-3xl" />
        {banner.subtitle && <p className={cn("text-sm", subColor)}>{banner.subtitle}</p>}
        {banner.couponCode && <CouponChip code={banner.couponCode} light={light} />}
        {banner.ctaLabel && (
          <button type="button" onClick={onClick} className="group w-fit">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}
