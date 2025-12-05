import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { basePythonApiUrl } from "@/core/config/baseUrls";
import { cn } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProductComparisonItem {
  product_name: string | null;
  brand_name: string | null;
  inci: string[];
  benefits: string[];
  claims: string[];
  price: string | null;
  cruelty_free: boolean | null;
  sulphate_free: boolean | null;
  paraben_free: boolean | null;
  vegan: boolean | null;
  organic: boolean | null;
  fragrance_free: boolean | null;
  non_comedogenic: boolean | null;
  hypoallergenic: boolean | null;
  extracted_text?: string | null;
}

interface CompareProductsResponse {
  product1: ProductComparisonItem;
  product2: ProductComparisonItem;
  processing_time: number;
}

const Compare = () => {
  // Get user ID for history
  const { userId } = useAuth();
  
  const [inputMode, setInputMode] = useState<"url" | "inci">("url");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<CompareProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  
  // History sidebar state
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<{
    id: string;
    name: string;
    tag?: string;
    input1: string;
    input2: string;
    input1_type: string;
    input2_type: string;
    comparison_result: CompareProductsResponse;
    created_at: string;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  // API functions for history
  const api = {
    async saveCompareHistory(
      data: {
        name: string;
        tag?: string;
        input1: string;
        input2: string;
        input1_type: string;
        input2_type: string;
        comparison_result: CompareProductsResponse;
      },
      userId: string | undefined
    ): Promise<{ success: boolean; id: string; message: string }> {
      if (!userId) {
        throw new Error("User ID is required to save history");
      }
      const response = await axios.post(
        `${basePythonApiUrl}/api/save-compare-history`,
        data,
        {
          headers: {
            "X-User-Id": userId,
          },
        }
      );
      return response.data;
    },

    async getCompareHistory(
      params?: {
        search?: string;
        limit?: number;
        skip?: number;
      },
      userId?: string
    ): Promise<{ items: Array<{
      id: string;
      name: string;
      tag?: string;
      input1: string;
      input2: string;
      input1_type: string;
      input2_type: string;
      comparison_result: CompareProductsResponse;
      created_at: string;
    }>; total: number }> {
      if (!userId) {
        throw new Error("User ID is required to fetch history");
      }
      const response = await axios.get(
        `${basePythonApiUrl}/api/compare-history`,
        {
          params,
          headers: {
            "X-User-Id": userId,
          },
        }
      );
      return response.data;
    },

    async deleteCompareHistory(
      historyId: string,
      userId: string | undefined
    ): Promise<{ success: boolean; message: string }> {
      if (!userId) {
        throw new Error("User ID is required to delete history");
      }
      const response = await axios.delete(
        `${basePythonApiUrl}/api/compare-history/${historyId}`,
        {
          headers: {
            "X-User-Id": userId,
          },
        }
      );
      return response.data;
    },
  };

  // Load history
  const loadHistory = useCallback(async () => {
    if (!userId) {
      console.warn("User ID not available, cannot load history");
      return;
    }
    setHistoryLoading(true);
    try {
      const result = await api.getCompareHistory(
        {
          search: historySearch || undefined,
          limit: 50,
        },
        userId
      );
      setHistoryItems(result.items);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [historySearch, userId]);

  // Load history on mount and when search changes
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, historySearch, loadHistory]);

  // Load history item into form
  const loadHistoryItem = useCallback((item: {
    id: string;
    name: string;
    tag?: string;
    input1: string;
    input2: string;
    input1_type: string;
    input2_type: string;
    comparison_result: CompareProductsResponse;
    created_at: string;
  }) => {
    // Set input mode (use input1_type as default)
    setInputMode(item.input1_type as "url" | "inci");
    
    // Set inputs
    setInput1(item.input1);
    setInput2(item.input2);
    
    // Set name and tag
    setName(item.name);
    setTag(item.tag || "");
    
    // Restore comparison results
    setComparisonData(item.comparison_result);
    
    // Set current history ID
    setCurrentHistoryId(item.id);
    
    // Close sidebar
    setShowHistory(false);
  }, []);

  // Delete history item
  const deleteHistoryItem = useCallback(async (historyId: string) => {
    if (!userId) {
      window.alert("User ID not available");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this history item?")) {
      return;
    }
    try {
      await api.deleteCompareHistory(historyId, userId);
      loadHistory();
    } catch (error) {
      console.error("Error deleting history:", error);
      window.alert("Failed to delete history item");
    }
  }, [loadHistory, userId]);

  const handleCompare = useCallback(async () => {
    if (!input1.trim() || !input2.trim()) {
      setError("Please enter both inputs");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<CompareProductsResponse>(
        `${basePythonApiUrl}/api/compare-products`,
        {
          input1: input1.trim(),
          input2: input2.trim(),
          input1_type: inputMode,
          input2_type: inputMode,
        },
      );

      setComparisonData(response.data);
      
      // Save to history if name is provided and user is logged in
      if (name.trim() && userId) {
        try {
          const result = await api.saveCompareHistory(
            {
              name: name.trim(),
              tag: tag.trim() || undefined,
              input1: input1.trim(),
              input2: input2.trim(),
              input1_type: inputMode,
              input2_type: inputMode,
              comparison_result: response.data,
            },
            userId
          );
          // Store history ID
          setCurrentHistoryId(result.id);
          // Refresh history if sidebar is open
          if (showHistory) {
            loadHistory();
          }
        } catch (error) {
          console.error("Error saving history:", error);
          // Don't block the user if history save fails
        }
      }
    } catch (error: any) {
      console.error("Error comparing products:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Error comparing products. Please try again.";
      setError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [input1, input2, inputMode, name, tag, userId, showHistory, loadHistory, api]);

  const renderBooleanValue = (value: boolean | null) => {
    if (value === null) {
      return <span className="text-muted-foreground text-sm italic">No info available</span>;
    }
    return value ? (
      <span className="text-green-600 font-semibold text-lg">✓</span>
    ) : (
      <span className="text-red-600 font-semibold text-lg">✗</span>
    );
  };

  const renderListValue = (items: string[]) => {
    if (items.length === 0) {
      return <span className="text-muted-foreground text-sm italic">No info available</span>;
    }
    return (
      <ul className="list-disc list-inside space-y-1 text-sm">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderInciIngredients = (ingredients: string[]) => {
    if (ingredients.length === 0) {
      return <span className="text-muted-foreground text-sm italic">No info available</span>;
    }
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground mb-2">
          Total: {ingredients.length} ingredients
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-[400px] overflow-y-auto p-2 border rounded-md bg-muted/20">
          {ingredients.map((ingredient, idx) => (
            <span
              key={idx}
              className="inline-block px-2.5 py-1 text-xs font-medium bg-background border rounded-md text-foreground hover:bg-muted transition-colors"
              title={ingredient}
            >
              {ingredient}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PageContent
      ariaLabel="compare-formulations"
      header={{
        title: "Compare Products",
        description: "Compare two products by URL or INCI ingredients",
        hasBack: true,
        animate: true,
        actions: (
          <Button
            variant="outlined"
            onClick={() => setShowHistory(!showHistory)}
            type="button"
          >
            {showHistory ? (
              <>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Close
              </>
            ) : (
              "History"
            )}
          </Button>
        ),
      }}
    >
      <div className="w-full relative">
        {/* History Sidebar - Slide in from left */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-80 bg-background border-r shadow-2xl z-40 transform transition-transform duration-300 ease-in-out",
            showHistory ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <h2 className="text-lg font-semibold">Compare History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                aria-label="Close sidebar"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Unified Search */}
            <div className="p-4 border-b">
              <Input
                placeholder="Search by name or tag..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="h-9"
              />
            </div>
            
            {/* History List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {historyLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : historyItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No history found</p>
                    <p className="text-xs mt-1">Your comparison history will appear here</p>
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="flex-1 min-w-0"
                          onClick={() => loadHistoryItem(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              loadHistoryItem(item);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="font-medium text-sm truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground mt-1.5">
                            {item.input1_type === "inci" ? "INCI" : "URL"} vs {item.input2_type === "inci" ? "INCI" : "URL"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {(() => {
                              try {
                                const date = new Date(item.created_at);
                                if (isNaN(date.getTime())) {
                                  return "";
                                }
                                // Show only date (no time)
                                return date.toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric"
                                });
                              } catch {
                                return "";
                              }
                            })()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition-opacity flex-shrink-0"
                          type="button"
                          aria-label="Delete history item"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay when sidebar is open */}
        {showHistory && (
          <div
            className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
            aria-hidden="true"
          />
        )}
        
      <div className="space-y-6">
        {/* Input Mode Selection */}
        <div className="bg-background rounded-lg border p-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setInputMode("url")}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-colors",
                inputMode === "url"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              URL Mode
            </button>
            <button
              onClick={() => setInputMode("inci")}
              className={cn(
                "px-4 py-2 rounded-md font-medium transition-colors",
                inputMode === "inci"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              INCI Mode
            </button>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
          <div className="space-y-2">
              <label htmlFor="input1" className="text-sm font-medium">
                Product 1 ({inputMode === "url" ? "URL" : "INCI"})
            </label>
              {inputMode === "url" ? (
            <Input
                  id="input1"
              type="url"
              placeholder="https://example.com/product1"
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <textarea
                  id="input1"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-y"
                  placeholder="Water, Glycerin, Sodium Hyaluronate, ..."
                  value={input1}
                  onChange={(e) => setInput1(e.target.value)}
              disabled={loading}
            />
              )}
          </div>
          <div className="space-y-2">
              <label htmlFor="input2" className="text-sm font-medium">
                Product 2 ({inputMode === "url" ? "URL" : "INCI"})
            </label>
              {inputMode === "url" ? (
            <Input
                  id="input2"
              type="url"
              placeholder="https://example.com/product2"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                  disabled={loading}
                />
              ) : (
                <textarea
                  id="input2"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-y"
                  placeholder="Water, Glycerin, Hyaluronic Acid, ..."
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
              disabled={loading}
            />
              )}
            </div>
            
            {/* Name and Tag Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="compare-name" className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="compare-name"
                  placeholder="e.g. Serum Comparison"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label htmlFor="compare-tag" className="block text-sm font-medium mb-1">
                  Tag (optional)
                </label>
                <Input
                  id="compare-tag"
                  placeholder="e.g. serums, comparison"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="h-9"
                />
              </div>
          </div>
            
          <Button
            onClick={handleCompare}
              disabled={loading || !input1.trim() || !input2.trim()}
            className="w-full"
          >
              {loading ? "Comparing..." : "Compare Products"}
          </Button>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        {comparisonData && (
          <div className="bg-background rounded-lg border overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Processing time: {comparisonData.processing_time.toFixed(2)}s
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Product Name */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Product Name</td>
                    <td className="p-4 text-center border-r">
                      {comparisonData.product1.product_name || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {comparisonData.product2.product_name || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                  </tr>

                  {/* Brand Name */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Brand Name</td>
                    <td className="p-4 text-center border-r">
                      {comparisonData.product1.brand_name || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {comparisonData.product2.brand_name || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                  </tr>

                  {/* Price */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Price</td>
                    <td className="p-4 text-center border-r">
                      {comparisonData.product1.price || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {comparisonData.product2.price || (
                        <span className="text-muted-foreground text-sm italic">No info available</span>
                      )}
                    </td>
                  </tr>

                  {/* INCI Ingredients */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r align-top">INCI Ingredients</td>
                    <td className="p-4 border-r">
                      {renderInciIngredients(comparisonData.product1.inci)}
                    </td>
                    <td className="p-4">
                      {renderInciIngredients(comparisonData.product2.inci)}
                    </td>
                  </tr>

                  {/* Benefits */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Benefits</td>
                    <td className="p-4 border-r">{renderListValue(comparisonData.product1.benefits)}</td>
                    <td className="p-4">{renderListValue(comparisonData.product2.benefits)}</td>
                  </tr>

                  {/* Claims */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Claims</td>
                    <td className="p-4 border-r">{renderListValue(comparisonData.product1.claims)}</td>
                    <td className="p-4">{renderListValue(comparisonData.product2.claims)}</td>
                  </tr>

                  {/* Cruelty Free */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Cruelty Free</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.cruelty_free)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.cruelty_free)}
                    </td>
                  </tr>

                  {/* Sulphate Free */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Sulphate Free</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.sulphate_free)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.sulphate_free)}
                    </td>
                  </tr>

                  {/* Paraben Free */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Paraben Free</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.paraben_free)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.paraben_free)}
                    </td>
                  </tr>

                  {/* Vegan */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Vegan</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.vegan)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.vegan)}
                    </td>
                  </tr>

                  {/* Organic */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Organic</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.organic)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.organic)}
                    </td>
                  </tr>

                  {/* Fragrance Free */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Fragrance Free</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.fragrance_free)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.fragrance_free)}
                    </td>
                  </tr>

                  {/* Non-Comedogenic */}
                  <tr className="border-b">
                    <td className="p-4 font-medium border-r">Non-Comedogenic</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.non_comedogenic)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.non_comedogenic)}
                    </td>
                  </tr>

                  {/* Hypoallergenic */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium border-r">Hypoallergenic</td>
                    <td className="p-4 text-center border-r">
                      {renderBooleanValue(comparisonData.product1.hypoallergenic)}
                    </td>
                    <td className="p-4 text-center">
                      {renderBooleanValue(comparisonData.product2.hypoallergenic)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </PageContent>
  );
};

export default Compare;
