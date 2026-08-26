"use client";

import { useEffect, useState, useCallback } from "react";

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

const DEFAULT_ROUTE: Route = {
  path: "/",
  segments: [],
  query: typeof window !== "undefined" ? new URLSearchParams() : new URLSearchParams(),
};

function parseHash(): Route {
  if (typeof window === "undefined") {
    return DEFAULT_ROUTE;
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
  const [route, setRoute] = useState<Route>(DEFAULT_ROUTE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setRoute(parseHash());

    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = target;
    }
  }, []);

  return { route, navigate, isMounted };
}

export function navigate(to: string) {
  const target = to.startsWith("#") ? to : `#${to.startsWith("/") ? to : "/" + to}`;
  if (typeof window !== "undefined") {
    window.location.hash = target;
  }
}
