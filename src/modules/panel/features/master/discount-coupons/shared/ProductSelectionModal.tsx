import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Badge } from "@/core/components/ui/badge";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGetProductsForDropdown } from "@/modules/panel/services/http/product.service";

interface ProductVariant {
  variantId: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  attributes?: {
    productAttribute: {
      _id: string;
      name: string;
      slug: string;
    };
    productAttributeValue: {
      _id: string;
      label: string;
      value: string;
      colorCode?: string | null;
    };
  };
}

interface Product {
  _id: string;
  productName: string;
  image?: string;
  images?: string[];
  productImage?: string;
  variants?: ProductVariant[];
  price?: number;
  mrp?: number;
}

interface SelectedProduct {
  productId: string;
  variantIds: string[];
  productName: string;
  variants: ProductVariant[];
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedProducts: SelectedProduct[]) => void;
  selectedProducts: SelectedProduct[];
  title?: string;
  subtitle?: string;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedProducts,
  title = "All Products",
  subtitle = "Select products or variants to add."
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedProducts, setLocalSelectedProducts] = useState<SelectedProduct[]>(selectedProducts);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Fetch products
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ["products-for-selection", { search: searchTerm }],
    queryFn: () => apiGetProductsForDropdown({
      search: searchTerm,
      limit: 50
    }),
    enabled: isOpen,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: Product[] = (productsResponse as any)?.data?.products || [];
  
  // Debug products and variants
  console.log("🔍 Products with variants:", products.map(p => ({
    name: p.productName,
    variants: p.variants,
    hasVariants: !!p.variants?.length,
    variantStructure: p.variants?.map(v => ({ id: v.variantId, label: v.attributes?.productAttributeValue?.label, keys: Object.keys(v) }))
  })));

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedProducts(selectedProducts);
    }
  }, [isOpen, selectedProducts]);

  const toggleProductSelection = (product: Product | string) => {
    const productObj = typeof product === "string" ? products.find(p => p._id === product) : product;
    if (!productObj) return;
    setLocalSelectedProducts(prev => {
      const existingIndex = prev.findIndex(p => p.productId === productObj._id);
      
      if (existingIndex >= 0) {
        // Remove product
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add product with all variants selected
        const newProduct: SelectedProduct = {
          productId: productObj._id,
          variantIds: productObj.variants?.map(v => v.variantId) || [],
          productName: productObj.productName,
          variants: productObj.variants || []
        };
        return [...prev, newProduct];
      }
    });
  };

  const toggleVariantSelection = (productId: string, variantId: string) => {
    console.log("🔧 Toggling variant selection:", { productId, variantId });
    console.log("🔍 Current localSelectedProducts:", localSelectedProducts);
    
    setLocalSelectedProducts(prev => {
      console.log("🔍 Previous state:", prev);
      const productIndex = prev.findIndex(p => p.productId === productId);
      console.log("🔍 Product index:", productIndex);
      
      if (productIndex >= 0) {
        const product = prev[productIndex];
        console.log("🔍 Found product:", product);
        const variantIndex = product.variantIds.indexOf(variantId);
        console.log("🔍 Variant index:", variantIndex);
        
        let newVariantIds;
        if (variantIndex >= 0) {
          // Remove variant
          newVariantIds = product.variantIds.filter(id => id !== variantId);
          console.log("🗑️ Removing variant:", variantId, "New variant IDs:", newVariantIds);
        } else {
          // Add variant
          newVariantIds = [...product.variantIds, variantId];
          console.log("➕ Adding variant:", variantId, "New variant IDs:", newVariantIds);
        }

        // If no variants selected, remove the product
        if (newVariantIds.length === 0) {
          console.log("🗑️ No variants left, removing product");
          const filtered = prev.filter((_, index) => index !== productIndex);
          console.log("🔍 After removing product:", filtered);
          return filtered;
        }

        // Update product with new variant selection
        const updatedProduct = { ...product, variantIds: newVariantIds };
        console.log("✅ Updated product variants:", updatedProduct);
        const updated = prev.map((p, index) => index === productIndex ? updatedProduct : p);
        console.log("🔍 After updating product:", updated);
        return updated;
      } else {
        // Product not selected yet, add it with this variant
        console.log("➕ Product not selected, adding with variant");
        const product = products.find(p => p._id === productId);
        console.log("🔍 Found product in products list:", product);
        if (product) {
          const newProduct: SelectedProduct = {
            productId: product._id,
            variantIds: [variantId],
            productName: product.productName,
            variants: product.variants || []
          };
          console.log("🔍 New product to add:", newProduct);
          const updated = [...prev, newProduct];
          console.log("🔍 After adding new product:", updated);
          return updated;
        }
      }
      
      console.log("🔍 No changes made, returning previous state");
      return prev;
    });
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const isProductSelected = (productId: string) => {
    return localSelectedProducts.some(p => p.productId === productId);
  };

  const isVariantSelected = (productId: string, variantId: string) => {
    const product = localSelectedProducts.find(p => p.productId === productId);
    const isSelected = product?.variantIds.includes(variantId) || false;
    console.log("🔍 Checking variant selection:", { productId, variantId, isSelected, product });
    return isSelected;
  };

  const getSelectedVariantCount = (productId: string) => {
    const product = localSelectedProducts.find(p => p.productId === productId);
    return product?.variantIds.length || 0;
  };

  const handleConfirm = () => {
    onConfirm(localSelectedProducts);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex-shrink-0 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search in all products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No products found</div>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {(() => {
                        const imageUrl = product.image || product.productImage || (product.images && product.images[0]);
                        const fullImageUrl = imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `https://api.skintruth.in${imageUrl}`) : null;
                        
                        return fullImageUrl ? (
                          <img
                            src={fullImageUrl}
                            alt={product.productName}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null;
                      })()}
                      <div className="text-xs text-gray-400 hidden">No Image</div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm leading-tight mb-2">
                          {product.productName}
                        </h3>
                        
                        {/* Product-level selection */}
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            checked={isProductSelected(product._id)}
                            onCheckedChange={() => toggleProductSelection(product)}
                          />
                          <span className="text-sm text-muted-foreground">
                            Select all variants
                          </span>
                          {getSelectedVariantCount(product._id) > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {getSelectedVariantCount(product._id)} selected
                            </Badge>
                          )}
                        </div>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleProductExpansion(product._id)}
                              className="h-6 px-2 text-xs"
                            >
                              {expandedProducts.has(product._id) ? "Hide" : "Show"} variants ({product.variants.length})
                            </Button>
                            
                            {expandedProducts.has(product._id) && (
                              <div className="space-y-2 pl-4">
                                {product.variants.map((variant) => {
                                  console.log("🔍 Mapping variant:", { variant, variantId: variant.variantId, productId: product._id });
                                  return (
                                  <div key={variant.variantId} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={isVariantSelected(product._id, variant.variantId)}
                                        onCheckedChange={(checked) => {
                                          console.log("🔧 Checkbox changed:", { productId: product._id, variantId: variant.variantId, checked });
                                          toggleVariantSelection(product._id, variant.variantId);
                                        }}
                                      />
                                      <span className="text-sm">
                                        {variant.attributes?.productAttributeValue?.label || `Variant ${variant.variantId.slice(-4)}`}
                                        {variant.attributes?.productAttribute?.name && ` - ${variant.attributes.productAttribute.name}`}
                                      </span>
                                    </div>
                                    <div className="text-sm font-medium">
                                      {formatPrice(variant.price)}
                                      {variant.salePrice && variant.salePrice > 0 && variant.salePrice !== variant.price && (
                                        <span className="text-muted-foreground line-through ml-2">
                                          {formatPrice(variant.salePrice)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Single product without variants */}
                        {(!product.variants || product.variants.length === 0) && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={isProductSelected(product._id)}
                                onCheckedChange={(checked) => {
                                  console.log("🔧 Product checkbox changed:", { productId: product._id, checked });
                                  toggleProductSelection(product._id);
                                }}
                              />
                              <span className="text-sm text-muted-foreground">Select product</span>
                            </div>
                            <div className="text-sm font-medium">
                              {formatPrice(product.price || 0)}
                              {product.mrp && product.mrp > (product.price || 0) && (
                                <span className="text-muted-foreground line-through ml-2">
                                  {formatPrice(product.mrp)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {localSelectedProducts.length} product{localSelectedProducts.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex space-x-2">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
