"use client";

import { useEffect } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { WhatsAppWidget } from "@/components/shared/whatsapp-widget";
import { Home } from "@/components/store/home";
import { ProductsList } from "@/components/store/products-list";
import { ProductDetail } from "@/components/store/product-detail";
import { Checkout } from "@/components/store/checkout";
import { OrderSuccess } from "@/components/store/order-success";
import { WishlistPage } from "@/components/store/wishlist";
import { TrackOrderPage } from "@/components/store/track-order";
import { CustomerAccountPage } from "@/components/store/customer-account";
import {
  ShippingPolicyPage,
  RefundPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
  FAQPage,
} from "@/components/store/policy-pages";
import { AboutPage, ContactPage, RecipesPage } from "@/components/store/static-pages";
import { AdminApp } from "@/components/admin/admin-app";
import { useRouter } from "@/lib/router";
import type { Product, Category, Settings } from "@/lib/types";

interface AppShellProps {
  products: Product[];
  categories: Category[];
  settings: Settings;
}

export function AppShell({ products, categories, settings }: AppShellProps) {
  const { route } = useRouter();
  const path = route.path;
  const segments = route.segments;

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  // Admin route — full screen, no storefront header/footer
  if (segments[0] === "admin") {
    return <AdminApp settings={settings} />;
  }

  let content: React.ReactNode;
  let showHeaderFooter = true;

  if (segments.length === 0 || path === "/") {
    content = <Home products={products} categories={categories} />;
  } else if (segments[0] === "products") {
    content = (
      <ProductsList
        key={`products-${route.query.get("search") || ""}`}
        initialSearch={route.query.get("search") || undefined}
      />
    );
  } else if (segments[0] === "category" && segments[1]) {
    content = <ProductsList key={`cat-${segments[1]}`} initialCategory={segments[1]} />;
  } else if (segments[0] === "product" && segments[1]) {
    content = (
      <ProductDetail
        slug={segments[1]}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
    );
  } else if (segments[0] === "checkout") {
    content = (
      <Checkout
        freeShippingThreshold={settings.freeShippingThreshold}
        shippingFee={settings.shippingFee}
        razorpayKeyId={settings.razorpayKeyId}
        paymentEnabled={settings.paymentEnabled}
        codEnabled={settings.codEnabled}
        upiId={settings.upiId}
      />
    );
  } else if (segments[0] === "order" && segments[1]) {
    content = <OrderSuccess orderNumber={segments[1]} />;
  } else if (segments[0] === "wishlist") {
    content = <WishlistPage products={products} />;
  } else if (segments[0] === "track" || segments[0] === "track-order") {
    content = (
      <TrackOrderPage
        initialOrderNumber={route.query.get("order") || undefined}
        settings={settings}
      />
    );
  } else if (segments[0] === "account" || segments[0] === "my-orders") {
    content = <CustomerAccountPage products={products} settings={settings} />;
  } else if (segments[0] === "shipping-policy") {
    content = <ShippingPolicyPage settings={settings} />;
  } else if (segments[0] === "refund-policy") {
    content = <RefundPolicyPage settings={settings} />;
  } else if (segments[0] === "privacy-policy") {
    content = <PrivacyPolicyPage settings={settings} />;
  } else if (segments[0] === "terms") {
    content = <TermsPage settings={settings} />;
  } else if (segments[0] === "faq") {
    content = <FAQPage settings={settings} />;
  } else if (segments[0] === "about") {
    content = <AboutPage />;
  } else if (segments[0] === "contact") {
    content = <ContactPage settings={settings} />;
  } else if (segments[0] === "recipes") {
    content = <RecipesPage />;
  } else {
    content = (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-32 text-center">
        <p className="text-6xl">🤔</p>
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showHeaderFooter && <Header categories={categories} settings={settings} />}
      <main className="flex-1">{content}</main>
      {showHeaderFooter && <Footer categories={categories} settings={settings} />}
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      {showHeaderFooter && <WhatsAppWidget settings={settings} />}
    </div>
  );
}
