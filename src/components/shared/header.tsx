"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  Truck,
  User,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart, useWishlist } from "@/lib/cart";
import { navigate, useRouter } from "@/lib/router";
import type { Category, Settings, Product } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

interface HeaderProps {
  categories: Category[];
  settings: Settings;
}

export function Header({ categories, settings }: HeaderProps) {
  const { route, navigate: go } = useRouter();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart = useCart((s) => s.openCart);
  const wishlistCount = useWishlist((s) => s.productIds.length);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live search suggestions
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(q)}&limit=4`)
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d) => setSuggestions(d.products || []))
        .catch(() => setSuggestions([]));
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  // Click outside search
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      go(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSuggestions([]);
      setSearchFocused(false);
      setMobileOpen(false);
    }
  };

  const selectSuggestion = (product: Product) => {
    go(`/product/${product.slug}`);
    setSearch("");
    setSuggestions([]);
    setSearchFocused(false);
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Track Order", path: "/track" },
    { label: "My Orders", path: "/account" },
    { label: "Recipes", path: "/recipes" },
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return route.path === "/" || route.path === "";
    return route.path.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar */}
      <div className="bg-brand-gradient text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-1.5 text-[11px] sm:px-6 sm:text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <Truck size={13} className="shrink-0" />
            <span className="line-clamp-1">{settings.announcementBar || "Free Shipping on Orders Over ₹499"}</span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <button
              onClick={() => go("/track")}
              className="flex items-center gap-1 hover:underline text-primary-foreground/90"
            >
              <Truck size={12} /> Track Order
            </button>
            <button
              onClick={() => go("/account")}
              className="flex items-center gap-1 hover:underline text-primary-foreground/90"
            >
              <User size={12} /> My Account
            </button>
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:underline">
              <Phone size={12} /> {settings.phone}
            </a>
          </div>
          <button
            onClick={() => go("/admin")}
            className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 font-medium transition-colors hover:bg-white/25"
          >
            <LayoutDashboard size={11} /> Admin Panel
          </button>
        </div>
      </div>

      {/* Main header */}
      <div
        className={cn(
          "border-b border-border/60 bg-card/95 backdrop-blur transition-shadow",
          scrolled && "shadow-md"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Logo */}
          <button
            onClick={() => go("/")}
            className="flex shrink-0 items-center gap-2"
            aria-label="Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-lg shadow-sm">
              🫘
            </div>
            <div className="hidden flex-col leading-none sm:flex text-left">
              <span className="font-playfair text-base font-bold text-foreground">
                {settings.brandName.split(" ")[0]} {settings.brandName.split(" ").slice(1).join(" ")}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
                {settings.tagline}
              </span>
            </div>
          </button>

          {/* Search with Live Suggestions (desktop) */}
          <div ref={searchRef} className="relative hidden flex-1 items-center md:flex max-w-md lg:max-w-lg mx-2">
            <form onSubmit={onSearch} className="w-full">
              <div className="relative flex w-full items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search roasted chana, spicy peanuts, combos..."
                  className="h-10 rounded-full border-border bg-muted/40 pl-9 pr-24 text-xs transition-all focus:bg-background"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 h-8 rounded-full px-4 text-xs font-semibold"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Suggestions Popover */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-border/60 bg-muted/30 flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-3">
                  <span>Quick Suggestions</span>
                  <span>{suggestions.length} products</span>
                </div>
                <div className="divide-y divide-border/60">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectSuggestion(item)}
                      className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted/40">
                        <Image
                          src={item.images[0] || "/products/roasted-chana-plain.png"}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 text-xs font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.weight || item.category?.name || "Snack"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">
                          {formatINR(item.salePrice && item.salePrice < item.price ? item.salePrice : item.price)}
                        </p>
                        {item.salePrice && item.salePrice < item.price && (
                          <p className="text-[10px] text-muted-foreground line-through">{formatINR(item.price)}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={onSearch}
                  className="flex w-full items-center justify-center gap-1.5 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  View all results for &ldquo;{search}&rdquo; <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex hover:text-destructive hover:bg-destructive/10"
              onClick={() => go("/wishlist")}
              aria-label="Wishlist"
            >
              <Heart size={20} className={wishlistCount > 0 ? "fill-destructive text-destructive" : ""} />
              {wishlistCount > 0 && (
                <span suppressHydrationWarning className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="relative gap-2 rounded-full px-3 shadow-sm sm:px-4"
              onClick={openCart}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span suppressHydrationWarning className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white">
                      🫘
                    </div>
                    {settings.brandName}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-120px)]">
                  {/* Mobile search */}
                  <form onSubmit={onSearch} className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 rounded-full pl-9 text-xs"
                      />
                    </div>
                  </form>

                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        go(link.path);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted",
                        isActive(link.path) && "bg-primary/10 text-primary font-bold"
                      )}
                    >
                      {link.label}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      go("/wishlist");
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <Heart size={16} className="text-destructive" /> Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <div className="mt-3 border-t pt-3">
                    <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Categories
                    </p>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          go(`/category/${cat.slug}`);
                          setMobileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <span>{cat.icon}</span> {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <button
                      onClick={() => {
                        go("/admin");
                        setMobileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-left text-sm font-semibold text-primary"
                    >
                      <LayoutDashboard size={16} /> Admin Panel
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Nav bar (desktop) */}
        <nav className="hidden border-t border-border/60 bg-card md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="m-1 gap-1.5 rounded-full text-xs font-semibold"
                >
                  <Menu size={14} /> Browse Categories
                  <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => go(`/category/${cat.slug}`)}
                    className="gap-2 py-2"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] text-muted-foreground">
                          {cat.productCount} products
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className={cn(
                    "relative px-3.5 py-2.5 text-xs font-medium transition-colors hover:text-primary",
                    isActive(link.path) ? "text-primary font-bold" : "text-foreground/80"
                  )}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-4 py-2 text-xs text-muted-foreground">
              <button
                onClick={() => go("/wishlist")}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Heart size={13} className={wishlistCount > 0 ? "text-destructive fill-destructive" : ""} />
                <span>Wishlist ({wishlistCount})</span>
              </button>
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> Support:{" "}
                <a href={`tel:${settings.phone}`} className="font-semibold text-foreground hover:text-primary">
                  {settings.phone}
                </a>
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
