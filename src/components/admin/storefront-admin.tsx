"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Copy,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Save,
  Image as ImageIcon,
  Palette,
  CalendarClock,
  Megaphone,
  LayoutTemplate,
  X,
  ExternalLink,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BannerView } from "@/components/store/banner-view";
import { useCategories, useProducts, useAdminCoupons } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  SECTION_LABELS,
  isBannerLive,
  type Banner,
  type BannerPlacement,
  type HomeConfig,
  type StorefrontData,
} from "@/lib/storefront-types";
import type { Category } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* shared helpers                                                      */
/* ------------------------------------------------------------------ */

function useStorefront() {
  const [data, setData] = useState<StorefrontData | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/admin/storefront")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => toast.error("Could not load storefront data"));
  }, []);
  const save = async (patch: Partial<StorefrontData>, msg = "Saved — live on the store now ✅") => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/storefront", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!r.ok) throw new Error();
      setData(await r.json());
      toast.success(msg);
      return true;
    } catch {
      toast.error("Save failed. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };
  return { data, setData, save, saving };
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Upload failed");
  return d.url as string;
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  suggestions = [],
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  hint?: string;
  suggestions?: string[];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadImage(f));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="gap-1 text-destructive">
                <X size={14} /> Remove
              </Button>
            )}
          </div>
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/... or https://..." className="h-8 text-xs" />
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="w-full text-[11px] text-muted-foreground">Or pick a product photo:</span>
          {suggestions.slice(0, 10).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onChange(s)}
              className={cn("h-10 w-10 overflow-hidden rounded-md border-2", value === s ? "border-primary" : "border-transparent")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  const swatches = ["#f3d98b", "#d9b44a", "#cfe3b4", "#c5d9a0", "#f6c9a8", "#ec8f8f", "#b9655c", "#0f5132", "#1f3b4d", "#fff6df"];
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-9 w-11 cursor-pointer rounded border bg-transparent p-0.5" />
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-9 w-28 font-mono text-xs" />
      </div>
      <div className="flex flex-wrap gap-1">
        {swatches.map((c) => (
          <button type="button" key={c} onClick={() => onChange(c)} className="h-5 w-5 rounded-full border" style={{ backgroundColor: c }} aria-label={c} />
        ))}
      </div>
    </div>
  );
}

/** datetime-local <-> ISO helpers (local time of the admin's browser) */
const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function bannerStatus(b: Banner): { label: string; cls: string } {
  if (!b.isActive) return { label: "Off", cls: "bg-muted text-muted-foreground" };
  const now = new Date();
  if (b.startsAt && new Date(b.startsAt) > now) return { label: "Scheduled", cls: "bg-blue-100 text-blue-700" };
  if (b.endsAt && new Date(b.endsAt) < now) return { label: "Expired", cls: "bg-orange-100 text-orange-700" };
  return isBannerLive(b) ? { label: "Live", cls: "bg-emerald-100 text-emerald-700" } : { label: "Off", cls: "bg-muted" };
}

const PLACEMENTS: { id: BannerPlacement; label: string; desc: string; size: string }[] = [
  { id: "hero", label: "Hero Slider", desc: "Big rotating banners at the top of the homepage", size: "Upload size: 1600×600 (desktop), 800×1000 (mobile)" },
  { id: "promo", label: "Promo Banners", desc: "Two side-by-side offer banners below categories", size: "Upload size: 1200×675" },
  { id: "wide", label: "Wide Offer Strip", desc: "Full-width offer banner in the middle of the page", size: "Upload size: 1600×500" },
  { id: "popup", label: "Offer Popup", desc: "Popup shown to new visitors after a few seconds", size: "Upload size: 1000×1000" },
];

const PREVIEW_SCALE: Record<BannerPlacement, number> = { hero: 0.42, promo: 0.62, wide: 0.5, popup: 0.62 };
const PREVIEW_WIDTH: Record<BannerPlacement, number> = { hero: 1280, promo: 640, wide: 1100, popup: 640 };

function ScaledPreview({ banner, width }: { banner: Banner; width?: number }) {
  // Render the banner at real desktop width and scale it down so admins see the true layout.
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(PREVIEW_SCALE[banner.placement]);
  const [h, setH] = useState(0);
  const inner = useRef<HTMLDivElement>(null);
  const baseW = PREVIEW_WIDTH[banner.placement];
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = width || el.clientWidth;
      setScale(Math.min(1, w / baseW));
      setH(inner.current?.offsetHeight || 0);
    });
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [baseW, width]);
  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden rounded-lg border bg-white" style={{ height: h ? h * scale : 160 }}>
      <div ref={inner} style={{ width: baseW, transform: `scale(${scale})`, transformOrigin: "top left" }} className="pointer-events-none absolute left-0 top-0">
        <BannerView banner={banner} variant={banner.placement} preview />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Banners & Offers                                                    */
/* ------------------------------------------------------------------ */

export function BannersView() {
  const { data, save, saving } = useStorefront();
  const [placement, setPlacement] = useState<BannerPlacement>("hero");
  const [editing, setEditing] = useState<Banner | null>(null);

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const all = data.banners;
  const list = all.filter((b) => b.placement === placement).sort((a, b) => a.order - b.order);
  const meta = PLACEMENTS.find((p) => p.id === placement)!;

  const persist = (banners: Banner[], msg?: string) => save({ banners }, msg);

  const move = (b: Banner, dir: -1 | 1) => {
    const idx = list.findIndex((x) => x.id === b.id);
    const swap = list[idx + dir];
    if (!swap) return;
    const reordered = all.map((x) =>
      x.id === b.id ? { ...x, order: swap.order } : x.id === swap.id ? { ...x, order: b.order } : x
    );
    // normalise orders if equal
    if (b.order === swap.order) {
      const ids = list.map((x) => x.id);
      [ids[idx], ids[idx + dir]] = [ids[idx + dir], ids[idx]];
      persist(all.map((x) => (ids.includes(x.id) ? { ...x, order: ids.indexOf(x.id) + 1 } : x)), "Order updated");
      return;
    }
    persist(reordered, "Order updated");
  };

  const toggle = (b: Banner) => persist(all.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x)), b.isActive ? "Banner hidden" : "Banner is live ✅");
  const remove = (b: Banner) => {
    if (!confirm(`Delete banner "${b.title || "untitled"}"?`)) return;
    persist(all.filter((x) => x.id !== b.id), "Banner deleted");
  };
  const duplicate = (b: Banner) =>
    persist([...all, { ...b, id: `b-${Date.now().toString(36)}`, title: `${b.title} (copy)`, isActive: false, order: list.length + 1 }], "Duplicated (hidden until you turn it on)");

  const newBanner = (): Banner => ({
    id: `b-${Date.now().toString(36)}`,
    placement,
    mode: "designed",
    eyebrow: placement === "popup" ? "Welcome Gift" : "Limited Offer",
    title: "Your offer headline",
    subtitle: "One line that tells customers why to click.",
    ctaLabel: "Shop Now",
    ctaLink: "/products",
    image: "/products/roasted-peanuts-salted.png",
    bgColor: "#f3d98b",
    accentColor: "#0f6b43",
    textTheme: "dark",
    isActive: true,
    order: list.length + 1,
  });

  const onSaveBanner = async (b: Banner) => {
    const exists = all.some((x) => x.id === b.id);
    const ok = await persist(exists ? all.map((x) => (x.id === b.id ? b : x)) : [...all, b]);
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Banners & Offers</h1>
          <p className="text-sm text-muted-foreground">Everything here updates the live homepage instantly — no code, no redeploy.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.open("/#/", "_blank")}>
            <ExternalLink size={15} /> View store
          </Button>
          <Button className="gap-2" onClick={() => setEditing(newBanner())}>
            <Plus size={16} /> Add {meta.label.replace(/s$/, "")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {PLACEMENTS.map((p) => {
          const n = all.filter((b) => b.placement === p.id);
          const live = n.filter((b) => isBannerLive(b)).length;
          return (
            <button
              key={p.id}
              onClick={() => setPlacement(p.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                placement === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card hover:border-primary/40"
              )}
            >
              <p className="text-sm font-bold">{p.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {live} live · {n.length} total
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
        <b className="text-foreground">{meta.label}:</b> {meta.desc}. {meta.size}.
      </div>

      {list.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">No {meta.label.toLowerCase()} yet</p>
            <Button onClick={() => setEditing(newBanner())} className="gap-2">
              <Plus size={16} /> Create one
            </Button>
          </CardContent>
        </Card>
      )}

      <div className={cn("grid gap-4", placement === "promo" || placement === "popup" ? "lg:grid-cols-2" : placement === "hero" ? "xl:grid-cols-2" : "")}>
        {list.map((b, i) => {
          const st = bannerStatus(b);
          return (
            <Card key={b.id} className={cn(!isBannerLive(b) && "opacity-80")}>
              <CardContent className="space-y-3 p-3 sm:p-4">
                <ScaledPreview banner={b} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", st.cls)}>{st.label}</span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{b.title || "(image banner)"}</p>
                  {b.couponCode && <Badge variant="secondary">{b.couponCode}</Badge>}
                  {(b.startsAt || b.endsAt) && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarClock size={12} />
                      {b.startsAt ? new Date(b.startsAt).toLocaleDateString("en-IN") : "now"} → {b.endsAt ? new Date(b.endsAt).toLocaleDateString("en-IN") : "always"}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(b)}>
                    <Edit size={14} /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toggle(b)} disabled={saving}>
                    {b.isActive ? <EyeOff size={14} /> : <Eye size={14} />} {b.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(b, -1)} disabled={i === 0 || saving} aria-label="Move up">
                    <ArrowUp size={15} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(b, 1)} disabled={i === list.length - 1 || saving} aria-label="Move down">
                    <ArrowDown size={15} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicate(b)} aria-label="Duplicate">
                    <Copy size={15} />
                  </Button>
                  <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 text-destructive" onClick={() => remove(b)} aria-label="Delete">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editing && <BannerEditor initial={editing} onClose={() => setEditing(null)} onSave={onSaveBanner} saving={saving} />}
    </div>
  );
}

function BannerEditor({
  initial,
  onClose,
  onSave,
  saving,
}: {
  initial: Banner;
  onClose: () => void;
  onSave: (b: Banner) => void;
  saving: boolean;
}) {
  const [b, setB] = useState<Banner>(initial);
  const set = <K extends keyof Banner>(k: K, v: Banner[K]) => setB((prev) => ({ ...prev, [k]: v }));
  const { data: categories } = useCategories();
  const { data: productData } = useProducts({ limit: "100" });
  const { data: coupons } = useAdminCoupons();
  const products = productData?.products || [];
  const productImages = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.images || []))).slice(0, 12),
    [products]
  );

  const linkOptions = [
    { value: "/products", label: "All products" },
    ...(categories || []).map((c) => ({ value: `/category/${c.slug}`, label: `Category · ${c.name}` })),
    ...products.slice(0, 60).map((p) => ({ value: `/product/${p.slug}`, label: `Product · ${p.name}` })),
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{PLACEMENTS.find((p) => p.id === b.placement)?.label} — edit banner</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              {(["designed", "image"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("mode", m)}
                  className={cn("flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold", b.mode === m ? "bg-card shadow" : "text-muted-foreground")}
                >
                  {m === "designed" ? <Palette size={14} /> : <ImageIcon size={14} />}
                  {m === "designed" ? "Design it here" : "Upload ready-made banner"}
                </button>
              ))}
            </div>

            {b.mode === "image" ? (
              <>
                <ImageField
                  label="Banner image (desktop)"
                  value={b.desktopImage}
                  onChange={(v) => set("desktopImage", v)}
                  hint={PLACEMENTS.find((p) => p.id === b.placement)?.size}
                />
                {b.placement === "hero" && (
                  <ImageField label="Mobile image (optional)" value={b.mobileImage} onChange={(v) => set("mobileImage", v)} hint="Portrait 800×1000 looks best on phones" />
                )}
                <div className="space-y-1.5">
                  <Label>Name (for your reference & SEO alt text)</Label>
                  <Input value={b.title} onChange={(e) => set("title", e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Small top line</Label>
                    <Input value={b.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} placeholder="LIMITED OFFER" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Highlight words (coloured)</Label>
                    <Input value={b.highlight || ""} onChange={(e) => set("highlight", e.target.value)} placeholder="e.g. 20% OFF" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Headline *</Label>
                  <Input value={b.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sub-text</Label>
                  <Textarea rows={2} value={b.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} />
                </div>
                <ImageField label="Product image" value={b.image} onChange={(v) => set("image", v)} suggestions={productImages} hint="Square photo works best (1000×1000). PNG pack-shots look great." />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <ColorField label="Background" value={b.bgColor} onChange={(v) => set("bgColor", v)} />
                  <ColorField label="Button / accent" value={b.accentColor} onChange={(v) => set("accentColor", v)} />
                  <div className="space-y-1.5">
                    <Label>Text colour</Label>
                    <Select value={b.textTheme || "dark"} onValueChange={(v) => set("textTheme", v as "dark" | "light")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark text</SelectItem>
                        <SelectItem value="light">White text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {b.mode === "designed" && (
                <div className="space-y-1.5">
                  <Label>Button text</Label>
                  <Input value={b.ctaLabel || ""} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="Shop Now" />
                </div>
              )}
              <div className={cn("space-y-1.5", b.mode === "image" && "sm:col-span-2")}>
                <Label>When clicked, open</Label>
                <Select value={linkOptions.some((o) => o.value === b.ctaLink) ? b.ctaLink : "__custom"} onValueChange={(v) => v !== "__custom" && set("ctaLink", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose page" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {linkOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                    <SelectItem value="__custom">Custom link…</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={b.ctaLink || ""} onChange={(e) => set("ctaLink", e.target.value)} className="h-8 text-xs" placeholder="/products or https://…" />
              </div>
            </div>

            {b.mode === "designed" && (
              <div className="space-y-1.5">
                <Label>Coupon code to show (optional)</Label>
                <div className="flex gap-2">
                  <Input value={b.couponCode || ""} onChange={(e) => set("couponCode", e.target.value.toUpperCase())} placeholder="WELCOME10" className="font-mono" />
                  {(coupons || []).length > 0 && (
                    <Select onValueChange={(v) => set("couponCode", v === "__none" ? "" : v)}>
                      <SelectTrigger className="w-40"><SelectValue placeholder="Pick coupon" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">No coupon</SelectItem>
                        {(coupons || []).map((c) => (
                          <SelectItem key={c.id} value={c.code}>{c.code}{!c.isActive ? " (inactive)" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Customers tap it to copy. Create/edit codes in the Coupons tab.</p>
              </div>
            )}

            <div className="rounded-lg border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <CalendarClock size={15} /> Schedule (optional)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start showing</Label>
                  <Input type="datetime-local" value={toLocalInput(b.startsAt)} onChange={(e) => set("startsAt", fromLocalInput(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Stop showing</Label>
                  <Input type="datetime-local" value={toLocalInput(b.endsAt)} onChange={(e) => set("endsAt", fromLocalInput(e.target.value))} />
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">Perfect for Diwali / Holi / weekend sales — set it once and it goes live and off automatically.</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-semibold">Active</p>
                <p className="text-[11px] text-muted-foreground">Turn off to hide without deleting</p>
              </div>
              <Switch checked={b.isActive} onCheckedChange={(v) => set("isActive", v)} />
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2 lg:sticky lg:top-0 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview — desktop</p>
            <ScaledPreview banner={b} />
            {b.placement === "hero" && b.mode === "image" && (
              <>
                <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile</p>
                <div className="relative mx-auto h-[420px] w-[260px] overflow-hidden rounded-[1.6rem] border-[6px] border-foreground/80 bg-white">
                  <div style={{ width: 372, transform: "scale(0.667)", transformOrigin: "top left" }} className="pointer-events-none absolute left-0 top-0">
                    <BannerView banner={{ ...b, desktopImage: b.mobileImage || b.desktopImage }} variant="hero" preview />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t bg-background px-6 py-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="gap-2"
            disabled={saving}
            onClick={() => {
              if (b.mode === "designed" && !b.title.trim()) return toast.error("Headline is required");
              if (b.mode === "image" && !b.desktopImage) return toast.error("Please upload the banner image");
              onSave(b);
            }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save banner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Homepage layout & content                                           */
/* ------------------------------------------------------------------ */

export function HomepageView() {
  const { data, save, saving } = useStorefront();
  const [draft, setCfg] = useState<HomeConfig | null>(null);
  const cfg = draft ?? data?.config ?? null;
  const { data: categories } = useCategories();
  const { data: productData, refetch } = useProducts({ limit: "200" });
  const [dealBusy, setDealBusy] = useState<string | null>(null);

  if (!cfg) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  const set = <K extends keyof HomeConfig>(k: K, v: HomeConfig[K]) => setCfg({ ...cfg, [k]: v });
  const moveSection = (i: number, d: -1 | 1) => {
    const s = [...cfg.sections];
    if (!s[i + d]) return;
    [s[i], s[i + d]] = [s[i + d], s[i]];
    set("sections", s);
  };

  const toggleDeal = async (slug: string, value: boolean) => {
    setDealBusy(slug);
    const r = await fetch(`/api/products/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDealOfDay: value }),
    });
    setDealBusy(null);
    if (r.ok) {
      toast.success(value ? "Added to Deals of the Day" : "Removed from deals");
      refetch();
    } else toast.error("Could not update product");
  };

  const products = productData?.products || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Homepage</h1>
          <p className="text-sm text-muted-foreground">Logo, offer bar, section order, deals timer and popup settings.</p>
        </div>
        <Button className="gap-2" disabled={saving} onClick={() => save({ config: cfg })}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save homepage
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Brand & offer bar</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <ImageField label="Store logo" value={cfg.logoUrl} onChange={(v) => set("logoUrl", v)} hint="PNG/SVG with transparent background, around 400×140. Leave empty to show the text logo." />
            <div className="space-y-2">
              <Label>Top offer bar messages (rotate every 4 sec)</Label>
              {cfg.announcements.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={a} onChange={(e) => set("announcements", cfg.announcements.map((x, j) => (j === i ? e.target.value : x)))} />
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => set("announcements", cfg.announcements.filter((_, j) => j !== i))}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => set("announcements", [...cfg.announcements, ""])}>
                <Plus size={14} /> Add message
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><LayoutTemplate size={17} /> Sections — show / hide / reorder</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {cfg.sections.map((s, i) => (
              <div key={s.id} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2", !s.enabled && "bg-muted/50")}>
                <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                <span className={cn("flex-1 text-sm", !s.enabled && "text-muted-foreground line-through")}>{SECTION_LABELS[s.id]}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === 0} onClick={() => moveSection(i, -1)}><ArrowUp size={14} /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={i === cfg.sections.length - 1} onClick={() => moveSection(i, 1)}><ArrowDown size={14} /></Button>
                <Switch checked={s.enabled} onCheckedChange={(v) => set("sections", cfg.sections.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Section titles & slider</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Categories title</Label><Input value={cfg.categoriesTitle} onChange={(e) => set("categoriesTitle", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Deals title</Label><Input value={cfg.dealsTitle} onChange={(e) => set("dealsTitle", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Popular title</Label><Input value={cfg.popularTitle} onChange={(e) => set("popularTitle", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Bestsellers title</Label><Input value={cfg.bestsellersTitle} onChange={(e) => set("bestsellersTitle", e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Hero slide every (seconds)</Label>
              <Input type="number" min={0} max={30} value={cfg.heroAutoplaySeconds} onChange={(e) => set("heroAutoplaySeconds", Number(e.target.value))} />
              <p className="text-[11px] text-muted-foreground">0 = no auto-slide</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Offer popup</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show offer popup to new visitors</p>
                <p className="text-[11px] text-muted-foreground">Design the popup in Banners & Offers → Offer Popup. Shown once every 3 days per visitor.</p>
              </div>
              <Switch checked={cfg.popupEnabled} onCheckedChange={(v) => set("popupEnabled", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Show after (seconds)</Label>
              <Input type="number" min={0} max={60} value={cfg.popupDelaySeconds} onChange={(e) => set("popupDelaySeconds", Number(e.target.value))} className="w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap size={17} /> Deals of the Day</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Countdown timer</Label>
                <Select value={cfg.dealsTimer} onValueChange={(v) => set("dealsTimer", v as HomeConfig["dealsTimer"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midnight">Resets every midnight (IST)</SelectItem>
                    <SelectItem value="fixed">Ends at a fixed date/time</SelectItem>
                    <SelectItem value="off">No timer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cfg.dealsTimer === "fixed" && (
                <div className="space-y-1.5">
                  <Label>Sale ends at</Label>
                  <Input type="datetime-local" value={toLocalInput(cfg.dealsEndsAt)} onChange={(e) => set("dealsEndsAt", fromLocalInput(e.target.value))} />
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Products in Deals of the Day <span className="text-muted-foreground">(changes save instantly)</span></p>
              <div className="grid max-h-80 gap-1.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <label key={p.id} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm", p.isDealOfDay && "border-primary bg-primary/5")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]} alt="" className="h-9 w-9 rounded object-cover" />
                    <span className="line-clamp-2 flex-1 text-xs">{p.name}</span>
                    {dealBusy === p.slug ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Switch checked={p.isDealOfDay} onCheckedChange={(v) => toggleDeal(p.slug, v)} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Popular Products — tabs</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-2 text-xs text-muted-foreground">Choose which categories appear as tabs. None selected = all categories.</p>
            <div className="flex flex-wrap gap-2">
              {(categories || []).map((c: Category) => {
                const on = cfg.popularTabs.includes(c.slug);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set("popularTabs", on ? cfg.popularTabs.filter((s) => s !== c.slug) : [...cfg.popularTabs, c.slug])}
                    className={cn("rounded-full border px-3 py-1.5 text-sm", on ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}
                  >
                    {c.icon} {c.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2" disabled={saving} onClick={() => save({ config: cfg })}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save homepage
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Categories (full CRUD with images)                                  */
/* ------------------------------------------------------------------ */

type CatForm = { id?: string; name: string; slug?: string; description: string; color: string; icon: string; image: string; order: number };

export function CategoriesManager() {
  const { data: categories, refetch } = useCategories();
  const { data: productData } = useProducts({ limit: "100" });
  const [form, setForm] = useState<CatForm | null>(null);
  const [busy, setBusy] = useState(false);
  const productImages = useMemo(
    () => Array.from(new Set((productData?.products || []).flatMap((p) => p.images || []))).slice(0, 12),
    [productData]
  );

  const submit = async () => {
    if (!form?.name.trim()) return toast.error("Name required");
    setBusy(true);
    const r = await fetch(form.id ? `/api/categories/${form.id}` : "/api/categories", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) return toast.error((await r.json().catch(() => ({}))).error || "Could not save");
    toast.success(form.id ? "Category updated" : "Category created");
    setForm(null);
    refetch();
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    const r = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return toast.error(d.error || "Could not delete");
    toast.success("Category deleted");
    refetch();
  };

  const reorder = async (i: number, d: -1 | 1) => {
    const list = categories || [];
    const a = list[i];
    const b = list[i + d];
    if (!a || !b) return;
    await Promise.all([
      fetch(`/api/categories/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i + d }) }),
      fetch(`/api/categories/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: i }) }),
    ]);
    // normalise the rest
    await Promise.all(
      list.map((c, j) => (j !== i && j !== i + d && c.order !== j ? fetch(`/api/categories/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: j }) }) : null))
    );
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">These appear as the &ldquo;Shop by Category&rdquo; tiles and the Browse menu, in this order.</p>
        </div>
        <Button onClick={() => setForm({ name: "", description: "", color: "#efd27a", icon: "🥜", image: "", order: (categories?.length || 0) + 1 })} className="gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(categories || []).map((c, i) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="relative flex h-28 items-center justify-center" style={{ backgroundColor: c.color || "#efd27a" }}>
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="h-20 w-20 rounded-lg object-cover shadow-lg ring-4 ring-white/80" />
              ) : (
                <span className="text-4xl">{c.icon}</span>
              )}
            </div>
            <CardContent className="flex items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c.icon} {c.name}</p>
                <p className="text-xs text-muted-foreground">{c.productCount || 0} products · /{c.slug}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0} onClick={() => reorder(i, -1)}><ArrowUp size={14} /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === (categories?.length || 0) - 1} onClick={() => reorder(i, 1)}><ArrowDown size={14} /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description || "", color: c.color || "#efd27a", icon: c.icon || "", image: c.image || "", order: c.order })}><Edit size={14} /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(c)}><Trash2 size={14} /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {form && (
        <Dialog open onOpenChange={(o) => !o && setForm(null)}>
          <DialogContent className="max-h-[92vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{form.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_90px] gap-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Emoji</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
              </div>
              {form.id && (
                <div className="space-y-1.5"><Label>URL slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              )}
              <ImageField label="Tile image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} suggestions={productImages} hint="Square pack-shot, 800×800" />
              <ColorField label="Tile background" value={form.color} onChange={(v) => setForm({ ...form, color: v })} />
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" onClick={() => setForm(null)} className="flex-1">Cancel</Button>
                <Button onClick={submit} disabled={busy} className="flex-1">{busy && <Loader2 size={14} className="mr-1 animate-spin" />}{form.id ? "Save changes" : "Create category"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
