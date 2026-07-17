import { db } from "../src/lib/db";
import { slugify } from "../src/lib/utils";
import { ensureAdminUser } from "../src/lib/auth";
import { saveSettings } from "../src/lib/settings";
import { DEFAULT_SETTINGS } from "../src/lib/types";

const IMG = {
  chanaPlain: "/products/roasted-chana-plain.png",
  chanaHusk: "/products/roasted-chana-plain.png",
  peanutsHusk: "/products/roasted-peanuts-husk.png",
  peanutsSalted: "/products/roasted-peanuts-salted.png",
  peanutsDark: "/products/roasted-peanuts-dark.png",
  flavoredChana: "/products/flavored-chana.png",
  flavoredPeanuts: "/products/flavored-peanuts.png",
  chikki: "/products/chikki.png",
  combo: "/products/combo-pack.png",
};

interface SeedProduct {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  variants: { label: string; value: string; price?: number }[];
  weight: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  isDealOfDay?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  ingredients: string;
  benefits: string[];
  shelfLife: string;
  storageInfo: string;
  soldCount: number;
}

const PRODUCTS: SeedProduct[] = [
  {
    name: "Black Pepper Roasted Chana",
    slug: "black-pepper-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Crunchy roasted chana coated with bold black pepper for a spicy kick.",
    description:
      "Premium quality roasted whole chana (chickpeas) seasoned with cracked black pepper. Each bite delivers a satisfying crunch followed by a warm, peppery heat. A protein-rich, guilt-free snack perfect for any time of day. Vacuum packed to lock in freshness and crunch.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "300G Pack of 2 (2 X 150 G)", value: "300g-2pack" }],
    weight: "300G Pack of 2",
    inStock: true,
    stockQuantity: 45,
    isFeatured: true,
    isDealOfDay: true,
    rating: 4.6,
    reviewCount: 128,
    tags: ["spicy", "pepper", "protein", "chana"],
    ingredients: "Roasted Whole Chana, Black Pepper, Salt, Edible Vegetable Oil, Spices",
    benefits: ["High in Plant Protein", "Rich in Dietary Fiber", "Zero Cholesterol", "No Artificial Colors"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place. Once opened, transfer to an airtight container.",
    soldCount: 1240,
  },
  {
    name: "Black Pepper Roasted Peanuts",
    slug: "black-pepper-roasted-peanuts",
    category: "Flavored Peanuts",
    shortDescription: "Handpicked peanuts roasted with aromatic black pepper.",
    description:
      "Handpicked premium peanuts, traditionally roasted and seasoned with freshly cracked black pepper. The perfect balance of nutty crunch and peppery warmth. Vacuum packed for lasting freshness.",
    images: [IMG.flavoredPeanuts, IMG.peanutsSalted],
    price: 150,
    salePrice: 150,
    variants: [{ label: "Pack of 2 280 G (2 X 140 G)", value: "280g-2pack" }],
    weight: "Pack of 2 280G",
    inStock: false,
    stockQuantity: 0,
    rating: 4.5,
    reviewCount: 92,
    tags: ["spicy", "pepper", "peanuts"],
    ingredients: "Roasted Peanuts, Black Pepper, Salt, Spices",
    benefits: ["Good Source of Protein", "Heart-Healthy Fats", "Rich in Antioxidants"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place away from sunlight.",
    soldCount: 870,
  },
  {
    name: "Chatpata Masala Roasted Chana (Sweet Chilli)",
    slug: "chatpata-masala-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Tangy, sweet and spicy chana with a chatpata twist.",
    description:
      "A deliciously tangy and sweet-spicy roasted chana that tantalizes your taste buds. Coated with a special blend of sweet chilli and chatpata masala, this snack is a flavor explosion in every bite. Perfect for tea-time or as a party snack.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 160,
    salePrice: 160,
    variants: [{ label: "300 G Pack of 2 (02 x 150 G)", value: "300g-2pack" }],
    weight: "300G Pack of 2",
    inStock: false,
    stockQuantity: 0,
    isNew: true,
    rating: 4.7,
    reviewCount: 64,
    tags: ["tangy", "sweet", "spicy", "chana"],
    ingredients: "Roasted Whole Chana, Sweet Chilli Seasoning, Sugar, Salt, Spices, Citric Acid",
    benefits: ["Protein-Rich Snack", "Bold Flavor", "Perfect for Sharing"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 540,
  },
  {
    name: "Chili Garlic Roasted Chana",
    slug: "chili-garlic-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Fiery chili and roasted garlic flavored crunchy chana.",
    description:
      "Roasted whole chana tossed in a fiery blend of red chili and roasted garlic. A bold, savory snack with a satisfying crunch. The garlic adds depth while the chili brings the heat. Vacuum packed for maximum freshness.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "300G Pack of 2 (2 X 150 G)", value: "300g-2pack" }],
    weight: "300G Pack of 2",
    inStock: true,
    stockQuantity: 38,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 76,
    tags: ["spicy", "garlic", "chana"],
    ingredients: "Roasted Whole Chana, Red Chili, Garlic, Salt, Edible Oil, Spices",
    benefits: ["High Protein", "Bold Savory Flavor", "Immunity-Boosting Garlic"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 690,
  },
  {
    name: "Chilli Garlic Roasted Peanuts",
    slug: "chilli-garlic-roasted-peanuts",
    category: "Flavored Peanuts",
    shortDescription: "Spicy chili-garlic roasted peanuts with a satisfying crunch.",
    description:
      "Premium peanuts roasted and coated with a zesty chili-garlic seasoning. Each handful is packed with spicy, garlicky goodness. A favorite evening snack that pairs perfectly with chai.",
    images: [IMG.flavoredPeanuts, IMG.peanutsSalted],
    price: 150,
    salePrice: 150,
    variants: [{ label: "Pack of 2 280 G (2 X 140 G)", value: "280g-2pack" }],
    weight: "Pack of 2 280G",
    inStock: false,
    stockQuantity: 0,
    rating: 4.4,
    reviewCount: 58,
    tags: ["spicy", "garlic", "peanuts"],
    ingredients: "Roasted Peanuts, Red Chili, Garlic, Salt, Spices",
    benefits: ["Protein-Packed", "Bold Flavor", "Energy Boost"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 410,
  },
  {
    name: "Classic Salted Roasted Peanuts",
    slug: "classic-salted-roasted-peanuts",
    category: "Roasted Peanuts",
    shortDescription: "Crunchy, salty, delicious classic roasted peanuts.",
    description:
      "Our signature Classic Salted Roasted Peanuts — handpicked, traditionally roasted with just the right amount of salt. Crunchy, salty and irresistibly delicious. The timeless snack loved across generations. Vacuum packed to preserve the signature crunch.",
    images: [IMG.peanutsSalted, IMG.peanutsDark],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 60,
    isFeatured: true,
    isBestseller: true,
    isDealOfDay: true,
    rating: 4.7,
    reviewCount: 215,
    tags: ["classic", "salted", "peanuts", "bestseller"],
    ingredients: "Roasted Peanuts, Salt",
    benefits: ["100% Natural", "High in Protein", "No Preservatives", "Source of Healthy Fats"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place. Keep away from direct sunlight.",
    soldCount: 2340,
  },
  {
    name: "Dark Roasted Whole Peanut Unsalted",
    slug: "dark-roasted-whole-peanut-unsalted",
    category: "Roasted Peanuts",
    shortDescription: "Deep dark roasted unsalted peanuts with intense nutty flavor.",
    description:
      "Whole peanuts dark-roasted to perfection without any salt. The deep roasting process brings out an intense, rich nutty flavor. Ideal for those who prefer unsalted snacks or for use in cooking and chutneys. 100% natural, no added oil or salt.",
    images: [IMG.peanutsDark, IMG.peanutsSalted],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 42,
    isFeatured: true,
    isDealOfDay: true,
    rating: 4.5,
    reviewCount: 134,
    tags: ["unsalted", "dark-roast", "peanuts", "natural"],
    ingredients: "100% Roasted Whole Peanuts",
    benefits: ["No Added Salt", "100% Natural", "Rich in Protein & Fiber", "Perfect for Cooking"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 1180,
  },
  {
    name: "Flavour Roasted Chana Variety Combo Pack of 5",
    slug: "flavour-roasted-chana-variety-combo-pack-of-5",
    category: "Kitchen Essentials",
    shortDescription: "5 delicious flavored chana variants in one combo — save more!",
    description:
      "Enjoy 5 of our most-loved flavored roasted chana variants in one value combo pack. Perfect for households, parties and gifting. Each flavor is vacuum packed individually to preserve freshness. Save big when you buy the combo!",
    images: [IMG.combo, IMG.flavoredChana],
    price: 500,
    salePrice: 399,
    variants: [
      { label: "150G Each (Pack of 5)", value: "5pack", price: 399 },
      { label: "150G Each (Pack of 10)", value: "10pack", price: 749 },
    ],
    weight: "150G Each Pack of 5",
    inStock: false,
    stockQuantity: 0,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 89,
    tags: ["combo", "value-pack", "chana", "gift"],
    ingredients: "5 Flavored Roasted Chana Variants (Black Pepper, Mirch Masala, Hing Jeera, Haldi, Chili Garlic)",
    benefits: ["5 Flavors in 1 Pack", "Best Value", "Vacuum Packed", "Perfect for Gifting"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 760,
  },
  {
    name: "Flavour Roasted Peanut Variety Combo",
    slug: "flavour-roasted-peanut-variety-combo",
    category: "Kitchen Essentials",
    shortDescription: "Assorted flavored peanuts combo pack — variety in every bite.",
    description:
      "A curated assortment of our finest flavored roasted peanuts in one combo. Try multiple flavors and find your favorite. Great for sharing, gifting, or stocking up. Vacuum packed for freshness.",
    images: [IMG.combo, IMG.flavoredPeanuts],
    price: 400,
    salePrice: 375,
    variants: [{ label: "700G", value: "700g" }],
    weight: "700G",
    inStock: false,
    stockQuantity: 0,
    rating: 4.6,
    reviewCount: 47,
    tags: ["combo", "value-pack", "peanuts"],
    ingredients: "Assorted Flavored Roasted Peanuts (Black Pepper, Mirch Masala, Hing Jeera, Nimbu Mirchi Pudina)",
    benefits: ["Multiple Flavors", "Value for Money", "Vacuum Packed"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 320,
  },
  {
    name: "Flavour Roasted Peanut Variety Combo Pack",
    slug: "flavour-roasted-peanut-variety-combo-pack",
    category: "Kitchen Essentials",
    shortDescription: "Jumbo variety pack of flavored peanuts for the whole family.",
    description:
      "Our largest variety pack — a full 1.4 Kg of assorted flavored roasted peanuts. Perfect for large families, offices, and events. The best value way to enjoy all our signature flavors. Vacuum packed in convenient portions.",
    images: [IMG.combo, IMG.flavoredPeanuts],
    price: 800,
    salePrice: 750,
    variants: [{ label: "1.4 Kg", value: "1.4kg" }],
    weight: "1.4 Kg",
    inStock: false,
    stockQuantity: 0,
    rating: 4.7,
    reviewCount: 35,
    tags: ["combo", "family-pack", "value", "peanuts"],
    ingredients: "Assorted Flavored Roasted Peanuts (4 Variants)",
    benefits: ["Best Bulk Value", "1.4 Kg Total", "Family Size", "Vacuum Packed"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 180,
  },
  {
    name: "Haldi Roasted Chana (Turmeric Chickpeas with skin)",
    slug: "haldi-roasted-chana-with-skin",
    category: "Flavored Chana",
    shortDescription: "Golden turmeric roasted chana with skin — healthy and flavorful.",
    description:
      "Roasted whole chana with skin, seasoned with pure turmeric (haldi). The turmeric adds a beautiful golden color and earthy flavor while providing natural anti-inflammatory benefits. A healthy, protein-rich snack loved by all ages.",
    images: [IMG.flavoredChana, IMG.chanaHusk],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 50,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 98,
    tags: ["turmeric", "haldi", "healthy", "chana"],
    ingredients: "Roasted Whole Chana (with skin), Turmeric, Salt, Spices",
    benefits: ["Anti-Inflammatory Turmeric", "High in Protein", "Rich in Fiber", "Immunity Booster"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 890,
  },
  {
    name: "Haldi Roasted Whole Chana (Turmeric Chickpeas Without Husk)",
    slug: "haldi-roasted-whole-chana-without-husk",
    category: "Flavored Chana",
    shortDescription: "Husk-free turmeric roasted chana — smoother texture, same goodness.",
    description:
      "Premium husk-free roasted chana seasoned with golden turmeric. Without the husk for a smoother, easier-to-chew texture. All the health benefits of turmeric in a delicious, protein-rich snack. Vacuum packed for freshness.",
    images: [IMG.chanaPlain, IMG.flavoredChana],
    price: 200,
    salePrice: 200,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 48,
    rating: 4.4,
    reviewCount: 67,
    tags: ["turmeric", "haldi", "husk-free", "chana"],
    ingredients: "Roasted Whole Chana (without husk), Turmeric, Salt, Spices",
    benefits: ["Husk-Free Smooth Texture", "Turmeric Benefits", "Protein-Rich", "Easy to Digest"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 540,
  },
  {
    name: "Hing Jeera Roasted Chana",
    slug: "hing-jeera-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Asafoetida and cumin seasoned roasted chana — traditional flavor.",
    description:
      "Roasted whole chana seasoned with hing (asafoetida) and jeera (cumin) — a classic Indian flavor combination. The hing aids digestion while cumin adds a warm, earthy aroma. A traditional, gut-friendly snack.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "320G Pack of 2 (2 X 160 G)", value: "320g-2pack" }],
    weight: "320G Pack of 2",
    inStock: false,
    stockQuantity: 0,
    rating: 4.6,
    reviewCount: 82,
    tags: ["hing", "jeera", "traditional", "chana"],
    ingredients: "Roasted Whole Chana, Asafoetida (Hing), Cumin (Jeera), Salt, Spices",
    benefits: ["Aids Digestion", "Traditional Flavor", "Protein-Rich", "Gut-Friendly"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 720,
  },
  {
    name: "Hing Jeera Roasted Peanuts",
    slug: "hing-jeera-roasted-peanuts",
    category: "Flavored Peanuts",
    shortDescription: "Hing-jeera flavored roasted peanuts — aromatic and digestive.",
    description:
      "Premium peanuts roasted and seasoned with hing and jeera. The aromatic blend creates a uniquely Indian flavor profile that's both delicious and digestive-friendly. Perfect with evening chai.",
    images: [IMG.flavoredPeanuts, IMG.peanutsSalted],
    price: 150,
    salePrice: 150,
    variants: [{ label: "Pack of 2 280 G (2 X 140 G)", value: "280g-2pack" }],
    weight: "Pack of 2 280G",
    inStock: true,
    stockQuantity: 35,
    rating: 4.5,
    reviewCount: 71,
    tags: ["hing", "jeera", "peanuts", "digestive"],
    ingredients: "Roasted Peanuts, Asafoetida (Hing), Cumin (Jeera), Salt, Spices",
    benefits: ["Aids Digestion", "Aromatic Flavor", "Protein-Rich"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 610,
  },
  {
    name: "Khari Sing Premium Roasted Salted Peanuts",
    slug: "khari-sing-premium-roasted-salted-peanuts",
    category: "Roasted Peanuts",
    shortDescription: "Gujarat's famous Khari Sing — extra-crispy, extra-satisfying.",
    description:
      "Gujarat's famous Jumbo Khari Sing — premium roasted salted peanuts with the red husk on. Traditionally roasted for that signature extra-crispy, extra-satisfying crunch. A legendary snack from the land of snacks. Vacuum packed for peak freshness.",
    images: [IMG.peanutsHusk, IMG.peanutsSalted],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: false,
    stockQuantity: 0,
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 312,
    tags: ["khari-sing", "gujarat", "jumbo", "peanuts", "bestseller"],
    ingredients: "Premium Roasted Peanuts (with husk), Salt",
    benefits: ["Gujarat's Famous Snack", "Extra Crispy", "Premium Quality", "Traditionally Roasted"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 3120,
  },
  {
    name: "Mexican Chipotle Roasted Chana",
    slug: "mexican-chipotle-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Smoky Mexican chipotle flavored roasted chana — bold & zesty.",
    description:
      "A fusion twist — roasted chana seasoned with smoky Mexican chipotle seasoning. The smoky heat of chipotle combined with the crunch of chana makes for an unforgettable snack. Perfect for the adventurous palate.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "300G Pack of 2 (2 X 150 G)", value: "300g-2pack" }],
    weight: "300G Pack of 2",
    inStock: false,
    stockQuantity: 0,
    isNew: true,
    rating: 4.6,
    reviewCount: 43,
    tags: ["mexican", "chipotle", "smoky", "chana", "fusion"],
    ingredients: "Roasted Whole Chana, Chipotle Seasoning, Smoked Paprika, Salt, Spices",
    benefits: ["Bold Fusion Flavor", "Smoky & Spicy", "Protein-Rich"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 290,
  },
  {
    name: "Mirch Masala Roasted Chana",
    slug: "mirch-masala-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Spicy mirch masala roasted chana — bold Indian spice blend.",
    description:
      "Roasted whole chana tossed in a fiery mirch (chili) masala blend. A bold, spicy snack for those who love heat. The traditional Indian spice mix creates a complex, layered flavor. Vacuum packed for freshness.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "300G Pack of 2 (2 X 150 G)", value: "300g-2pack" }],
    weight: "300G Pack of 2",
    inStock: true,
    stockQuantity: 40,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 104,
    tags: ["spicy", "mirch", "masala", "chana"],
    ingredients: "Roasted Whole Chana, Red Chili, Mixed Spices, Salt, Edible Oil",
    benefits: ["Bold Spicy Flavor", "High Protein", "Traditional Masala"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 980,
  },
  {
    name: "Mirch Masala Roasted Peanuts",
    slug: "mirch-masala-roasted-peanuts",
    category: "Flavored Peanuts",
    shortDescription: "Spicy mirch masala peanuts — bold and crunchy.",
    description:
      "Premium peanuts roasted and coated with a spicy mirch masala blend. Bold, fiery and irresistible. A favorite tea-time snack across India. Vacuum packed for lasting crunch.",
    images: [IMG.flavoredPeanuts, IMG.peanutsSalted],
    price: 150,
    salePrice: 150,
    variants: [{ label: "Pack of 2 280 G (2 X 140 G)", value: "280g-2pack" }],
    weight: "Pack of 2 280G",
    inStock: true,
    stockQuantity: 33,
    rating: 4.5,
    reviewCount: 86,
    tags: ["spicy", "mirch", "masala", "peanuts"],
    ingredients: "Roasted Peanuts, Red Chili, Mixed Spices, Salt",
    benefits: ["Bold Spicy Flavor", "Protein-Rich", "Energy Snack"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 740,
  },
  {
    name: "Nimbu Mirchi Pudina Roasted Chana",
    slug: "nimbu-mirchi-pudina-roasted-chana",
    category: "Flavored Chana",
    shortDescription: "Lemon-chili-mint chana — refreshing and zesty.",
    description:
      "Roasted chana seasoned with a refreshing blend of nimbu (lemon), mirchi (chili) and pudina (mint). A tangy, spicy and cooling flavor profile all in one. A unique, refreshing snack perfect for summers.",
    images: [IMG.flavoredChana, IMG.chanaPlain],
    price: 200,
    salePrice: 195,
    variants: [{ label: "320G Pack of 2 (2 X 160 G)", value: "320g-2pack" }],
    weight: "320G Pack of 2",
    inStock: false,
    stockQuantity: 0,
    isNew: true,
    rating: 4.7,
    reviewCount: 59,
    tags: ["lemon", "mint", "chili", "refreshing", "chana"],
    ingredients: "Roasted Whole Chana, Lemon, Chili, Mint, Salt, Spices, Citric Acid",
    benefits: ["Refreshing Flavor", "Cooling Mint", "Tangy & Spicy", "Protein-Rich"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 430,
  },
  {
    name: "Nimbu Mirchi Pudina Roasted Peanuts",
    slug: "nimbu-mirchi-pudina-roasted-peanuts",
    category: "Flavored Peanuts",
    shortDescription: "Zesty lemon-chili-mint peanuts — refreshing crunch.",
    description:
      "Peanuts roasted with a zesty blend of lemon, chili and mint. The refreshing mint balances the spicy chili and tangy lemon perfectly. A unique flavor combination that's both refreshing and satisfying.",
    images: [IMG.flavoredPeanuts, IMG.peanutsSalted],
    price: 150,
    salePrice: 150,
    variants: [{ label: "280G", value: "280g" }],
    weight: "280G",
    inStock: true,
    stockQuantity: 37,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 73,
    tags: ["lemon", "mint", "chili", "peanuts"],
    ingredients: "Roasted Peanuts, Lemon, Chili, Mint, Salt, Spices",
    benefits: ["Refreshing Flavor", "Cooling Mint", "Protein-Rich"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 520,
  },
  {
    name: "Peanut Plus Khari Sing Traditionally Roasted Salted Jumbo Peanuts",
    slug: "peanut-plus-khari-sing-traditionally-roasted",
    category: "Roasted Peanuts",
    shortDescription: "Jumbo Khari Sing — premium traditionally roasted salted peanuts.",
    description:
      "Our premium Peanut Plus range — Jumbo Khari Sing traditionally roasted with salt. Bigger, crunchier peanuts with the husk on, roasted the traditional way for unmatched flavor and crunch. Available in single and triple packs for extra value.",
    images: [IMG.peanutsHusk, IMG.peanutsSalted],
    price: 200,
    salePrice: 195,
    variants: [
      { label: "360 G", value: "360g", price: 195 },
      { label: "1.08 Kg Pack of 03 (03 X 360 G)", value: "1.08kg-3pack", price: 549 },
    ],
    weight: "360G",
    inStock: true,
    stockQuantity: 55,
    isBestseller: true,
    isDealOfDay: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 268,
    tags: ["jumbo", "khari-sing", "premium", "bestseller", "peanuts"],
    ingredients: "Premium Jumbo Roasted Peanuts (with husk), Salt",
    benefits: ["Jumbo Size", "Premium Quality", "Traditionally Roasted", "Best Value in 3-Pack"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 2890,
  },
  {
    name: "Peanut Plus Light Roasted Whole Peanut Unsalted",
    slug: "peanut-plus-light-roasted-whole-peanut-unsalted",
    category: "Roasted Peanuts",
    shortDescription: "Lightly roasted unsalted whole peanuts — versatile & natural.",
    description:
      "Peanut Plus range — lightly roasted whole peanuts without salt. A gentler roast preserves the natural sweetness and nutrients. Perfect for healthy snacking, cooking, or making your own peanut butter. 100% natural.",
    images: [IMG.peanutsSalted, IMG.peanutsDark],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 44,
    rating: 4.5,
    reviewCount: 91,
    tags: ["light-roast", "unsalted", "natural", "peanuts"],
    ingredients: "100% Lightly Roasted Whole Peanuts",
    benefits: ["No Added Salt", "Light Roast Preserves Nutrients", "Versatile for Cooking", "100% Natural"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 760,
  },
  {
    name: "Peanut Plus Salted Roasted Peanuts",
    slug: "peanut-plus-salted-roasted-peanuts",
    category: "Roasted Peanuts",
    shortDescription: "Premium salted roasted peanuts — the everyday favorite.",
    description:
      "Peanut Plus range — premium salted roasted peanuts. Perfectly roasted with just the right amount of salt for that classic, satisfying flavor. The everyday favorite snack, vacuum packed for freshness.",
    images: [IMG.peanutsSalted, IMG.peanutsHusk],
    price: 200,
    salePrice: 195,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 52,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 156,
    tags: ["salted", "premium", "peanuts"],
    ingredients: "Premium Roasted Peanuts, Salt",
    benefits: ["Premium Quality", "Perfectly Salted", "High in Protein", "Everyday Snack"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place.",
    soldCount: 1450,
  },
  {
    name: "Plain Roasted Whole Chana (Desi Chickpeas Without Husk)",
    slug: "plain-roasted-whole-chana",
    category: "Roasted Chana",
    shortDescription: "Pure roasted desi chana without husk — simple, healthy, crunchy.",
    description:
      "Premium desi chickpeas roasted to golden perfection without husk and without any seasoning. A pure, natural, protein-rich snack. The classic sattu-grade chana, perfect for snacking, grinding into sattu flour, or using in recipes. 100% natural, no additives.",
    images: [IMG.chanaPlain, IMG.flavoredChana],
    price: 200,
    salePrice: 200,
    variants: [{ label: "Pack of 1 360 G", value: "360g-1pack" }],
    weight: "360G",
    inStock: true,
    stockQuantity: 58,
    isFeatured: true,
    isBestseller: true,
    rating: 4.6,
    reviewCount: 178,
    tags: ["plain", "natural", "desi", "chana", "sattu"],
    ingredients: "100% Roasted Whole Chana (Desi Chickpeas, without husk)",
    benefits: ["100% Natural", "Highest Protein", "No Additives", "Great for Sattu", "Rich in Fiber"],
    shelfLife: "6 Months",
    storageInfo: "Store in a cool, dry place in an airtight container.",
    soldCount: 1980,
  },
];

const CATEGORIES = [
  { name: "Roasted Peanuts", slug: "roasted-peanuts", description: "Traditionally roasted premium peanuts — salted, unsalted, jumbo & more.", color: "#fef3c7", icon: "🥜", image: IMG.peanutsSalted, order: 1 },
  { name: "Roasted Chana", slug: "roasted-chana", description: "Golden roasted desi chana (chickpeas) — plain, with husk, and unsalted.", color: "#fed7aa", icon: "🫘", image: IMG.chanaPlain, order: 2 },
  { name: "Flavored Peanuts", slug: "flavored-peanuts", description: "Peanuts in exciting flavors — black pepper, mirch masala, hing jeera & more.", color: "#fecaca", icon: "🌶️", image: IMG.flavoredPeanuts, order: 3 },
  { name: "Flavored Chana", slug: "flavored-chana", description: "Chana in bold flavors — chili garlic, haldi, Mexican chipotle, chatpata & more.", color: "#fde68a", icon: "✨", image: IMG.flavoredChana, order: 4 },
  { name: "Kitchen Essentials", slug: "kitchen-essentials", description: "Variety combo packs and kitchen essentials for the whole family.", color: "#d9f99d", icon: "📦", image: IMG.combo, order: 5 },
];

const SAMPLE_REVIEWS = [
  { name: "Rajesh Kumar", rating: 5, title: "Amazing quality!", comment: "The crunch and freshness is unmatched. Will definitely order again. Best chana I've had in years!" },
  { name: "Priya Sharma", rating: 5, title: "Perfect snack", comment: "Loved the flavor and packaging. Vacuum sealed so it stays fresh for long. Highly recommend." },
  { name: "Amit Patel", rating: 4, title: "Good value", comment: "Quality is good, slightly pricey but worth it. The jumbo peanuts are really crunchy." },
  { name: "Sneha Reddy", rating: 5, title: "Family favorite", comment: "My kids love the flavored chana. Healthy and tasty alternative to junk food." },
  { name: "Mohammed Irfan", rating: 5, title: "Authentic taste", comment: "Tastes just like the traditional roasted snacks from my childhood. Pure quality." },
  { name: "Lakshmi Nair", rating: 4, title: "Fresh and crunchy", comment: "Delivery was quick and the product was fresh. The packaging is excellent." },
  { name: "Vikram Singh", rating: 5, title: "Excellent service", comment: "Ordered multiple times now. Consistent quality and fast delivery. Trusted brand." },
  { name: "Anjali Gupta", rating: 5, title: "Best peanuts ever", comment: "The Khari Sing is the best! Extra crispy and perfectly salted. My go-to snack." },
];

async function seed() {
  console.log("🌱 Seeding database...");

  console.log("  → Saving settings...");
  await saveSettings(DEFAULT_SETTINGS);

  console.log("  → Creating admin user...");
  await ensureAdminUser();

  console.log("  → Seeding categories...");
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        image: cat.image,
        order: cat.order,
      },
      create: cat,
    });
  }

  console.log("  → Seeding products...");
  for (const p of PRODUCTS) {
    const category = await db.category.findUnique({ where: { slug: slugify(p.category) } });
    if (!category) {
      console.warn(`  ⚠️  Category not found for ${p.name}: ${p.category}`);
      continue;
    }
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId: category.id,
        images: JSON.stringify(p.images),
        price: p.price,
        salePrice: p.salePrice ?? null,
        variants: JSON.stringify(p.variants),
        weight: p.weight,
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        isFeatured: p.isFeatured ?? false,
        isDealOfDay: p.isDealOfDay ?? false,
        isBestseller: p.isBestseller ?? false,
        isNew: p.isNew ?? false,
        rating: p.rating,
        reviewCount: p.reviewCount,
        tags: p.tags.join(","),
        ingredients: p.ingredients,
        benefits: JSON.stringify(p.benefits),
        shelfLife: p.shelfLife,
        storageInfo: p.storageInfo,
        soldCount: p.soldCount,
      },
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        categoryId: category.id,
        images: JSON.stringify(p.images),
        price: p.price,
        salePrice: p.salePrice ?? null,
        variants: JSON.stringify(p.variants),
        weight: p.weight,
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        isFeatured: p.isFeatured ?? false,
        isDealOfDay: p.isDealOfDay ?? false,
        isBestseller: p.isBestseller ?? false,
        isNew: p.isNew ?? false,
        rating: p.rating,
        reviewCount: p.reviewCount,
        tags: p.tags.join(","),
        ingredients: p.ingredients,
        benefits: JSON.stringify(p.benefits),
        shelfLife: p.shelfLife,
        storageInfo: p.storageInfo,
        soldCount: p.soldCount,
      },
    });
  }

  const existingReviews = await db.review.count();
  if (existingReviews === 0) {
    console.log("  → Seeding sample reviews...");
    const products = await db.product.findMany({ select: { id: true } });
    for (const product of products) {
      const numReviews = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numReviews; i++) {
        const review = SAMPLE_REVIEWS[Math.floor(Math.random() * SAMPLE_REVIEWS.length)];
        await db.review.create({
          data: {
            productId: product.id,
            customerName: review.name,
            email: "customer@example.com",
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verified: true,
            approved: true,
          },
        });
      }
    }
  }

  const existingCoupons = await db.coupon.count();
  if (existingCoupons === 0) {
    console.log("  → Seeding coupons...");
    await db.coupon.createMany({
      data: [
        { code: "WELCOME10", description: "10% off your first order", type: "PERCENTAGE", value: 10, minOrder: 199, maxDiscount: 100, usageLimit: 1000 },
        { code: "FLAT50", description: "₹50 off on orders above ₹499", type: "FLAT", value: 50, minOrder: 499, usageLimit: 500 },
        { code: "SAVE15", description: "15% off on orders above ₹999", type: "PERCENTAGE", value: 15, minOrder: 999, maxDiscount: 200, usageLimit: 300 },
        { code: "FREESHIP", description: "Free shipping on any order", type: "FLAT", value: 49, minOrder: 0, usageLimit: 1000 },
      ],
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   - ${CATEGORIES.length} categories`);
  console.log(`   - ${PRODUCTS.length} products`);
  console.log(`   - Admin: ${process.env.ADMIN_EMAIL || "admin@satnamsinghchana.com"}`);
  console.log(`   - Coupons: WELCOME10, FLAT50, SAVE15, FREESHIP`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
