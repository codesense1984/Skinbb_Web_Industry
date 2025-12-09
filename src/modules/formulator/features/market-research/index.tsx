import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { Textarea } from "@/core/components/ui/textarea";
import { Input } from "@/core/components/ui/input";
import { cn } from "@/core/utils";
import {
  LinkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, {
  useCallback,
  useState,
} from "react";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";

// Types
interface MarketResearchProduct {
  id: string;  // Changed from _id to id
  productName?: string;
  brand?: string;
  ingredients: string[];
  image?: string;
  images?: string[];
  price?: number;
  salePrice?: number;
  description?: string;
  matched_ingredients: string[];
  match_count: number;
  total_ingredients: number;
  match_percentage: number;
  [key: string]: any;
}

interface MarketResearchResponse {
  products: MarketResearchProduct[];
  extracted_ingredients: string[];
  total_matched: number;
  processing_time: number;
  input_type: string;
}

interface ExtractUrlResponse {
  ingredients: string[];
  extracted_text: string;
  platform: string;
  url: string;
  processing_time: number;
  is_estimated?: boolean;
  source?: string;
  product_name?: string;
  message?: string;
}

const api = {
  async extractIngredientsFromUrl(req: { url: string }): Promise<ExtractUrlResponse> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/extract-ingredients-from-url`,
      req,
    );
    return response.data;
  },

  async marketResearch(req: {
    url?: string;
    inci?: string;
    name?: string;
    ingredient?: string | string[];
    input_type: "url" | "inci" | "name" | "ingredient";
  }): Promise<MarketResearchResponse> {
    const response = await axios.post(
      `${basePythonApiUrl}/api/market-research`,
      req,
    );
    return response.data;
  },
};

const MarketResearch = () => {
  const [inputMode, setInputMode] = useState<"inci" | "url" | "name" | "ingredient">("inci");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractUrlResponse | null>(null);
  const [results, setResults] = useState<MarketResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract ingredients from URL
  const onExtract = useCallback(async () => {
    if (!url.trim()) return;

    setExtracting(true);
    setExtractedData(null);
    setError(null);
    try {
      const data = await api.extractIngredientsFromUrl({ url: url.trim() });
      setExtractedData(data);
      // Auto-populate the INCI textarea with extracted ingredients
      setText(data.ingredients.join(", "));
    } catch (error: any) {
      console.error("Error extracting ingredients from URL:", error);
      setError(error.response?.data?.detail || "Error extracting ingredients from URL. Please try again.");
    } finally {
      setExtracting(false);
    }
  }, [url]);

  // Perform market research
  const onSearch = useCallback(async () => {
    if (inputMode === "url" && !url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (inputMode === "inci" && !text.trim()) {
      setError("Please enter INCI ingredients");
      return;
    }
    if (inputMode === "name" && !name.trim()) {
      setError("Please enter a product name");
      return;
    }
    if (inputMode === "ingredient" && !text.trim()) {
      setError("Please enter ingredient(s)");
      return;
    }

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const requestData: {
        url?: string;
        inci?: string;
        name?: string;
        ingredient?: string | string[];
        input_type: "url" | "inci" | "name" | "ingredient";
      } = {
        input_type: inputMode,
      };

      if (inputMode === "url") {
        requestData.url = url.trim();
      } else if (inputMode === "inci") {
        requestData.inci = text.trim();
      } else if (inputMode === "name") {
        requestData.name = name.trim();
      } else if (inputMode === "ingredient") {
        // Parse comma-separated ingredients or use as single ingredient
        const ingredientList = text.split(",").map(ing => ing.trim()).filter(ing => ing);
        requestData.ingredient = ingredientList.length > 1 ? ingredientList : ingredientList[0];
      }

      const data = await api.marketResearch(requestData);
      setResults(data);
    } catch (error: any) {
      console.error("Error performing market research:", error);
      setError(error.response?.data?.detail || "Error performing market research. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [inputMode, url, text, name]);

  return (
    <PageContent
      header={{
        title: "Market Research",
        description: "Find products with matching ingredients from our database",
      }}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Search Products</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {inputMode === "inci"
                  ? "Paste the INCI ingredient list"
                  : inputMode === "url"
                  ? "Paste the product page URL to automatically extract ingredients"
                  : inputMode === "name"
                  ? "Enter product name to search"
                  : "Enter ingredient(s) to find matching products"}
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex gap-2 border rounded-lg p-1 bg-muted/50 flex-wrap">
              <button
                type="button"
                onClick={() => setInputMode("inci")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  inputMode === "inci"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                INCI List
              </button>
              <button
                type="button"
                onClick={() => setInputMode("url")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  inputMode === "url"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Product URL
              </button>
              <button
                type="button"
                onClick={() => setInputMode("name")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  inputMode === "name"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Product Name
              </button>
              <button
                type="button"
                onClick={() => setInputMode("ingredient")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  inputMode === "ingredient"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Ingredient
              </button>
            </div>
          </div>

          <div className="relative mt-4">
            {inputMode === "inci" ? (
              <>
                <label htmlFor="inci" className="sr-only">
                  INCI list
                </label>
                <Textarea
                  id="inci"
                  className="min-h-[180px]"
                  placeholder="e.g. Aqua, Glycerin, Decyl Glucoside, 1,2-Hexanediol…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </>
            ) : inputMode === "url" ? (
              <>
                <label htmlFor="url" className="sr-only">
                  Product URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    id="url"
                    type="url"
                    className="pl-10 h-12"
                    placeholder="https://example.com/product/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Supported: Amazon, Nykaa, Flipkart, and other e-commerce product pages
                </p>
              </>
            ) : inputMode === "name" ? (
              <>
                <label htmlFor="name" className="sr-only">
                  Product Name
                </label>
                <Input
                  id="name"
                  type="text"
                  className="h-12"
                  placeholder="e.g. Cetaphil Gentle Cleanser"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Search for products by name (case-insensitive partial match)
                </p>
              </>
            ) : (
              <>
                <label htmlFor="ingredient" className="sr-only">
                  Ingredient(s)
                </label>
                <Textarea
                  id="ingredient"
                  className="min-h-[120px]"
                  placeholder="e.g. Water, Glycerin (comma-separated or one per line)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter one or more ingredients (comma-separated) to find matching products
                </p>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {inputMode === "url" ? (
              <>
                {!extractedData && (
                  <Button
                    variant={"contained"}
                    color={"primary"}
                    type="button"
                    onClick={onExtract}
                    disabled={extracting || loading || !url.trim()}
                  >
                    <LinkIcon className="size-4" />
                    {extracting || loading ? "Extracting…" : "Extract Ingredients"}
                  </Button>
                )}
                {extractedData && (
                  <Button
                    variant={"contained"}
                    color={"primary"}
                    type="button"
                    onClick={onSearch}
                    disabled={loading}
                  >
                    <MagnifyingGlassIcon className="size-4" />
                    {loading ? "Searching…" : "Search Products"}
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant={"contained"}
                color={"primary"}
                type="button"
                onClick={onSearch}
                disabled={loading || (inputMode === "name" ? !name.trim() : !text.trim())}
              >
                <MagnifyingGlassIcon className="size-4" />
                {loading ? "Searching…" : "Search Products"}
              </Button>
            )}
          </div>

          {/* Extracted Data Display */}
          {extractedData && inputMode === "url" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">
                  Extracted Ingredients
                </h3>
                <span className="text-xs text-blue-700">
                  {extractedData.ingredients.length} ingredients found
                </span>
              </div>
              <p className="text-sm text-blue-800">
                {extractedData.ingredients.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Matched Products ({results.total_matched})
              </h2>
              <div className="text-sm text-muted-foreground">
                Processed in {results.processing_time}s
              </div>
            </div>

            {results.products.length === 0 ? (
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  No products found with matching ingredients.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {product.image || (product.images && product.images.length > 0) ? (
                        <img
                          src={product.image || product.images?.[0]}
                          alt={product.productName || "Product"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {/* Match Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          {product.match_percentage.toFixed(0)}% Match
                        </Badge>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3">
                      {/* Product Name & Brand */}
                      <div>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                        )}
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {product.productName || "Unnamed Product"}
                        </h3>
                      </div>

                      {/* Price */}
                      {(product.price || product.salePrice) && (
                        <div className="flex items-center gap-2">
                          {product.salePrice && (
                            <span className="text-lg font-bold text-primary">
                              ₹{product.salePrice}
                            </span>
                          )}
                          {product.price && product.price !== product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Match Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">
                          {product.match_count} / {product.total_ingredients} ingredients match
                        </Badge>
                      </div>

                      {/* Matched Ingredients */}
                      {product.matched_ingredients.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Matched Ingredients:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {product.matched_ingredients.slice(0, 5).map((ing, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ing}
                              </Badge>
                            ))}
                            {product.matched_ingredients.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{product.matched_ingredients.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContent>
  );
};

export default MarketResearch;
