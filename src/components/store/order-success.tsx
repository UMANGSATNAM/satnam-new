"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Loader2,
  Copy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import { formatINR, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Order } from "@/lib/types";

interface OrderSuccessProps {
  orderNumber: string;
}

export function OrderSuccess({ orderNumber }: OrderSuccessProps) {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}?by=number`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOrder(d))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg font-semibold">Order not found</p>
        <Button className="mt-4" onClick={() => navigate("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success("Order number copied!");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-emerald-50 to-primary/5 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={36} className="text-emerald-600" />
        </div>
        <h1 className="font-playfair text-2xl font-bold sm:text-3xl">Order Confirmed! 🎉</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Thank you for your order, <span className="font-semibold text-foreground">{order.customerName}</span>!
          We{"'"}ve sent a confirmation email to <span className="font-semibold text-foreground">{order.email}</span>.
        </p>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
          <span className="text-sm text-muted-foreground">Order #</span>
          <span className="font-bold text-primary">{order.orderNumber}</span>
          <button onClick={copyOrderNumber} className="text-muted-foreground hover:text-primary" aria-label="Copy">
            <Copy size={13} />
          </button>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-bold">Order Status</h2>
        <div className="flex items-center justify-between">
          {[
            { icon: CheckCircle2, label: "Confirmed", active: true },
            { icon: Package, label: "Processing", active: order.status !== "PENDING" },
            { icon: Truck, label: "Shipped", active: ["SHIPPED", "DELIVERED"].includes(order.status) },
            { icon: CheckCircle2, label: "Delivered", active: order.status === "DELIVERED" },
          ].map((step, i, arr) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={`h-0.5 flex-1 ${arr[i - 1].active ? "bg-primary" : "bg-border"}`} />
                )}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon size={16} />
                </div>
                {i < arr.length - 1 && (
                  <div className={`h-0.5 flex-1 ${step.active ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <span className={`text-xs font-medium ${step.active ? "text-primary" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <Clock size={13} />
          Estimated delivery: {new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        </div>
      </div>

      {/* Items */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-lg font-bold">Items Ordered ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <p className="line-clamp-2 text-sm font-semibold leading-tight">{item.name}</p>
                {item.weight && <p className="text-xs text-muted-foreground">{item.weight}</p>}
                <div className="mt-auto flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="font-bold">{formatINR(item.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping + payment */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <MapPin size={15} className="text-primary" /> Shipping Address
          </h2>
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{order.customerName}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p className="mt-1 flex items-center gap-1"><Phone size={12} /> {order.phone}</p>
            <p className="flex items-center gap-1"><Mail size={12} /> {order.email}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Package size={15} className="text-primary" /> Payment Summary
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping === 0 ? "FREE" : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatINR(order.total)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Payment Status</span>
              <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button onClick={() => navigate("/products")} size="lg" className="gap-2">
          Continue Shopping <ArrowRight size={17} />
        </Button>
        <p className="text-xs text-muted-foreground">
          Order placed on {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
}
