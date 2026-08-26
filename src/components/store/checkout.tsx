"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Truck,
  Check,
  Loader2,
  Tag,
  X,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { useRouter } from "@/lib/router";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CheckoutProps {
  freeShippingThreshold: number;
  shippingFee: number;
  razorpayKeyId: string;
  paymentEnabled: boolean;
  codEnabled: boolean;
  upiId: string;
}

export function Checkout({ freeShippingThreshold, shippingFee, razorpayKeyId, paymentEnabled, codEnabled, upiId }: CheckoutProps) {
  const { items, subtotal, couponCode, couponDiscount, clear, closeCart } = useCart();
  const { navigate } = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(paymentEnabled ? "RAZORPAY" : "COD");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  const sub = subtotal();
  const discount = couponDiscount;
  const shipping = sub - discount >= freeShippingThreshold || sub === 0 ? 0 : shippingFee;
  const total = Math.max(0, sub - discount + shipping);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "10-digit phone required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validate()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "RAZORPAY" && razorpayKeyId) {
        // 1. Create Razorpay order
        const createRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-order",
            amount: total,
            customerName: form.customerName,
            email: form.email,
          }),
        });
        const order = await createRes.json();
        if (!createRes.ok) throw new Error(order.error || "Failed to create order");

        const isMock = order.mock === true;

        // 2. Open Razorpay checkout (or skip if mock)
        let razorpayPaymentId: string | undefined;
        let razorpaySignature: string | undefined;

        if (!isMock) {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) throw new Error("Failed to load payment gateway");

          await new Promise<void>((resolve, reject) => {
            const rzp = new window.Razorpay({
              key: razorpayKeyId,
              amount: order.amount,
              currency: order.currency || "INR",
              name: "Satnam Singh Chana",
              description: "Roasted Chana & Peanuts Order",
              order_id: order.id,
              prefill: {
                name: form.customerName,
                email: form.email,
                contact: form.phone,
              },
              theme: { color: "#2d6a4f" },
              handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
                razorpayPaymentId = response.razorpay_payment_id;
                razorpaySignature = response.razorpay_signature;
                resolve();
              },
              modal: {
                ondismiss: () => reject(new Error("Payment cancelled")),
              },
            });
            rzp.open();
          });
        } else {
          razorpayPaymentId = `pay_mock_${Date.now()}`;
          razorpaySignature = "mock_signature";
          toast.info("Demo mode: Razorpay not configured. Order will be created as PAID (mock).");
        }

        // 3. Verify & save order
        const saveRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify-and-save",
            razorpayOrderId: order.id,
            razorpayPaymentId,
            razorpaySignature,
            customer: form,
            items: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              image: i.image,
              price: i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price,
              quantity: i.quantity,
              weight: i.weight,
              variant: i.variant,
              total: (i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price) * i.quantity,
            })),
            subtotal: sub,
            discount,
            shipping,
            total,
            couponCode,
            paymentMethod: "RAZORPAY",
          }),
        });
        const saved = await saveRes.json();
        if (!saveRes.ok) throw new Error(saved.error || "Failed to save order");

        clear();
        navigate(`/order/${saved.orderNumber}`);
      } else {
        // COD order
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: form.customerName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            notes: form.notes,
            items: items.map((i) => ({
              productId: i.productId,
              name: i.name,
              image: i.image,
              price: i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price,
              quantity: i.quantity,
              weight: i.weight,
              variant: i.variant,
              total: (i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price) * i.quantity,
            })),
            subtotal: sub,
            discount,
            shipping,
            total,
            couponCode,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            status: "CONFIRMED",
          }),
        });
        const order = await res.json();
        if (!res.ok) throw new Error(order.error || "Failed to place order");
        clear();
        navigate(`/order/${order.orderNumber}`);
      }
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("cancelled")) {
        toast.error("Payment cancelled. Your cart is saved.");
      } else {
        toast.error(msg || "Failed to place order");
      }
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" />
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add some delicious snacks before checking out!
        </p>
        <Button onClick={() => navigate("/products")} className="gap-2">
          <ArrowLeft size={16} /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <button
        onClick={() => navigate("/products")}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={15} /> Continue Shopping
      </button>

      <h1 className="mb-6 font-playfair text-2xl font-bold sm:text-3xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Truck size={18} className="text-primary" /> Shipping Details
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className={cn(errors.customerName && "border-destructive")}
                />
                {errors.customerName && <p className="mt-1 text-xs text-destructive">{errors.customerName}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit mobile"
                  className={cn(errors.phone && "border-destructive")}
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House no, street, area..."
                  rows={2}
                  className={cn(errors.address && "border-destructive")}
                />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={cn(errors.city && "border-destructive")}
                />
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className={cn(errors.state && "border-destructive")}
                />
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="6-digit pincode"
                  className={cn(errors.pincode && "border-destructive")}
                />
                {errors.pincode && <p className="mt-1 text-xs text-destructive">{errors.pincode}</p>}
              </div>
              <div>
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Delivery instructions..."
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <CreditCard size={18} className="text-primary" /> Payment Method
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentEnabled && (
                <button
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                    paymentMethod === "RAZORPAY" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    paymentMethod === "RAZORPAY" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {paymentMethod === "RAZORPAY" ? <Check size={16} /> : <Wallet size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Online Payment</p>
                    <p className="text-xs text-muted-foreground">Cards, UPI, Net Banking, Wallets</p>
                  </div>
                </button>
              )}
              {codEnabled && (
                <button
                  onClick={() => setPaymentMethod("COD")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                    paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    paymentMethod === "COD" ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {paymentMethod === "COD" ? <Check size={16} /> : <Truck size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                  </div>
                </button>
              )}
            </div>
            {!paymentEnabled && !codEnabled && (
              <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                ⚠️ No payment method is enabled. Please contact us to place your order.
              </p>
            )}
            {paymentMethod === "RAZORPAY" && !razorpayKeyId && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠️ Razorpay is not configured yet. Online payment will run in demo mode. The admin can configure it from Admin → Integrations.
              </p>
            )}
            {upiId && paymentMethod === "RAZORPAY" && (
              <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-foreground">Or pay directly via UPI:</p>
                <p className="mt-1 font-mono text-sm font-bold text-primary">{upiId}</p>
                <p className="text-[10px] text-muted-foreground">Use this UPI ID in your UPI app, then email the screenshot to confirm your order.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3 text-xs text-foreground/70">
            <Lock size={14} className="text-primary" />
            Your payment information is processed securely. We do not store credit card details nor have access to your card information.
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-44 rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
            <div className="scrollbar-thin max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const price = item.salePrice != null && item.salePrice < item.price ? item.salePrice : item.price;
                return (
                  <div key={`${item.productId}-${item.variant}`} className="flex gap-2.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-2 text-xs font-semibold leading-tight">{item.name}</p>
                      {item.weight && <p className="text-[10px] text-muted-foreground">{item.weight}</p>}
                      <span className="mt-auto text-sm font-bold">{formatINR(price * item.quantity)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-3" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatINR(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> Discount {couponCode && `(${couponCode})`}
                  </span>
                  <span className="font-semibold">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{formatINR(total)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={placing}
              size="lg"
              className="mt-4 w-full gap-2 shadow-md"
            >
              {placing ? (
                <><Loader2 size={17} className="animate-spin" /> Processing...</>
              ) : (
                <>
                  <ShieldCheck size={17} /> Place Order
                </>
              )}
            </Button>

            <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Lock size={10} /> Secure</span>
              <span>•</span>
              <span>🔒 256-bit SSL</span>
              <span>•</span>
              <span>FSSAI Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
