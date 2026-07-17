"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
  Home as HomeIcon,
  Star,
  Heart,
  Share2,
  Flame,
  PackageCheck,
  Clock,
  Leaf,
  Award,
  ThumbsUp,
  ChevronDown,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shared/product-card";
import { StarRating } from "@/components/shared/star-rating";
import { useProduct, useReviews, useProducts } from "@/lib/hooks";
import { useCart, useWishlist, useRecentlyViewed } from "@/lib/cart";
import { useRouter, navigate } from "@/lib/router";
import { cn, formatINR, discountPercent, effectivePrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ProductDetailProps {
  slug: string;
  freeShippingThreshold: number;
}

export function ProductDetail({ slug, freeShippingThreshold }: ProductDetailProps) {
  const { data: product, loading } = useProduct(slug);
  const { data: reviews } = useReviews(product?.id || null);
  const { data: related } = useProducts(
    product ? { category: product.category?.slug, limit: "8" } : { limit: "8" }
  );
  const { navigate } = useRouter();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.openCart);
  const wishlist = useWishlist();
  const addRecent = useRecentlyViewed((s) => s.add);
  const recentSlugs = useRecentlyViewed((s) => s.productSlugs).filter((s) => s !== slug);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeCheck, setPincodeCheck] = useState<null | { ok: boolean; eta: string }>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", email: "", rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setSelectedVariant(0);
      setQuantity(1);
      addRecent(product.slug);
    }
  }, [product?.id, addRecent]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <p className="text-lg font-semibold">Product not found</p>
        <Button className="mt-4" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.salePrice);
  const variant = product.variants?.[selectedVariant] || product.variants?.[0];
  const variantPrice = variant?.price != null ? variant.price : effectivePrice(product.price, product.salePrice);
  const basePrice = variant?.price != null ? variant.price : product.price;
  const images = product.images?.length ? product.images : ["/products/roasted-chana-plain.png"];
  const isWished = wishlist.has(product.id);

  // urgency
  const lowStock = product.stockQuantity > 0 && product.stockQuantity < 15;
  const sellingFast = product.soldCount > 500;

  const handleAddToCart = async () => {
    if (!product.inStock) {
      toast.error("Sorry, this product is out of stock");
      return;
    }
    setAdding(true);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      price: product.price,
      salePrice: variant?.price ?? product.salePrice,
      quantity,
      weight: product.weight || variant?.label,
      variant: variant?.value,
      maxStock: product.stockQuantity,
    });
    await new Promise((r) => setTimeout(r, 500));
    setAdding(false);
    setAdded(true);
    toast.success(`${quantity} × ${product.name} added to cart!`, {
      description: `Subtotal: ${formatINR(variantPrice * quantity)}`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product.inStock) {
      toast.error("Sorry, this product is out of stock");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0],
      price: product.price,
      salePrice: variant?.price ?? product.salePrice,
      quantity,
      weight: product.weight || variant?.label,
      variant: variant?.value,
      maxStock: product.stockQuantity,
    });
    navigate("/checkout");
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeCheck({ ok: false, eta: "Please enter a valid 6-digit pincode" });
      return;
    }
    // mock: all pincodes serviceable
    const days = 3 + (Number(pincode[0]) % 4);
    setPincodeCheck({
      ok: true,
      eta: `Delivery by ${new Date(Date.now() + days * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} • Cash on Delivery available`,
    });
  };

  const submitReview = async () => {
    if (!reviewForm.name || !reviewForm.email || !reviewForm.comment) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmittingReview(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reviewForm, productId: product.id }),
      });
      toast.success("Review submitted! Thank you 🙏");
      setReviewForm({ name: "", email: "", rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // user cancelled
    }
  };

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = (reviews || []).filter((r) => r.rating === star).length;
    const pct = reviews?.length ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 hover:text-primary">
          <HomeIcon size={12} /> Home
        </button>
        <ChevronRight size={12} />
        <button onClick={() => navigate("/products")} className="hover:text-primary">Products</button>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <button onClick={() => navigate(`/category/${product.category!.slug}`)} className="hover:text-primary">
              {product.category.name}
            </button>
          </>
        )}
        <ChevronRight size={12} />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30">
            <Image
              src={images[activeImage] || images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white shadow">
                  -{discount}% OFF
                </span>
              )}
              {product.isBestseller && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                  <Flame size={11} /> Bestseller
                </span>
              )}
            </div>
            {/* Share */}
            <button
              onClick={shareProduct}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur hover:bg-white"
              aria-label="Share"
            >
              <Share2 size={15} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all sm:h-20 sm:w-20",
                    activeImage === i ? "border-primary" : "border-border opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {/* Trust badges grid */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, label: "FSSAI Certified" },
              { icon: Leaf, label: "100% Natural" },
              { icon: Truck, label: "Free Ship ₹499+" },
              { icon: RefreshCw, label: "Easy Returns" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-card p-2 text-center">
                <b.icon size={18} className="text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.category.name}
            </span>
          )}
          <h1 className="font-playfair text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <StarRating rating={product.rating} size={18} showValue />
            <button
              onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-primary hover:underline"
            >
              {product.reviewCount} reviews
            </button>
            <span className="flex items-center gap-1 text-sm text-emerald-600">
              <PackageCheck size={14} /> {product.soldCount > 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount} sold
            </span>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-foreground sm:text-4xl">
              {formatINR(variantPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatINR(basePrice)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  Save {formatINR(basePrice - variantPrice)}
                </Badge>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>

          {/* Urgency */}
          {product.inStock && (
            <div className="flex flex-wrap gap-2">
              {lowStock && (
                <div className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                  <Flame size={13} /> Hurry! Only {product.stockQuantity} left in stock
                </div>
              )}
              {sellingFast && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <Zap size={13} /> Selling fast — {product.soldCount}+ sold
                </div>
              )}
            </div>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2 text-sm">
            {product.inStock ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <Check size={15} /> In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-destructive">
                <Clock size={15} /> Out of Stock
              </span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {/* Variant selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Select Pack Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVariant(i)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                      selectedVariant === i
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {v.label}
                    {v.price != null && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ₹{v.price}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Quantity:</label>
              <div className="flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background"
                  aria-label="Decrease"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-background disabled:opacity-40"
                  disabled={quantity >= product.stockQuantity}
                  aria-label="Increase"
                >
                  <Plus size={15} />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-foreground">{formatINR(variantPrice * quantity)}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding || added}
                size="lg"
                variant="outline"
                className="h-12 flex-1 gap-2 text-sm font-semibold"
              >
                {adding ? <Loader2 size={17} className="animate-spin" /> : added ? <Check size={17} /> : <ShoppingCart size={17} />}
                {added ? "Added!" : "Add to Cart"}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                size="lg"
                className="h-12 flex-1 gap-2 text-sm font-semibold shadow-md"
              >
                <Zap size={17} /> Buy Now
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 border border-border"
                onClick={() => { wishlist.toggle(product.id); toast.success(isWished ? "Removed from wishlist" : "Added to wishlist ❤️"); }}
                aria-label="Wishlist"
              >
                <Heart size={18} className={isWished ? "fill-destructive text-destructive" : ""} />
              </Button>
            </div>
          </div>

          {/* Free shipping progress */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            {variantPrice * quantity >= freeShippingThreshold ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Truck size={16} /> 🎉 You qualify for FREE shipping!
              </p>
            ) : (
              <p className="text-sm text-foreground">
                <Truck size={15} className="mr-1 inline text-primary" />
                Add <span className="font-bold text-primary">{formatINR(freeShippingThreshold - variantPrice * quantity)}</span> more for FREE shipping
              </p>
            )}
          </div>

          {/* Pincode check */}
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <MapPin size={15} className="text-primary" /> Check Delivery
            </p>
            <div className="flex gap-2">
              <Input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="h-9"
              />
              <Button size="sm" onClick={checkPincode} className="h-9">Check</Button>
            </div>
            {pincodeCheck && (
              <p className={cn("mt-2 flex items-center gap-1.5 text-xs", pincodeCheck.ok ? "text-emerald-600" : "text-destructive")}>
                {pincodeCheck.ok ? <Check size={13} /> : <Clock size={13} />}
                {pincodeCheck.eta}
              </p>
            )}
          </div>

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <ThumbsUp size={15} className="text-primary" /> Key Benefits
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {product.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check size={14} className="shrink-0 text-emerald-600" /> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {product.shelfLife && (
              <div className="rounded-lg border border-border/60 p-2">
                <p className="text-muted-foreground">Shelf Life</p>
                <p className="font-semibold">{product.shelfLife}</p>
              </div>
            )}
            {product.weight && (
              <div className="rounded-lg border border-border/60 p-2">
                <p className="text-muted-foreground">Weight</p>
                <p className="font-semibold">{product.weight}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews / FAQ */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Description
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              Reviews ({reviews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="faq" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="mb-2 font-playfair text-xl font-bold">About this product</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {product.description}
                </p>
                {product.ingredients && (
                  <div className="mt-4">
                    <h4 className="mb-1 text-sm font-bold">Ingredients</h4>
                    <p className="text-sm text-muted-foreground">{product.ingredients}</p>
                  </div>
                )}
                {product.storageInfo && (
                  <div className="mt-4">
                    <h4 className="mb-1 text-sm font-bold">Storage Instructions</h4>
                    <p className="text-sm text-muted-foreground">{product.storageInfo}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                    <Award size={15} className="text-primary" /> Why Buy From Us?
                  </h4>
                  <ul className="space-y-2 text-sm text-foreground/80">
                    <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> 100% natural, no preservatives</li>
                    <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Traditionally roasted in small batches</li>
                    <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Vacuum packed for freshness</li>
                    <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> FSSAI certified quality</li>
                    <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Fast & secure delivery</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" id="reviews" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-border bg-card p-5 text-center">
                  <p className="text-4xl font-bold">{product.rating.toFixed(1)}</p>
                  <StarRating rating={product.rating} size={18} className="justify-center my-2" />
                  <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                </div>
                <div className="mt-3 space-y-1.5">
                  {ratingBreakdown.map((r) => (
                    <div key={r.star} className="flex items-center gap-2 text-xs">
                      <span className="flex w-8 items-center gap-0.5">
                        {r.star} <Star size={11} className="fill-amber-400 text-amber-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowReviewForm((s) => !s)}
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </Button>
                {showReviewForm && (
                  <div className="mt-3 space-y-2 rounded-xl border border-border p-3">
                    <Input
                      placeholder="Your name *"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="h-9"
                    />
                    <Input
                      type="email"
                      placeholder="Your email *"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                      className="h-9"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rating:</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          aria-label={`${s} stars`}
                        >
                          <Star
                            size={20}
                            className={s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}
                          />
                        </button>
                      ))}
                    </div>
                    <Input
                      placeholder="Review title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      className="h-9"
                    />
                    <Textarea
                      placeholder="Share your experience... *"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={3}
                    />
                    <Button onClick={submitReview} disabled={submittingReview} className="w-full" size="sm">
                      {submittingReview ? <Loader2 size={15} className="animate-spin" /> : "Submit Review"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Review list */}
              <div className="lg:col-span-2">
                <div className="space-y-3">
                  {(reviews || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                  ) : (
                    (reviews || []).slice(0, 10).map((r) => (
                      <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              {r.customerName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{r.customerName}</p>
                              {r.verified && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                  <Check size={10} /> Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </span>
                        </div>
                        <StarRating rating={r.rating} size={13} className="mt-2" />
                        {r.title && <p className="mt-1.5 text-sm font-semibold">{r.title}</p>}
                        <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <Accordion type="single" collapsible className="max-w-3xl">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {related && related.products.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-playfair text-xl font-bold sm:text-2xl">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
            {related.products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{product.weight}</p>
            <p className="text-lg font-bold">{formatINR(variantPrice * quantity)}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || adding}
            className="flex-1 gap-2"
            size="lg"
          >
            {adding ? <Loader2 size={17} className="animate-spin" /> : <ShoppingCart size={17} />}
            Add to Cart
          </Button>
          <Button onClick={handleBuyNow} disabled={!product.inStock} size="lg" className="gap-2">
            <Zap size={17} /> Buy
          </Button>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  { q: "Are your products 100% natural?", a: "Yes! All our roasted chana and peanuts are 100% natural with no artificial colors, preservatives, or additives. We use only premium quality ingredients and traditional roasting methods." },
  { q: "How is the packaging?", a: "We use vacuum-sealed packaging to lock in freshness, crunch, and flavor. Each pack is sealed at the source to ensure you receive the product at peak freshness." },
  { q: "What is the shelf life?", a: "Our products have a shelf life of 6 months from the manufacturing date when stored properly in a cool, dry place." },
  { q: "Do you offer free shipping?", a: "Yes! We offer free shipping on all orders above ₹499. Orders below ₹499 incur a nominal shipping fee of ₹49." },
  { q: "What is your return policy?", a: "We offer a 7-day return policy. If you receive a damaged or defective product, please contact us within 7 days with photos for a full refund or replacement." },
  { q: "Are your products FSSAI certified?", a: "Yes, all our products are manufactured in FSSAI-certified facilities and comply with all food safety standards." },
];
