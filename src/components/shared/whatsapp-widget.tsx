"use client";

import { MessageCircle } from "lucide-react";
import type { Settings } from "@/lib/types";

export function WhatsAppWidget({ settings }: { settings: Settings }) {
  const rawPhone = settings.phone?.replace(/[^0-9]/g, "") || "919876543210";
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const message = encodeURIComponent(
    `Hello ${settings.brandName}! I'm visiting your online store and have a query regarding snacks & orders.`
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      <div className="mr-3 hidden rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg transition-all group-hover:block animate-in fade-in slide-in-from-right-2">
        Chat with us on WhatsApp 👋
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
      >
        <span className="absolute -inset-1 animate-ping rounded-full bg-[#25D366]/40 duration-1000 -z-10" />
        <MessageCircle className="h-7 w-7 fill-white text-[#25D366]" />
      </a>
    </div>
  );
}
