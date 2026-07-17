"use client";

import { useEffect, useState } from "react";
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
import type { Category, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      go(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "About Us", path: "/about" },
    { label: "Recipes", path: "/recipes" },
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
            <span className="line-clamp-1">Free Shipping on Orders Over ₹499</span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1 hover:underline">
              <Phone size={12} /> {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-1 hover:underline">
              <Mail size={12} /> {settings.email}
            </a>
          </div>
          <button
            onClick={() => go("/admin")}
            className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 font-medium hover:bg-white/25"
          >
            <LayoutDashboard size={11} /> Admin
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
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-playfair text-base font-bold text-foreground">
                {settings.brandName.split(" ")[0]} {settings.brandName.split(" ")[1] || ""}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
                {settings.tagline}
              </span>
            </div>
          </button>

          {/* Search (desktop) */}
          <form onSubmit={onSearch} className="hidden flex-1 items-center md:flex">
            <div className="relative flex w-full items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for chana, peanuts, flavors..."
                className="h-10 rounded-full border-border bg-muted/40 pl-9 pr-24"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 h-8 rounded-full px-4"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden sm:flex"
              onClick={() => go("/products")}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
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
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient">
                      🫘
                    </div>
                    {settings.brandName}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-1">
                  {/* Mobile search */}
                  <form onSubmit={onSearch} className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 rounded-full pl-9"
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
                        isActive(link.path) && "bg-primary/10 text-primary"
                      )}
                    >
                      {link.label}
                    </button>
                  ))}

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
                  className="m-1 gap-1.5 rounded-full"
                >
                  <Menu size={15} /> Browse Categories
                  <ChevronDown size={14} />
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
                      <span className="font-medium">{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-xs text-muted-foreground">
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
                    "relative px-4 py-3 text-sm font-medium transition-colors hover:text-primary",
                    isActive(link.path) ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> Need help?{" "}
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
