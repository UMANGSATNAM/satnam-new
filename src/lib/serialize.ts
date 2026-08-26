import type { Product, Category, Review, Order, OrderItem, Coupon } from "./types";
import type { Prisma } from "@prisma/client";
import { parseJSON } from "./utils";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

type ProductRow = Prisma.ProductGetPayload<Record<string, never>>;

export function serializeProduct(p: ProductWithCategory | ProductRow): Product {
  const category =
    "category" in p && p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          description: p.category.description,
          image: p.category.image,
          color: p.category.color,
          icon: p.category.icon,
          order: p.category.order,
        }
      : undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    categoryId: p.categoryId,
    category,
    images: parseJSON<string[]>(p.images, []),
    price: p.price,
    salePrice: p.salePrice,
    variants: parseJSON(p.variants, []),
    weight: p.weight,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    isFeatured: p.isFeatured,
    isDealOfDay: p.isDealOfDay,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    rating: p.rating,
    reviewCount: p.reviewCount,
    tags: p.tags ? p.tags.split(",").filter(Boolean) : [],
    ingredients: p.ingredients,
    nutritionalInfo: p.nutritionalInfo ? parseJSON(p.nutritionalInfo, null) : null,
    benefits: p.benefits ? parseJSON<string[]>(p.benefits, []) : [],
    shelfLife: p.shelfLife,
    storageInfo: p.storageInfo,
    soldCount: p.soldCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function serializeCategory(
  c: Prisma.CategoryGetPayload<Record<string, never>>,
  productCount?: number
): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    color: c.color,
    icon: c.icon,
    order: c.order,
    productCount,
  };
}

export function serializeReview(r: Prisma.ReviewGetPayload<Record<string, never>>): Review {
  return {
    id: r.id,
    productId: r.productId,
    customerName: r.customerName,
    email: r.email,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    verified: r.verified,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
  };
}

export function serializeOrderItem(i: Prisma.OrderItemGetPayload<Record<string, never>>): OrderItem {
  return {
    id: i.id,
    productId: i.productId,
    name: i.name,
    image: i.image,
    price: i.price,
    quantity: i.quantity,
    weight: i.weight,
    variant: i.variant,
    total: i.total,
  };
}

export function serializeOrder(
  o: Prisma.OrderGetPayload<{ include: { items: true } }>
): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    address: o.address,
    city: o.city,
    state: o.state,
    pincode: o.pincode,
    notes: o.notes,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    total: o.total,
    couponCode: o.couponCode,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    razorpayOrderId: o.razorpayOrderId,
    razorpayPaymentId: o.razorpayPaymentId,
    status: o.status,
    items: o.items.map(serializeOrderItem),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export function serializeCoupon(c: Prisma.CouponGetPayload<Record<string, never>>): Coupon {
  return {
    id: c.id,
    code: c.code,
    description: c.description,
    type: c.type as "PERCENTAGE" | "FLAT",
    value: c.value,
    minOrder: c.minOrder,
    maxDiscount: c.maxDiscount,
    isActive: c.isActive,
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  };
}
