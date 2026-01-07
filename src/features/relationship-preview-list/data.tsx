import type { Option } from "@/core/types";

export type Product = {
  brand_name: string;
  product_name: string;
  all_ingredients: string[];
  product_images: string;
};

export type NodeType = "ingredient" | "product";
export type Node = {
  label: string;
  id: string;
  hasChildren: boolean;
};

// Cache for the loaded data
let PRODUCT_INGREDIENT_CACHE: Product[] | null = null;
let PRODUCT_INGREDIENT_LOADING: Promise<Product[]> | null = null;

// Load data from public folder
async function loadProductData(): Promise<Product[]> {
  // Return cached data if available
  if (PRODUCT_INGREDIENT_CACHE) {
    return PRODUCT_INGREDIENT_CACHE;
  }

  // Return existing promise if already loading
  if (PRODUCT_INGREDIENT_LOADING) {
    return PRODUCT_INGREDIENT_LOADING;
  }

  // Start loading
  PRODUCT_INGREDIENT_LOADING = fetch("/data/cleaned-data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      PRODUCT_INGREDIENT_CACHE = data as Product[];
      PRODUCT_INGREDIENT_LOADING = null;
      return PRODUCT_INGREDIENT_CACHE;
    })
    .catch((error) => {
      PRODUCT_INGREDIENT_LOADING = null;
      console.error("Error loading product data:", error);
      throw error;
    });

  return PRODUCT_INGREDIENT_LOADING;
}

export async function fetchData(): Promise<Product[]> {
  return loadProductData();
}

export async function autocompleteIngredient(query: string): Promise<Option[]> {
  const products = await fetchData();
  const ingredientSet = new Set<string>();

  // Collect all ingredients from all products
  products?.forEach((product: Product) => {
    product.all_ingredients.forEach((ingredient: string) => {
      if (ingredient && typeof ingredient === "string") {
        ingredientSet.add(ingredient);
      }
    });
  });

  // Filter by query (case-insensitive substring match)
  const matched = Array.from(ingredientSet).filter(
    (ingredient) =>
      ingredient &&
      typeof ingredient === "string" &&
      ingredient.toLowerCase().includes(query.toLowerCase()),
  );

  // Map to desired format
  const result: Option[] = matched.map((ingredient) => ({
    label: ingredient,
    value: ingredient,
    hasChildren: true, // since it's found in the dataset
  }));

  return result;
}

export const fetchProductsByIngredient = async (
  ingredientId: string,
): Promise<Node[]> => {
  await new Promise((res) => setTimeout(res, 300));
  const PRODUCT_INGREDIENT = await loadProductData();

  // Debug: Check the data structure
  console.log("🚀 ~ fetchProductsByIngredient ~ ingredientId:", ingredientId);
  console.log(
    "🚀 ~ fetchProductsByIngredient ~ PRODUCT_INGREDIENT length:",
    PRODUCT_INGREDIENT.length,
  );

  // Check first product's ingredients
  if (PRODUCT_INGREDIENT.length > 0) {
    console.log(
      "🚀 ~ first product ingredients:",
      PRODUCT_INGREDIENT[0].all_ingredients,
    );
    console.log(
      "🚀 ~ first product ingredients types:",
      PRODUCT_INGREDIENT[0].all_ingredients.map((ing) => typeof ing),
    );
  }

  const response = PRODUCT_INGREDIENT.filter((product) => {
    if (!product.all_ingredients || !Array.isArray(product.all_ingredients)) {
      return false;
    }
    return product.all_ingredients.some((ing) => {
      if (!ing || typeof ing !== "string") {
        return false;
      }
      return ing.toLowerCase() === ingredientId.toLowerCase();
    });
  }).map((product) => ({
    id: product.product_name,
    label: product.product_name,
    hasChildren: !!product.all_ingredients.length,
  }));
  console.log("🚀 ~ response  fetchProductsByIngredient:", response);
  return response;
};

export const fetchIngredientsByProduct = async (
  productId: string,
): Promise<Node[]> => {
  await new Promise((res) => setTimeout(res, 300));
  const PRODUCT_INGREDIENT = await loadProductData();
  const product = PRODUCT_INGREDIENT.find(
    (p) => p.product_name.toLowerCase() === productId.toLowerCase(),
  );
  const response =
    product?.all_ingredients
      .filter((ingredient) => ingredient && typeof ingredient === "string")
      .map((ingredient) => {
        const hasChildren = PRODUCT_INGREDIENT.some((prod) =>
          prod.all_ingredients.includes(ingredient),
        );
        return { id: ingredient, label: ingredient, hasChildren };
      }) ?? [];
  console.log("🚀 ~ response ~ fetchIngredientsByProduct:", response);
  return response;
};
