export interface ProductVariant {
  label: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description: string;
  categoryId: string;
  category?: Category;
  images: string[];
  price: number;
  salePrice?: number | null;
  variants: ProductVariant[];
  weight?: string | null;
  inStock: boolean;
  stockQuantity: number;
  isFeatured: boolean;
  isDealOfDay: boolean;
  isBestseller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  ingredients?: string | null;
  nutritionalInfo?: Record<string, string> | null;
  benefits?: string[];
  shelfLife?: string | null;
  storageInfo?: string | null;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  color?: string | null;
  icon?: string | null;
  order: number;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  weight?: string;
  variant?: string;
  maxStock: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  email: string;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId?: string | null;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  weight?: string | null;
  variant?: string | null;
  total: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  minOrder: number;
  maxDiscount?: number | null;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  expiresAt?: string | null;
}

export interface Settings {
  brandName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  freeShippingThreshold: number;
  shippingFee: number;
  announcementBar: string;
  // Payment gateway (Razorpay) — stored in DB, configurable from admin
  razorpayKeyId: string;
  razorpayKeySecret: string;
  paymentEnabled: boolean;
  codEnabled: boolean;
  upiId: string;
  // Email (Gmail SMTP) — stored in DB, configurable from admin
  gmailUser: string;
  gmailAppPassword: string;
  storeNotifyEmail: string;
  emailEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  brandName: "Satnam Singh Chana",
  tagline: "Taste of Tradition",
  email: "info@satnamsinghchana.com",
  phone: "+919876543210",
  address: "Satnam Singh Chana, Industrial Area, Delhi, India",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  freeShippingThreshold: 499,
  shippingFee: 49,
  announcementBar: "Free Shipping on Orders Over ₹499 • Enjoy 10% Off Your First Order with code WELCOME10",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  paymentEnabled: true,
  codEnabled: true,
  upiId: "",
  gmailUser: "",
  gmailAppPassword: "",
  storeNotifyEmail: "",
  emailEnabled: true,
};

// Sentinel value returned by the API for secret fields that are set but masked
export const SECRET_MASK = "••••••••••••";
