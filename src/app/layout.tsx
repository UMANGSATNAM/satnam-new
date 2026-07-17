import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Satnam Singh Chana — Taste of Tradition | Roasted Chana & Peanuts",
  description: "Premium roasted chana, peanuts, and flavored snacks from Satnam Singh Chana. Farm-fresh, traditionally roasted, vacuum packed for freshness. Free shipping on orders over ₹499.",
  keywords: ["roasted chana", "roasted peanuts", "flavored chana", "snacks", "satnam singh chana", "namkeen", "chickpeas", "healthy snacks"],
  authors: [{ name: "Satnam Singh Chana" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Satnam Singh Chana — Taste of Tradition",
    description: "Premium roasted chana, peanuts & flavored snacks. Farm-fresh, traditionally roasted.",
    siteName: "Satnam Singh Chana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satnam Singh Chana — Taste of Tradition",
    description: "Premium roasted chana, peanuts & flavored snacks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
