import { db } from "./db";
import { DEFAULT_SETTINGS, type Settings } from "./types";

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;

  const num = (key: string, fallback: number) => {
    const v = map[key];
    if (v === undefined || v === "") return fallback;
    const n = Number(v);
    return isNaN(n) ? fallback : n;
  };
  const bool = (key: string, fallback: boolean) => {
    const v = map[key];
    if (v === undefined) return fallback;
    return v === "true" || v === "1";
  };

  return {
    ...DEFAULT_SETTINGS,
    brandName: map.brandName || DEFAULT_SETTINGS.brandName,
    tagline: map.tagline || DEFAULT_SETTINGS.tagline,
    email: map.email || DEFAULT_SETTINGS.email,
    phone: map.phone || DEFAULT_SETTINGS.phone,
    address: map.address || DEFAULT_SETTINGS.address,
    facebook: map.facebook || DEFAULT_SETTINGS.facebook,
    twitter: map.twitter || DEFAULT_SETTINGS.twitter,
    instagram: map.instagram || DEFAULT_SETTINGS.instagram,
    linkedin: map.linkedin || DEFAULT_SETTINGS.linkedin,
    freeShippingThreshold: num("freeShippingThreshold", DEFAULT_SETTINGS.freeShippingThreshold),
    shippingFee: num("shippingFee", DEFAULT_SETTINGS.shippingFee),
    announcementBar: map.announcementBar || DEFAULT_SETTINGS.announcementBar,
    // Payment — DB first, then env fallback
    razorpayKeyId: map.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: map.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "",
    paymentEnabled: bool("paymentEnabled", DEFAULT_SETTINGS.paymentEnabled),
    codEnabled: bool("codEnabled", DEFAULT_SETTINGS.codEnabled),
    upiId: map.upiId || "",
    // Email — DB first, then env fallback
    gmailUser: map.gmailUser || process.env.GMAIL_USER || "",
    gmailAppPassword: map.gmailAppPassword || process.env.GMAIL_APP_PASSWORD || "",
    storeNotifyEmail: map.storeNotifyEmail || process.env.STORE_NOTIFY_EMAIL || "",
    emailEnabled: bool("emailEnabled", DEFAULT_SETTINGS.emailEnabled),
  };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    // Skip undefined values; allow empty strings to clear
    if (value === undefined) continue;
    const strValue = typeof value === "boolean" ? String(value) : String(value);
    const existing = await db.setting.findUnique({ where: { key } });
    if (existing) {
      await db.setting.update({ where: { key }, data: { value: strValue } });
    } else {
      await db.setting.create({ data: { key, value: strValue } });
    }
  }
}
