"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, X, ArrowRight, Tag, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface CartDrawerProps {
  freeShippingThreshold: number;
}

export function CartDrawer({ freeShippingThreshold }: CartDrawerProps) {
  const { isOpen, closeCart, items, updateQuantity, removeItem, subtotal, couponCode, couponDiscount, setCoupon } = useCart();
  const { navigate } = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [validating, setValidating] = useState(false);

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    try {
      const res = await fetch(`/api/coupons?validate=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), total: subtotal() }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon(data.code, data.discount);
        toast.success(`Coupon applied! You saved ${formatINR(data.discount)}`);
      } else {
        toast.error(data.error || "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null, 0);
    setCouponInput("");
  };

  const total = Math.max(0, subtotal() - couponDiscount);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - total);
  const freeShipProgress = Math.min(100, (total / freeShippingThreshold) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border bg-card px-4 py-3">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              Your Cart ({items.length})
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeCart}>
              <X size={16} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag size={36} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add some delicious chana & peanuts to get started!
              </p>
            </div>
            <Button onClick={() => { closeCart(); navigate("/products"); }} className="gap-2">
              Start Shopping <ArrowRight size={15} />
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-border bg-primary/5 px-4 py-2.5">
              {remainingForFreeShip > 0 ? (
                <p className="text-xs text-foreground">
                  <Truck size={13} className="mr-1 inline text-primary" />
                  Add <span className="font-bold text-primary">{formatINR(remainingForFreeShip)}</span> more for FREE shipping! 🚚
                </p>
              ) : (
                <p className="text-xs font-semibold text-primary">
                  <Truck size={13} className="mr-1 inline" />
                  🎉 You've unlocked FREE shipping!
                </p>
              )}
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${freeShipProgress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const price = item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price;
                  return (
                    <div
                      key={`${item.productId}-${item.variant}`}
                      className="flex gap-3 rounded-xl border border-border/60 bg-card p-2"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <p className="line-clamp-2 text-sm font-semibold leading-tight">
                          {item.name}
                        </p>
                        {item.weight && (
                          <p className="text-xs text-muted-foreground">{item.weight}</p>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-background"
                              aria-label="Decrease"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-5 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-background disabled:opacity-40"
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Increase"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold">
                            {formatINR(price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variant)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupon + summary */}
            <div className="border-t border-border bg-card px-4 py-3">
              {/* Coupon */}
              {couponCode ? (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Tag size={13} /> {couponCode}
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (try WELCOME10)"
                    className="h-9 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyCoupon}
                    disabled={validating}
                    className="h-9"
                  >
                    Apply
                  </Button>
                </div>
              )}

              {/* Summary */}
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatINR(subtotal())}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {total >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">{formatINR(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="mt-3 h-11 w-full gap-2 text-sm font-semibold shadow-md"
                size="lg"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
