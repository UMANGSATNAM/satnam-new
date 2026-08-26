"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "./types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  couponDiscount: number;
  // actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, variant: string | undefined, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCoupon: (code: string | null, discount: number) => void;
  // selectors
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId && i.variant === item.variant
          );
          let items: CartItem[];
          if (existing) {
            items = state.items.map((i) =>
              i.productId === item.productId && i.variant === item.variant
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + item.quantity, i.maxStock || 99),
                  }
                : i
            );
          } else {
            items = [...state.items, item];
          }
          return { items, isOpen: true };
        }),

      removeItem: (productId, variant) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variant === variant)
          ),
        })),

      updateQuantity: (productId, variant, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variant === variant
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) }
              : i
          ),
        })),

      clear: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.salePrice != null && i.salePrice < i.price ? i.salePrice : i.price;
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "ssc-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);

// Wishlist store
interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  count: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      count: () => get().productIds.length,
    }),
    {
      name: "ssc-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Recently viewed store
interface RecentlyViewedState {
  productSlugs: string[];
  add: (slug: string) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productSlugs: [],
      add: (slug) =>
        set((state) => ({
          productSlugs: [slug, ...state.productSlugs.filter((s) => s !== slug)].slice(0, 8),
        })),
    }),
    {
      name: "ssc-recent",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
