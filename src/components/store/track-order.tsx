"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Receipt,
  Printer,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";
import type { Order, Settings } from "@/lib/types";

interface TrackOrderProps {
  initialOrderNumber?: string;
  settings: Settings;
}

const ORDER_STAGES = [
  { key: "PENDING", label: "Order Placed", desc: "We've received your order" },
  { key: "CONFIRMED", label: "Order Confirmed", desc: "Payment verified & accepted" },
  { key: "PROCESSING", label: "Packed & Sealed", desc: "Freshly roasted and vacuum packed" },
  { key: "SHIPPED", label: "Shipped", desc: "Handed over to courier partner" },
  { key: "DELIVERED", label: "Delivered", desc: "Delivered to your doorstep" },
];

function getStageIndex(status: string): number {
  switch (status.toUpperCase()) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PROCESSING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
      return -1;
    default:
      return 1;
  }
}

export function TrackOrderPage({ initialOrderNumber, settings }: TrackOrderProps) {
  const { navigate } = useRouter();
  const [query, setQuery] = useState(initialOrderNumber || "");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleSearch(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      toast.error("Please enter an Order ID, Phone number, or Email");
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setOrders(data.orders || []);
      if (data.orders?.length > 0) {
        setSelectedOrder(data.orders[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch (e) {
      toast.error((e as Error).message);
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = selectedOrder ? getStageIndex(selectedOrder.status) : 0;
  const isCancelled = selectedOrder?.status.toUpperCase() === "CANCELLED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Truck size={28} />
        </div>
        <h1 className="font-playfair text-3xl font-bold sm:text-4xl">Track Your Order</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Enter your Order ID (e.g. SSC...), registered Phone number, or Email address to see real-time delivery status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mt-6 max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SSC26081234 or 9876543210"
              className="h-12 rounded-full pl-9 pr-4 text-sm shadow-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 rounded-full px-6 font-semibold shadow-sm"
          >
            {loading ? "Searching..." : "Track Status"}
          </Button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Locating your package details...</p>
        </div>
      ) : hasSearched && !selectedOrder ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h2 className="mt-3 text-lg font-bold">No Order Found</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            We couldn't find an order matching &ldquo;{query}&rdquo;. Please double check your order number or phone and try again.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setQuery("")}>
              Try Again
            </Button>
            <Button onClick={() => navigate("/contact")} variant="default">
              Contact Support
            </Button>
          </div>
        </div>
      ) : selectedOrder ? (
        <div className="mt-8 space-y-6">
          {/* Multiple orders switcher if found by phone/email */}
          {orders.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3">
              <span className="text-xs font-semibold text-muted-foreground">Multiple orders found:</span>
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                    selectedOrder.id === o.id
                      ? "bg-primary text-primary-foreground font-bold shadow-sm"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  )}
                >
                  #{o.orderNumber} ({formatINR(o.total)})
                </button>
              ))}
            </div>
          )}

          {/* Main order card */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-playfair text-xl">Order #{selectedOrder.orderNumber}</CardTitle>
                    <Badge
                      className={cn(
                        "font-semibold",
                        selectedOrder.status === "DELIVERED" && "bg-green-600",
                        selectedOrder.status === "SHIPPED" && "bg-blue-600",
                        selectedOrder.status === "PROCESSING" && "bg-amber-600",
                        selectedOrder.status === "CANCELLED" && "bg-destructive",
                        (selectedOrder.status === "CONFIRMED" || selectedOrder.status === "PENDING") && "bg-primary"
                      )}
                    >
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed on {formatDate(selectedOrder.createdAt)} • Payment:{" "}
                    <span className="font-semibold">{selectedOrder.paymentMethod}</span> (
                    <span className={selectedOrder.paymentStatus === "PAID" ? "text-green-600 font-semibold" : "text-amber-600"}>
                      {selectedOrder.paymentStatus}
                    </span>
                    )
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Receipt
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Timeline */}
              {isCancelled ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
                  <p className="font-bold text-destructive">This order was Cancelled</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    If you have questions about refund or cancellation, please contact our support team.
                  </p>
                </div>
              ) : (
                <div className="my-4">
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-4 top-4 hidden h-0.5 w-[calc(100%-2rem)] bg-muted sm:block md:left-6 md:w-[calc(100%-3rem)]">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(0, (currentStageIndex / (ORDER_STAGES.length - 1)) * 100)}%` }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="grid gap-6 sm:grid-cols-5 sm:gap-2">
                      {ORDER_STAGES.map((stage, idx) => {
                        const isDone = currentStageIndex >= idx;
                        const isCurrent = currentStageIndex === idx;

                        return (
                          <div key={stage.key} className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                            <div
                              className={cn(
                                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                                isDone
                                  ? "border-primary bg-primary text-primary-foreground shadow"
                                  : "border-muted-foreground/30 bg-card text-muted-foreground",
                                isCurrent && "ring-4 ring-primary/20 scale-110"
                              )}
                            >
                              {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <div>
                              <p className={cn("text-xs font-bold", isDone ? "text-foreground" : "text-muted-foreground")}>
                                {stage.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-2">{stage.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Courier Tracking notes if available */}
              {selectedOrder.notes && (
                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Shipping & Tracking Details</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Grid of details */}
              <div className="mt-6 grid gap-6 border-t border-border pt-6 md:grid-cols-2">
                {/* Items */}
                <div>
                  <h3 className="mb-3 font-semibold text-sm">Order Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted/30">
                          <Image
                            src={item.image || "/products/roasted-chana-plain.png"}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs leading-snug line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} {item.weight ? `• ${item.weight}` : ""}
                          </p>
                        </div>
                        <p className="text-xs font-bold">{formatINR(item.total)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 rounded-xl bg-muted/30 p-3 text-xs space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatINR(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-destructive">
                        <span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span>
                        <span>-{formatINR(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping Fee</span>
                      <span>{selectedOrder.shipping === 0 ? "FREE" : formatINR(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/60 pt-1.5 font-bold text-sm text-foreground">
                      <span>Total Paid</span>
                      <span className="text-primary">{formatINR(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address & Customer Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold text-sm flex items-center gap-1.5">
                      <MapPin size={15} className="text-primary" /> Delivery Address
                    </h3>
                    <div className="rounded-xl border border-border bg-card p-3.5 text-xs space-y-1 text-muted-foreground">
                      <p className="font-bold text-foreground">{selectedOrder.customerName}</p>
                      <p>{selectedOrder.address}</p>
                      <p>
                        {selectedOrder.city}, {selectedOrder.state} - <span className="font-semibold text-foreground">{selectedOrder.pincode}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-semibold text-sm flex items-center gap-1.5">
                      <Phone size={15} className="text-primary" /> Contact Details
                    </h3>
                    <div className="rounded-xl border border-border bg-card p-3.5 text-xs space-y-1 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Phone size={13} /> {selectedOrder.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={13} /> {selectedOrder.email}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-primary" /> Need Assistance?
                    </p>
                    <p className="mt-1">
                      Call us at <a href={`tel:${settings.phone}`} className="font-bold text-primary hover:underline">{settings.phone}</a> or email <a href={`mailto:${settings.email}`} className="font-bold text-primary hover:underline">{settings.email}</a>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
