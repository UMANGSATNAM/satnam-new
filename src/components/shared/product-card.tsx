"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Eye,
  Check,
  Loader2,
  Zap,
  Flame,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, formatINR, discountPercent, effectivePrice } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "@/lib/cart";
import { navigate } from "@/lib/router";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
  compact?: boolean;
}

export function ProductCard({ product, className, compact = false }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const addItem = useCart((s) => s.addItem);
  const wishlist = useWishlist();
  const isWished = wishlist.has(product.id);

  const discount = discountPercent(product.price, product.salePrice);
  const price = effectivePrice(product.price, product.salePrice);
  const images = product.images?.length ? product.images : ["/products/roasted-chana-plain.png"];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) {
      toast.error("Sorry, this product is out of stock");
      return;
    }
    setAdding(true);
    const variant = product.variants?.[0];
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      weight: product.weight || variant?.label,
      variant: variant?.value,
      maxStock: product.stockQuantity,
    });
    await new Promise((r) => setTimeout(r, 400));
    setAdding(false);
    setAdded(true);
    toast.success(`${product.name} added to cart!`, {
      description: `View cart to checkout • ${formatINR(price)}`,
    });
    setTimeout(() => setAdded(false), 1800);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    wishlist.toggle(product.id);
    toast.success(isWished ? "Removed from wishlist" : "Added to wishlist");
  };

  const quickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.slug}`);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Image
          src={images[imgIndex] || images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onMouseEnter={() => images.length > 1 && setImgIndex(1)}
          onMouseLeave={() => setImgIndex(0)}
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              -{discount}% OFF
            </span>
          )}
          {product.isBestseller && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <Flame size={9} /> Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
              <Sparkles size={9} /> New
            </span>
          )}
          {product.isDealOfDay && (
            <span className="flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <Zap size={9} /> Deal
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:scale-110 hover:bg-white",
            isWished ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <Heart size={15} className={isWished ? "fill-destructive" : ""} />
        </button>

        {/* Hover quick-view */}
        <button
          onClick={quickView}
          className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-center gap-1.5 rounded-lg bg-white/95 py-2 text-xs font-semibold text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye size={13} /> Quick View
        </button>

        {/* Sold out overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-foreground px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-background">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
            {product.category.name}
          </span>
        )}
        <h3
          className={cn(
            "line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary",
            compact ? "text-sm" : "text-sm sm:text-[0.92rem]"
          )}
        >
          {product.name}
        </h3>

        {!compact && product.shortDescription && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {/* Weight */}
        {product.weight && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {product.weight}
          </span>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between">
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            size={12}
            showValue
          />
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
            <PackageCheck size={11} />
            {product.soldCount > 1000
              ? `${(product.soldCount / 1000).toFixed(1)}k sold`
              : `${product.soldCount} sold`}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-foreground sm:text-lg">
                {formatINR(price)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-semibold text-destructive">
                Save {formatINR(product.price - price)}
              </span>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || adding}
            size="sm"
            className="h-9 w-9 shrink-0 rounded-full p-0 shadow-sm transition-transform hover:scale-105 active:scale-95"
            aria-label="Add to cart"
          >
            {adding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : added ? (
              <Check size={15} />
            ) : (
              <ShoppingCart size={15} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
