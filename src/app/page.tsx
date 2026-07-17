import { db } from "@/lib/db";
import { serializeProduct, serializeCategory } from "@/lib/serialize";
import { getSettings } from "@/lib/settings";
import { ensureAdminUser } from "@/lib/auth";
import { AppShell } from "@/components/store/app-shell";
import type { Product, Category, Settings } from "@/lib/types";

// Force dynamic rendering for fresh data
export const dynamic = "force-dynamic";

async function getInitialData() {
  const [settings, categories, products, counts] = await Promise.all([
    getSettings(),
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.product.findMany({
      include: { category: true },
      orderBy: { isFeatured: "desc" },
    }),
    db.product.groupBy({ by: ["categoryId"], _count: true }),
  ]);

  const countMap = new Map(counts.map((c) => [c.categoryId, c._count]));
  const serializedCategories: Category[] = categories.map((c) =>
    serializeCategory(c, countMap.get(c.id) || 0)
  );
  const serializedProducts: Product[] = products.map(serializeProduct);

  return { settings, categories: serializedCategories, products: serializedProducts };
}

export default async function Page() {
  // Ensure admin user exists on first load
  ensureAdminUser().catch(() => {});

  const { settings, categories, products } = await getInitialData();

  return <AppShell products={products} categories={categories} settings={settings} />;
}
