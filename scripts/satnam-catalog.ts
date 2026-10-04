/**
 * Satnam Sing Chana — real product catalog.
 *
 * Keeps ONLY the Satnam products listed below (all other products & categories are deleted).
 * Prices (per kg): Khari Sing 200, Mori Sing 200, Khara Chana 160, Mora Chana 160, Masala Sing 250, Masala Chana 200.
 * Safe to run more than once (it upserts by slug).
 *
 *   npx tsx scripts/satnam-catalog.ts                  # products + categories
 *   npx tsx scripts/satnam-catalog.ts --reset-banners  # also reset homepage banners to the new defaults
 *
 * Uses DATABASE_URL from .env — run it once against the live database after deploying.
 */
import { db } from "../src/lib/db";

const IMG = "/products/satnam";

const CATEGORIES = [
  {
    slug: "roasted-peanuts",
    name: "Roasted Sing",
    description: "Traditionally roasted peanuts — Khari Sing and Mori Sing, by weight.",
    color: "#e9d7c1",
    icon: "🥜",
    image: `${IMG}/khari-sing.webp`,
    order: 1,
  },
  {
    slug: "roasted-chana",
    name: "Roasted Chana",
    description: "Khara Chana and Mora Chana, roasted the traditional way.",
    color: "#efd27a",
    icon: "🫘",
    image: `${IMG}/khara-chana.webp`,
    order: 2,
  },
  {
    slug: "masala-range",
    name: "Masala Range",
    description: "Chatpata Masala Sing & Masala Chana — bold spices, no added colour.",
    color: "#f3c2a6",
    icon: "🌶️",
    image: `${IMG}/masala-sing.webp`,
    order: 3,
  },
  {
    slug: "10-rupee-packs",
    name: "₹10 Packs",
    description: "Satnam's favourite snacks in handy ₹10 packs.",
    color: "#ffe27a",
    icon: "🔟",
    image: `${IMG}/masala-chana-10.webp`,
    order: 4,
  },
];

type Variant = { label: string; value: string; price: number };

/** Weight options priced from the per-kg rate. */
function byWeight(perKg: number, grams: number[]): Variant[] {
  return grams.map((g) => ({ label: `${g} g`, value: `${g}g`, price: Math.round((perKg * g) / 1000) }));
}

const BENEFITS = ["No Added Colour & Preservatives", "Traditionally Roasted", "Protein Rich"];
const STORAGE = "Store in a cool, dry place. Once opened, keep in an airtight container.";

const PRODUCTS: {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number; // used when there are no variants
  variants: Variant[];
  tags: string[];
  ingredients: string;
  benefits: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
}[] = [
  // ---------- By weight ----------
  {
    slug: "roasted-khari-sing",
    name: "Roasted Khari Sing",
    category: "roasted-peanuts",
    shortDescription: "Gujarat's classic salted roasted peanuts in shell — high protein, extra crunchy. ₹200/kg.",
    description:
      "Satnam Roasted Khari Sing is the classic Gujarati salted peanut, roasted in its shell the traditional way so every peanut stays crisp and evenly salted. A high-protein snack for tea time, travel or anytime munching. Quality is our recipe — since 1992.",
    images: [`${IMG}/khari-sing.webp`],
    price: 50,
    variants: byWeight(200, [250, 500]),
    tags: ["khari sing", "peanuts", "salted", "in shell", "high protein"],
    ingredients: "Peanuts (in shell), Salt",
    benefits: ["High Protein", ...BENEFITS.slice(0, 2)],
    isFeatured: true,
    isBestseller: true,
  },
  {
    slug: "mori-sing",
    name: "Mori Sing (Plain Roasted Peanuts)",
    category: "roasted-peanuts",
    shortDescription: "Plain roasted peanuts with no salt or masala — pure, simple crunch. ₹200/kg.",
    description:
      "Satnam Mori Sing is plain roasted peanuts — no salt, no masala, just the natural taste of well-roasted sing. Perfect for fasting days, for cooking, or for anyone who likes their peanuts pure. No added colour or preservatives.",
    images: [`${IMG}/mori-sing.webp`],
    price: 50,
    variants: byWeight(200, [250, 500]),
    tags: ["mori sing", "plain peanuts", "unsalted", "roasted peanuts"],
    ingredients: "Peanuts",
    benefits: BENEFITS,
    isFeatured: true,
  },
  {
    slug: "khara-chana",
    name: "Khara Chana",
    category: "roasted-chana",
    shortDescription: "Export-quality roasted chana with salt & haldi. ₹160/kg.",
    description:
      "Satnam Khara Chana is whole chana roasted the traditional way and lightly seasoned with salt and haldi. Crunchy, wholesome and export quality, with no added colour or preservatives. A protein-rich snack the whole family can enjoy.",
    images: [`${IMG}/khara-chana.webp`],
    price: 40,
    variants: byWeight(160, [250, 500]),
    tags: ["khara chana", "roasted chana", "haldi", "export quality", "protein"],
    ingredients: "Roasted Chana, Salt, Turmeric (Haldi)",
    benefits: [...BENEFITS, "Export Quality"],
    isFeatured: true,
    isBestseller: true,
  },
  {
    slug: "mora-chana",
    name: "Mora Chana (Plain Roasted Chana)",
    category: "roasted-chana",
    shortDescription: "Plain roasted chana with no salt or masala — wholesome and protein rich. ₹160/kg.",
    description:
      "Satnam Mora Chana is plain roasted chana — no salt, no masala, just crunchy roasted chana the way it has always been made. A light, protein-rich snack with no added colour or preservatives.",
    images: [`${IMG}/mora-chana.webp`],
    price: 40,
    variants: byWeight(160, [250, 500]),
    tags: ["mora chana", "plain chana", "unsalted", "roasted chana"],
    ingredients: "Roasted Chana",
    benefits: BENEFITS,
    isFeatured: true,
  },
  {
    slug: "masala-sing",
    name: "Masala Sing",
    category: "masala-range",
    shortDescription: "Roasted peanuts tossed in chatpata red chilli masala. ₹250/kg.",
    description:
      "Satnam Masala Sing is crunchy roasted peanuts coated in a spicy, tangy masala of red chilli and Indian spices. Traditionally roasted with no added colour or preservatives — the perfect chatpata snack.",
    images: [`${IMG}/masala-sing.webp`],
    price: 50,
    variants: byWeight(250, [200]),
    tags: ["masala sing", "masala peanuts", "spicy", "chatpata"],
    ingredients: "Peanuts, Red Chilli, Spices, Salt",
    benefits: BENEFITS,
    isFeatured: true,
    isBestseller: true,
  },
  {
    slug: "chatpata-masala-chana",
    name: "Chatpata Masala Chana",
    category: "masala-range",
    shortDescription: "Export-quality roasted chana in a chatpata masala coating. ₹200/kg.",
    description:
      "Satnam Chatpata Masala Chana is roasted chana coated in a bold, tangy masala with red chilli. Export quality, traditionally roasted and free from added colour and preservatives. High in protein and full of crunch.",
    images: [`${IMG}/masala-chana-family.webp`],
    price: 40,
    variants: byWeight(200, [200]),
    tags: ["masala chana", "chatpata", "spicy", "roasted chana", "export quality"],
    ingredients: "Roasted Chana, Red Chilli, Spices, Salt",
    benefits: [...BENEFITS, "Export Quality"],
    isFeatured: true,
  },

  // ---------- ₹10 packs ----------
  {
    slug: "khari-sing-10-rupee-pack",
    name: "Khari Sing ₹10 Pack",
    category: "10-rupee-packs",
    shortDescription: "Roasted Khari Sing in a handy ₹10 pack.",
    description:
      "The same Satnam Roasted Khari Sing — salted, roasted in shell and extra crunchy — in a handy ₹10 pack. Perfect for the bag, the office drawer or the school tiffin.",
    images: [`${IMG}/khari-sing.webp`],
    price: 10,
    variants: [],
    tags: ["khari sing", "10 rupee", "small pack", "peanuts"],
    ingredients: "Peanuts (in shell), Salt",
    benefits: ["High Protein", ...BENEFITS.slice(0, 2)],
  },
  {
    slug: "masala-sing-10-rupee-pack",
    name: "Masala Sing ₹10 Pack",
    category: "10-rupee-packs",
    shortDescription: "Chatpata Masala Sing in a handy ₹10 pack.",
    description:
      "Satnam Masala Sing — roasted peanuts in a spicy red chilli masala — in a handy ₹10 pack. No added colour or preservatives.",
    images: [`${IMG}/masala-sing.webp`],
    price: 10,
    variants: [],
    tags: ["masala sing", "10 rupee", "small pack", "spicy"],
    ingredients: "Peanuts, Red Chilli, Spices, Salt",
    benefits: BENEFITS,
  },
  {
    slug: "masala-chana-10-rupee-pack",
    name: "Masala Chana ₹10 Pack",
    category: "10-rupee-packs",
    shortDescription: "Chatpata Masala Chana in a handy ₹10 pack.",
    description:
      "Satnam Chatpata Masala Chana — roasted chana in a bold, tangy masala — in a handy ₹10 pack. No added colour or preservatives.",
    images: [`${IMG}/masala-chana-10.webp`],
    price: 10,
    variants: [],
    tags: ["masala chana", "10 rupee", "small pack", "chatpata"],
    ingredients: "Roasted Chana, Red Chilli, Spices, Salt",
    benefits: BENEFITS,
  },
];

async function main() {
  console.log("🥜 Setting up Satnam catalog…");

  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, color: c.color, icon: c.icon, image: c.image, order: c.order },
      create: c,
    });
    catIds[c.slug] = row.id;
    console.log(`  ✓ category ${c.name}`);
  }

  for (const p of PRODUCTS) {
    const data = {
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      categoryId: catIds[p.category],
      images: JSON.stringify(p.images),
      price: p.variants[0]?.price ?? p.price,
      salePrice: null,
      variants: JSON.stringify(p.variants),
      weight: null,
      inStock: true,
      stockQuantity: 200,
      isFeatured: p.isFeatured ?? false,
      isBestseller: p.isBestseller ?? false,
      isDealOfDay: false,
      isNew: true,
      tags: p.tags.join(","),
      ingredients: p.ingredients,
      benefits: JSON.stringify(p.benefits),
      storageInfo: STORAGE,
    };
    await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { ...data, slug: p.slug, rating: 0, reviewCount: 0, soldCount: 0 },
    });
    console.log(`  ✓ product ${p.name}`);
  }

  // Keep ONLY the products listed above — everything else is removed.
  // (Past orders keep their item name/price; only the product link is cleared.)
  const keepSlugs = PRODUCTS.map((p) => p.slug);
  const removed = await db.product.deleteMany({ where: { slug: { notIn: keepSlugs } } });
  console.log(`  ✓ removed ${removed.count} other products`);

  const keepCats = CATEGORIES.map((c) => c.slug);
  const removedCats = await db.category.deleteMany({ where: { slug: { notIn: keepCats } } });
  console.log(`  ✓ removed ${removedCats.count} other categories`);

  if (process.argv.includes("--reset-banners")) {
    await db.setting.deleteMany({ where: { key: "storefront_banners" } });
    console.log("  ✓ homepage banners reset to the new Satnam defaults");
  }

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
