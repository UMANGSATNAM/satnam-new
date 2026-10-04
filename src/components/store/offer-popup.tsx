"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BannerView } from "@/components/store/banner-view";
import { useRouter } from "@/lib/router";
import type { Banner, HomeConfig } from "@/lib/storefront-types";

const KEY = "ssc_offer_popup_seen";

/** First-visit offer popup. Shown once per banner per 3 days, never on checkout. */
export function OfferPopup({ banners, config }: { banners: Banner[]; config: HomeConfig }) {
  const { route } = useRouter();
  const [open, setOpen] = useState(false);
  const banner = banners.filter((b) => b.placement === "popup").sort((a, b) => a.order - b.order)[0];
  const onCheckout = route.segments[0] === "checkout" || route.segments[0] === "order";

  useEffect(() => {
    if (!config.popupEnabled || !banner || onCheckout) return;
    let seen: Record<string, number> = {};
    try {
      seen = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      /* storage unavailable */
    }
    if (seen[banner.id] && Date.now() - seen[banner.id] < 3 * 24 * 3600 * 1000) return;
    const t = setTimeout(() => setOpen(true), Math.max(0, config.popupDelaySeconds) * 1000);
    return () => clearTimeout(t);
  }, [banner?.id, config.popupEnabled, config.popupDelaySeconds]);

  const close = () => {
    setOpen(false);
    if (!banner) return;
    try {
      const seen = JSON.parse(localStorage.getItem(KEY) || "{}");
      seen[banner.id] = Date.now();
      localStorage.setItem(KEY, JSON.stringify(seen));
    } catch {
      /* ignore */
    }
  };

  if (!banner) return null;
  return (
    <Dialog open={open && !onCheckout} onOpenChange={(o) => !o && close()}>
      <DialogContent showCloseButton={false} className="max-w-[calc(100%-2rem)] overflow-hidden border-0 bg-transparent p-0 shadow-2xl sm:max-w-2xl">
        <DialogTitle className="sr-only">{banner.title}</DialogTitle>
        <button
          onClick={close}
          aria-label="Close offer"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow hover:bg-white"
        >
          <X size={16} />
        </button>
        <div onClickCapture={(e) => {
          // close when the CTA navigates
          if ((e.target as HTMLElement).closest("button")?.textContent?.includes(banner.ctaLabel || "\u0000")) close();
        }}>
          <BannerView banner={banner} variant="popup" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
