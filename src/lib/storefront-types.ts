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
  imageStyle?: "frame" | "cutout"; // frame = photo in a white frame, cutout = transparent pack shot floating
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
  | "tenPacks"
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
  tenPacksTitle: string;
  tenPacksCategory: string; // category slug whose products show in the ₹10 section
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
  tenPacks: "₹10 Packs section",
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
  logoUrl: "/brand/satnam-logo.png",
  announcements: [
    "🚚 Free shipping on orders above ₹499",
    "🎉 Flat 10% OFF on your first order — use code WELCOME10",
    "🥜 Freshly roasted & vacuum packed in Gujarat",
  ],
  heroAutoplaySeconds: 5,
  categoriesTitle: "Shop by Category",
  tenPacksTitle: "Sirf ₹10 Mein!",
  tenPacksCategory: "10-rupee-packs",
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
    { id: "tenPacks", enabled: true },
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

const P = "/products/satnam";

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "hero-1",
    placement: "hero",
    mode: "designed",
    eyebrow: "Since 1992",
    title: "Gujarat's Famous Roasted Khari Sing",
    highlight: "Khari Sing",
    subtitle: "Roasted in the shell, perfectly salted and extra crunchy. Quality is our recipe!",
    ctaLabel: "Shop Now",
    ctaLink: "/product/roasted-khari-sing",
    image: `${P}/khari-sing-loose.webp`,
    imageStyle: "cutout",
    bgColor: "#e9d7c1",
    accentColor: "#2f6b3a",
    textTheme: "dark",
    isActive: true,
    order: 1,
  },
  {
    id: "hero-2",
    placement: "hero",
    mode: "designed",
    eyebrow: "Chatpata Range",
    title: "Masala Sing & Masala Chana",
    highlight: "Masala",
    subtitle: "Bold red-chilli masala, traditionally roasted. No added colour, no preservatives.",
    ctaLabel: "Shop Masala Range",
    ctaLink: "/category/masala-range",
    image: `${P}/masala-sing-loose.webp`,
    imageStyle: "cutout",
    couponCode: "WELCOME10",
    bgColor: "#f3c2a6",
    accentColor: "#5a2d3c",
    textTheme: "dark",
    isActive: true,
    order: 2,
  },
  {
    id: "hero-3",
    placement: "hero",
    mode: "designed",
    eyebrow: "Export Quality",
    title: "Khara Chana & Mora Chana",
    highlight: "Chana",
    subtitle: "Roasted the traditional way — with salt & haldi, or plain. ₹160/kg.",
    ctaLabel: "Shop Chana",
    ctaLink: "/product/khara-chana",
    image: `${P}/khara-chana.webp`,
    imageStyle: "cutout",
    bgColor: "#efd27a",
    accentColor: "#2f6b3a",
    textTheme: "dark",
    isActive: true,
    order: 3,
  },
  {
    id: "hero-4",
    placement: "hero",
    mode: "designed",
    eyebrow: "Pocket Friendly",
    title: "Your favourite snacks, Sirf ₹10",
    highlight: "₹10",
    subtitle: "Khari Sing, Masala Sing & Masala Chana in handy ₹10 packs.",
    ctaLabel: "Shop ₹10 Packs",
    ctaLink: "/category/10-rupee-packs",
    image: `${P}/masala-chana-10.webp`,
    imageStyle: "cutout",
    bgColor: "#ffe27a",
    accentColor: "#1f3554",
    textTheme: "dark",
    isActive: true,
    order: 4,
  },
  {
    id: "promo-1",
    placement: "promo",
    mode: "designed",
    title: "Chatpata Masala Chana",
    highlight: "Masala Chana",
    subtitle: "Spicy, tangy, export quality",
    ctaLabel: "Shop Now",
    ctaLink: "/product/chatpata-masala-chana",
    image: `${P}/masala-chana-family.webp`,
    imageStyle: "cutout",
    bgColor: "#1f3554",
    accentColor: "#f5c542",
    textTheme: "light",
    isActive: true,
    order: 1,
  },
  {
    id: "promo-2",
    placement: "promo",
    mode: "designed",
    title: "Roasted Khari Sing",
    highlight: "Khari Sing",
    subtitle: "High protein, extra crunchy",
    ctaLabel: "Shop Now",
    ctaLink: "/product/roasted-khari-sing",
    image: `${P}/khari-sing-loose.webp`,
    imageStyle: "cutout",
    bgColor: "#c5d9a0",
    accentColor: "#2f6b3a",
    textTheme: "dark",
    isActive: true,
    order: 2,
  },
  {
    id: "wide-1",
    placement: "wide",
    mode: "designed",
    eyebrow: "Special Offer",
    title: "Flat ₹50 OFF on orders above ₹499",
    highlight: "₹50 OFF",
    subtitle: "Stock up on Khari Sing, Mori Sing, Masala Sing & Chana. Limited period only.",
    ctaLabel: "Grab the Deal",
    ctaLink: "/products",
    couponCode: "FLAT50",
    image: `${P}/masala-chana-family.webp`,
    imageStyle: "cutout",
    bgColor: "#2f6b3a",
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
    subtitle: "Use the code below at checkout. Valid on all Satnam sing & chana.",
    ctaLabel: "Start Shopping",
    ctaLink: "/products",
    couponCode: "WELCOME10",
    image: `${P}/khari-sing-loose.webp`,
    imageStyle: "cutout",
    bgColor: "#fff6df",
    accentColor: "#2f6b3a",
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
