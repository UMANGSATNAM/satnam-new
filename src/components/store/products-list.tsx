"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Loader2, PackageX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/shared/product-card";
import { useProducts, useCategories } from "@/lib/hooks";
import { useRouter } from "@/lib/router";
import type { Category } from "@/lib/types";

interface ProductsListProps {
  initialCategory?: string;
  initialSearch?: string;
}

export function ProductsList({ initialCategory, initialSearch }: ProductsListProps) {
  const { navigate } = useRouter();
  const { data: categories } = useCategories();
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [search, setSearch] = useState(initialSearch || "");
  const [sort, setSort] = useState("featured");
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");

  const queryParams = useMemo(() => {
    const p: Record<string, string> = { sort };
    if (search) p.search = search;
    if (selectedCats.length === 1) p.category = selectedCats[0];
    if (inStockOnly) p.inStock = "true";
    if (minPrice) p.minPrice = minPrice;
    if (maxPrice) p.maxPrice = maxPrice;
    return p;
  }, [search, sort, selectedCats, inStockOnly, minPrice, maxPrice]);

  const { data, loading } = useProducts(queryParams);

  const activeCategory = categories?.find((c) => c.slug === selectedCats[0]);

  const toggleCat = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setInStockOnly(false);
    setMaxPrice("");
    setMinPrice("");
    setSearch("");
    navigate("/products");
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const FilterPanel = (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Categories</h3>
        <div className="flex flex-col gap-2">
          {(categories || []).map((cat: Category) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
            >
              <Checkbox
                checked={selectedCats.includes(cat.slug)}
                onCheckedChange={() => toggleCat(cat.slug)}
              />
              <span className="flex items-center gap-1.5 text-sm">
                <span>{cat.icon}</span> {cat.name}
              </span>
              {cat.productCount !== undefined && (
                <span className="ml-auto text-xs text-muted-foreground">({cat.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(v === true)}
          />
          <span className="text-sm">In stock only</span>
        </label>
      </div>

      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-playfair text-2xl font-bold sm:text-3xl">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeCategory?.description ||
            "Explore our complete range of premium roasted chana, peanuts & flavored snacks."}
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="h-10 pl-9"
          />
        </form>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-10 w-[180px]">
            <SlidersHorizontal size={15} className="mr-1" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="best-selling">Best Selling</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest Arrivals</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Mobile filter button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 md:hidden">
              <SlidersHorizontal size={16} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{FilterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-44 rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                Clear
              </button>
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : !data?.products || data.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <PackageX className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{data.products.length}</span> products
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
                {data.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
