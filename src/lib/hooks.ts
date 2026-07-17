"use client";

import { useEffect, useState, useCallback } from "react";
import type { Product, Category, Review, Order, Coupon, Settings } from "@/lib/types";

export function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch, setData };
}

export function useProducts(params: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.set(k, v);
  });
  const url = `/api/products?${query.toString()}`;
  return useFetch<{ products: Product[]; count: number }>(url, [url]);
}

export function useCategories() {
  return useFetch<Category[]>("/api/categories");
}

export function useProduct(slug: string | null) {
  return useFetch<Product>(slug ? `/api/products/${slug}` : null, [slug]);
}

export function useReviews(productId: string | null) {
  return useFetch<Review[]>(productId ? `/api/reviews?productId=${productId}` : null, [productId]);
}

export function useSettings(initial?: Settings) {
  const { data, ...rest } = useFetch<Settings>("/api/settings");
  return { settings: data || initial, ...rest };
}

export function useAdminOrders(status?: string) {
  const url = `/api/orders${status ? `?status=${status}` : ""}`;
  return useFetch<Order[]>(url, [url]);
}

export function useAdminStats() {
  return useFetch<{
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    lowStockProducts: number;
    totalReviews: number;
    totalRevenue: number;
    recentOrders: Array<Record<string, unknown>>;
    lowStock: Array<Record<string, unknown>>;
    salesByDay: Array<{ date: string; total: number; count: number }>;
    topProducts: Array<Record<string, unknown>>;
  }>("/api/admin/stats");
}

export function useAdminCoupons() {
  return useFetch<Coupon[]>("/api/coupons");
}
