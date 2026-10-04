import { db } from "./db";
import {
  DEFAULT_BANNERS,
  DEFAULT_HOME_CONFIG,
  isBannerLive,
  type Banner,
  type HomeConfig,
  type StorefrontData,
} from "./storefront-types";

const BANNERS_KEY = "storefront_banners";
const CONFIG_KEY = "storefront_config";

function safeParse<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mergeConfig(saved: Partial<HomeConfig>): HomeConfig {
  const cfg: HomeConfig = { ...DEFAULT_HOME_CONFIG, ...saved };
  // Keep section list complete even if new sections were added after the admin saved
  const savedSections = Array.isArray(saved.sections) ? saved.sections : [];
  const known = new Set(savedSections.map((s) => s.id));
  cfg.sections = [
    ...savedSections.filter((s) => DEFAULT_HOME_CONFIG.sections.some((d) => d.id === s.id)),
    ...DEFAULT_HOME_CONFIG.sections.filter((d) => !known.has(d.id)),
  ];
  if (!Array.isArray(cfg.announcements)) cfg.announcements = DEFAULT_HOME_CONFIG.announcements;
  if (!Array.isArray(cfg.popularTabs)) cfg.popularTabs = [];
  return cfg;
}

/** Everything (including inactive / scheduled banners) — for admin. */
export async function getStorefront(): Promise<StorefrontData> {
  const rows = await db.setting.findMany({ where: { key: { in: [BANNERS_KEY, CONFIG_KEY] } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const banners = map.has(BANNERS_KEY)
    ? safeParse<Banner[]>(map.get(BANNERS_KEY), DEFAULT_BANNERS)
    : DEFAULT_BANNERS;
  const config = mergeConfig(safeParse<Partial<HomeConfig>>(map.get(CONFIG_KEY), {}));
  return { banners: [...banners].sort((a, b) => a.order - b.order), config };
}

/** Only live banners — for the public storefront. */
export async function getPublicStorefront(): Promise<StorefrontData> {
  try {
    const data = await getStorefront();
    const now = new Date();
    return { ...data, banners: data.banners.filter((b) => isBannerLive(b, now)) };
  } catch (e) {
    console.error("[storefront] falling back to defaults:", e);
    return { banners: DEFAULT_BANNERS, config: DEFAULT_HOME_CONFIG };
  }
}

async function upsert(key: string, value: string) {
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : undefined);

export function sanitizeBanner(input: Partial<Banner>, index: number): Banner {
  const placement = (["hero", "promo", "wide", "popup"] as const).includes(input.placement as never)
    ? (input.placement as Banner["placement"])
    : "hero";
  return {
    id: str(input.id, 60) || `b-${Date.now().toString(36)}-${index}`,
    placement,
    mode: input.mode === "image" ? "image" : "designed",
    eyebrow: str(input.eyebrow, 80),
    title: str(input.title, 160) || "",
    highlight: str(input.highlight, 80),
    subtitle: str(input.subtitle, 300),
    ctaLabel: str(input.ctaLabel, 40),
    ctaLink: str(input.ctaLink, 300),
    couponCode: str(input.couponCode, 40)?.toUpperCase(),
    image: str(input.image),
    desktopImage: str(input.desktopImage),
    mobileImage: str(input.mobileImage),
    bgColor: str(input.bgColor, 20),
    accentColor: str(input.accentColor, 20),
    textTheme: input.textTheme === "light" ? "light" : "dark",
    isActive: input.isActive !== false,
    startsAt: str(input.startsAt, 40) || null,
    endsAt: str(input.endsAt, 40) || null,
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : index,
  };
}

export async function saveStorefront(data: Partial<StorefrontData>): Promise<StorefrontData> {
  if (Array.isArray(data.banners)) {
    const banners = data.banners.slice(0, 60).map((b, i) => sanitizeBanner(b, i));
    await upsert(BANNERS_KEY, JSON.stringify(banners));
  }
  if (data.config && typeof data.config === "object") {
    const cfg = mergeConfig(data.config);
    await upsert(CONFIG_KEY, JSON.stringify(cfg));
  }
  return getStorefront();
}
