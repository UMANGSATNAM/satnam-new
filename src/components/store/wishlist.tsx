"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist, useCart } from "@/lib/cart";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

interface WishlistProps {
  products: Product[];
}

export function WishlistPage({ products }: WishlistProps) {
  const { navigate } = useRouter();
  const { productIds, remove, toggle } = useWishlist();
  const { addItem, openCart } = useCart();

  const wishlistedProducts = products.filter((p) => productIds.includes(p.id));

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] || "/products/roasted-chana-plain.png",
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
      weight: product.weight || undefined,
      maxStock: product.stockQuantity,
    });
    toast.success(`Added ${product.name} to cart! 🛒`);
  };

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      if (p.inStock) {
        addItem({
          productId: p.id,
          slug: p.slug,
          name: p.name,
          image: p.images[0] || "/products/roasted-chana-plain.png",
          price: p.price,
          salePrice: p.salePrice,
          quantity: 1,
          weight: p.weight || undefined,
          maxStock: p.stockQuantity,
        });
      }
    });
    toast.success("Added all in-stock items to your cart! 🛍️");
    openCart();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-destructive text-destructive" />
            <h1 className="font-playfair text-2xl font-bold sm:text-3xl">My Wishlist</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"} saved in your wishlist
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddAllToCart}
              className="gap-2 rounded-full shadow-sm"
              size="sm"
            >
              <ShoppingBag size={16} /> Add All to Cart
            </Button>
          </div>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Heart size={36} />
          </div>
          <h2 className="font-playfair text-2xl font-bold">Your Wishlist is Empty</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Explore our collection of crispy, farm-fresh roasted chana, peanuts, and flavorful snacks and save your favorites!
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="mt-6 gap-2 rounded-full px-6"
          >
            Explore Snacks <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistedProducts.map((p) => {
            const currentPrice = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
            const discountPercent = p.salePrice && p.salePrice < p.price
              ? Math.round(((p.price - p.salePrice) / p.price) * 100)
              : 0;

            return (
              <div
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {/* Remove button */}
                <button
                  onClick={() => {
                    remove(p.id);
                    toast.info("Removed from wishlist");
                  }}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow transition-colors hover:bg-destructive hover:text-white"
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>

                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="font-bold">
                      {discountPercent}% OFF
                    </Badge>
                  )}
                  {!p.inStock && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Product image */}
                <div
                  onClick={() => navigate(`/product/${p.slug}`)}
                  className="relative aspect-square w-full cursor-pointer overflow-hidden bg-muted/20"
                >
                  <Image
                    src={p.images[0] || "/products/roasted-chana-plain.png"}
                    alt={p.name}
                    fill
                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {p.category?.name || "Snacks"}
                  </p>
                  <h3
                    onClick={() => navigate(`/product/${p.slug}`)}
                    className="mt-1 cursor-pointer font-semibold leading-tight text-foreground transition-colors hover:text-primary line-clamp-2"
                  >
                    {p.name}
                  </h3>

                  {p.weight && (
                    <p className="mt-1 text-xs text-muted-foreground">{p.weight}</p>
                  )}

                  <div className="mt-auto pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatINR(currentPrice)}
                      </span>
                      {p.salePrice && p.salePrice < p.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatINR(p.price)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(p)}
                        disabled={!p.inStock}
                        className="w-full gap-1.5 rounded-full text-xs font-semibold"
                        size="sm"
                      >
                        <ShoppingBag size={14} />
                        {p.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
