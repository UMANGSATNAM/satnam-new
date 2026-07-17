"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Lightweight hash-based router for single-page app on the `/` route.
 * Routes:
 *   #/                       -> home
 *   #/products               -> all products
 *   #/category/:slug         -> category products
 *   #/product/:slug          -> product detail
 *   #/cart                   -> cart
 *   #/checkout               -> checkout
 *   #/order/:orderNumber     -> order confirmation
 *   #/about                  -> about
 *   #/contact                -> contact
 *   #/recipes                -> recipes
 *   #/admin                  -> admin (and sub routes via /admin/products etc.)
 */

export interface Route {
  path: string; // full hash path e.g. "/product/my-slug"
  segments: string[]; // ["product","my-slug"]
  query: URLSearchParams;
}

function parseHash(): Route {
  if (typeof window === "undefined") {
    return { path: "/", segments: [""], query: new URLSearchParams() };
  }
  let hash = window.location.hash.replace(/^#/, "");
  if (!hash) hash = "/";
  const [pathPart, queryPart] = hash.split("?");
  const path = pathPart || "/";
  const segments = path.split("/").filter(Boolean);
  const query = new URLSearchParams(queryPart || "");
  return { path, segments, query };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      // scroll to top on route change unless explicitly product anchor
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
    if (window.location.hash === target) {
      // already there; still scroll top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = target;
    }
  }, []);

  return { route, navigate };
}

export function navigate(to: string) {
  const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
  if (typeof window !== "undefined") {
    window.location.hash = target;
  }
}
