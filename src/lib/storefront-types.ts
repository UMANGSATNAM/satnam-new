// Storefront (homepage) content managed from Admin → Banners & Offers / Homepage.
// Stored as JSON in the existing `Setting` table, so no DB migration is needed.

export type BannerPlacement = "hero" | "promo" | "wide" | "popup";

export interface Banner {
  id: string;
  placement: BannerPlacement;
  /** "designed" = we compose text + product image on a coloured background.
   *  "image"    = a ready-made creative (from Canva/Photoshop) is shown as-is. */
  mode: "designed" | "image";
  eyebrow?: string; // small line above the title e.g. "LIMITED OFFER"
  title: string;
  highlight?: string; // part of the title shown in accent colour
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string; // e.g. /category/roasted-peanuts or /product/slug
  couponCode?: string; // shown as a copyable chip
  image?: string; // product / side image (designed mode)
  desktopImage?: string; // full creative (image mode) — recommended 1600x600 for hero
  mobileImage?: string; // optional creative for phones — 800x800
  bgColor?: string; // hex
  accentColor?: string; // hex
  textTheme?: "dark" | "light";
  isActive: boolean;
  startsAt?: string | null; // ISO
  endsAt?: string | null; // ISO
  order: number;
}

export type HomeSectionId =
  | "hero"
  | "trustStrip"
  | "categories"
  | "promo"
  | "deals"
  | "popular"
  | "wide"
  | "bestsellers"
  | "whyUs"
  | "testimonials"
  | "newsletter";

export interface HomeConfig {
  logoUrl?: string;
  announcements: string[]; // rotating top-bar offers
  heroAutoplaySeconds: number;
  categoriesTitle: string;
  dealsTitle: string;
  /** "midnight" = countdown resets every night (IST). "fixed" = counts down to dealsEndsAt. "off" = no timer */
  dealsTimer: "midnight" | "fixed" | "off";
  dealsEndsAt?: string | null;
  popularTitle: string;
  popularTabs: string[]; // category slugs; empty = all categories
  bestsellersTitle: string;
  popupEnabled: boolean;
  popupDelaySeconds: number;
  sections: { id: HomeSectionId; enabled: boolean }[];
}

export interface StorefrontData {
  banners: Banner[];
  config: HomeConfig;
}

export const SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "Hero banner slider",
  trustStrip: "Trust strip (Natural • Vacuum packed …)",
  categories: "Shop by category tiles",
  promo: "Promo banners (2 side-by-side)",
  deals: "Deals of the Day + countdown",
  popular: "Popular products with tabs",
  wide: "Full-width offer banner",
  bestsellers: "Bestsellers",
  whyUs: "Why choose us",
  testimonials: "Customer reviews",
  newsletter: "Newsletter / offer signup",
};

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  logoUrl: "",
  announcements: [
    "🚚 Free shipping on orders above ₹499",
    "🎉 Flat 10% OFF on your first order — use code WELCOME10",
    "🥜 Freshly roasted & vacuum packed in Gujarat",
  ],
  heroAutoplaySeconds: 5,
  categoriesTitle: "Shop by Category",
  dealsTitle: "Deals Of The Day",
  dealsTimer: "midnight",
  dealsEndsAt: null,
  popularTitle: "Popular Products",
  popularTabs: [],
  bestsellersTitle: "Bestsellers",
  popupEnabled: true,
  popupDelaySeconds: 6,
  sections: [
    { id: "hero", enabled: true },
    { id: "trustStrip", enabled: true },
    { id: "categories", enabled: true },
    { id: "promo", enabled: true },
    { id: "deals", enabled: true },
    { id: "popular", enabled: true },
    { id: "wide", enabled: true },
    { id: "bestsellers", enabled: true },
    { id: "whyUs", enabled: true },
    { id: "testimonials", enabled: true },
    { id: "newsletter", enabled: true },
  ],
};

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "hero-1",
    placement: "hero",
    mode: "designed",
    eyebrow: "Gujarat's Famous",
    title: "Jumbo Khari Sing",
    highlight: "Khari Sing",
    subtitle: "Traditionally roasted, perfectly salted, extra-crispy. Straight from Unjha to your door.",
    ctaLabel: "Shop Now",
    ctaLink: "/category/roasted-peanuts",
    image: "/products/roasted-peanuts-husk.png",
    bgColor: "#f3d98b",
    accentColor: "#0f6b43",
    textTheme: "dark",
    isActive: true,
    order: 1,
  },
  {
    id: "hero-2",
    placement: "hero",
    mode: "designed",
    eyebrow: "New Flavours",
    title: "Masaledar Roasted Chana",
    highlight: "Roasted Chana",
    subtitle: "Black pepper, hing-jeera, chatpata masala — high protein, zero guilt.",
    ctaLabel: "Explore Flavours",
    ctaLink: "/category/flavored-chana",
    image: "/products/flavored-chana.png",
    couponCode: "WELCOME10",
    bgColor: "#cfe3b4",
    accentColor: "#0f6b43",
    textTheme: "dark",
    isActive: true,
    order: 2,
  },
  {
    id: "hero-3",
    placement: "hero",
    mode: "designed",
    eyebrow: "Combo Saver",
    title: "Variety Packs — Save up to 25%",
    highlight: "25%",
    subtitle: "Try every flavour in one box. Perfect for gifting and family snacking.",
    ctaLabel: "Shop Combos",
    ctaLink: "/category/kitchen-essentials",
    image: "/products/combo-pack.png",
    bgColor: "#f6c9a8",
    accentColor: "#b3261e",
    textTheme: "dark",
    isActive: true,
    order: 3,
  },
  {
    id: "promo-1",
    placement: "promo",
    mode: "designed",
    title: "Gujarat's Famous Jumbo Khari Sing!",
    subtitle: "Extra-Crispy, Extra-Satisfying",
    ctaLabel: "Shop Now",
    ctaLink: "/category/roasted-peanuts",
    image: "/products/roasted-peanuts-dark.png",
    bgColor: "#d9b44a",
    accentColor: "#0f6b43",
    textTheme: "light",
    isActive: true,
    order: 1,
  },
  {
    id: "promo-2",
    placement: "promo",
    mode: "designed",
    title: "Classic Salted Roasted Peanuts",
    highlight: "Roasted Peanuts",
    subtitle: "Crunchy, Salty, Delicious",
    ctaLabel: "Shop Now",
    ctaLink: "/product/classic-salted-roasted-peanuts",
    image: "/products/roasted-peanuts-salted.png",
    bgColor: "#c5d9a0",
    accentColor: "#b8860b",
    textTheme: "dark",
    isActive: true,
    order: 2,
  },
  {
    id: "wide-1",
    placement: "wide",
    mode: "designed",
    eyebrow: "Festive Offer",
    title: "Flat ₹50 OFF on orders above ₹499",
    highlight: "₹50 OFF",
    subtitle: "Stock up on your favourite peanuts & chana. Limited period only.",
    ctaLabel: "Grab the Deal",
    ctaLink: "/products",
    couponCode: "FLAT50",
    image: "/products/chikki.png",
    bgColor: "#0f5132",
    accentColor: "#f5c542",
    textTheme: "light",
    isActive: true,
    order: 1,
  },
  {
    id: "popup-1",
    placement: "popup",
    mode: "designed",
    eyebrow: "Welcome Gift",
    title: "Get 10% OFF your first order",
    highlight: "10% OFF",
    subtitle: "Use the code below at checkout. Valid on all peanuts, chana & combos.",
    ctaLabel: "Start Shopping",
    ctaLink: "/products",
    couponCode: "WELCOME10",
    image: "/products/roasted-chana-plain.png",
    bgColor: "#fff6df",
    accentColor: "#0f6b43",
    textTheme: "dark",
    isActive: true,
    order: 1,
  },
];

export function isBannerLive(b: Banner, now = new Date()): boolean {
  if (!b.isActive) return false;
  if (b.startsAt && new Date(b.startsAt) > now) return false;
  if (b.endsAt && new Date(b.endsAt) < now) return false;
  return true;
}
