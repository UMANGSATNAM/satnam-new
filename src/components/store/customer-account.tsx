"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  ShoppingBag,
  RotateCcw,
  Truck,
  Phone,
  Mail,
  ArrowRight,
  Receipt,
  Package,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useRouter } from "@/lib/router";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order, Product, Settings } from "@/lib/types";

interface CustomerAccountProps {
  products: Product[];
  settings: Settings;
}

export function CustomerAccountPage({ products, settings }: CustomerAccountProps) {
  const { navigate } = useRouter();
  const { addItem, openCart } = useCart();
  const [identifier, setIdentifier] = useState("");
  const [savedIdentifier, setSavedIdentifier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ssc_customer_lookup");
    if (saved) {
      setIdentifier(saved);
      fetchOrders(saved);
    }
  }, []);

  const fetchOrders = async (idToSearch: string) => {
    const q = idToSearch.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data.orders || []);
      setSavedIdentifier(q);
      localStorage.setItem("ssc_customer_lookup", q);
    } catch (e) {
      toast.error((e as Error).message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    order.items.forEach((item) => {
      // Look for product in catalog to ensure fresh pricing and max stock
      const matchedProduct = products.find((p) => p.id === item.productId || p.name === item.name);
      addItem({
        productId: item.productId || matchedProduct?.id || `reorder-${item.name}`,
        slug: matchedProduct?.slug || "products",
        name: item.name,
        image: item.image || "/products/roasted-chana-plain.png",
        price: item.price,
        quantity: item.quantity,
        weight: item.weight || undefined,
        variant: item.variant || undefined,
        maxStock: matchedProduct?.stockQuantity || 50,
      });
      addedCount++;
    });

    toast.success(`Added ${addedCount} items from Order #${order.orderNumber} to your cart! 🛍️`);
    openCart();
  };

  const handleLogoutLookup = () => {
    localStorage.removeItem("ssc_customer_lookup");
    setSavedIdentifier(null);
    setOrders([]);
    setSearched(false);
    setIdentifier("");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={20} />
            </div>
            <h1 className="font-playfair text-2xl font-bold sm:text-3xl">My Account & Orders</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View your order history, track deliveries, and quickly reorder your favorite snacks.
          </p>
        </div>

        {savedIdentifier && (
          <Button variant="outline" size="sm" onClick={handleLogoutLookup} className="text-xs">
            Switch Account ({savedIdentifier})
          </Button>
        )}
      </div>

      {/* Lookup Form if not loaded */}
      {!savedIdentifier && (
        <Card className="mx-auto mt-8 max-w-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Find Your Orders</CardTitle>
            <p className="text-xs text-muted-foreground">
              Enter the phone number or email address you used during checkout.
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchOrders(identifier);
              }}
              className="space-y-4"
            >
              <div>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or user@gmail.com"
                  className="h-11"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
                {loading ? "Searching..." : "View My Orders"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your order history...</p>
        </div>
      ) : savedIdentifier && orders.length === 0 ? (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag size={32} />
          </div>
          <h2 className="font-playfair text-xl font-bold">No Orders Found</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We couldn't find any orders placed under &ldquo;{savedIdentifier}&rdquo;.
          </p>
          <Button onClick={() => navigate("/products")} className="mt-6 gap-2 rounded-full px-6">
            Start Shopping <ArrowRight size={16} />
          </Button>
        </div>
      ) : savedIdentifier && orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-playfair font-bold text-base">Order #{order.orderNumber}</span>
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        order.status === "DELIVERED" && "bg-green-600",
                        order.status === "SHIPPED" && "bg-blue-600",
                        order.status === "PROCESSING" && "bg-amber-600",
                        order.status === "CANCELLED" && "bg-destructive",
                        (order.status === "CONFIRMED" || order.status === "PENDING") && "bg-primary"
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={13} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-6">
                  {/* Items */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted/30">
                          <Image
                            src={item.image || "/products/roasted-chana-plain.png"}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-semibold leading-tight">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} {item.weight ? `• ${item.weight}` : ""}
                          </p>
                          <p className="text-xs font-bold text-primary">{formatINR(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Total */}
                  <div className="mt-4 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Total Paid: </span>
                      <span className="font-bold text-base text-foreground">{formatINR(order.total)}</span>
                      <span className="ml-2 text-muted-foreground">({order.paymentMethod})</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs rounded-full"
                        onClick={() => navigate(`/track?order=${order.orderNumber}`)}
                      >
                        <Truck size={14} /> Track Delivery
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1.5 text-xs rounded-full"
                        onClick={() => handleReorder(order)}
                      >
                        <RotateCcw size={14} /> Reorder All Items
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
