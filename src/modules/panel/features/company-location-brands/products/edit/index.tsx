import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Select } from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { apiGetProductDetail, apiUpdateProduct } from "@/modules/panel/services/http/product.service";
import { apiGetBrandsForDropdown, apiGetCategoriesForDropdown, apiGetTagsForDropdown } from "@/modules/panel/services/http/product.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/solid";
import { FullLoader } from "@/core/components/ui/loader";
import { toast } from "sonner";

interface ProductFormData {
  productName: string;
  slug: string;
  sku: string;
  description: string;
  status: string;
  status_feedback?: string;
  brand: string;
  aboutTheBrand?: string;
  productVariationType: string;
  productCategory: string[];
  tags: string[];
  price: number;
  salePrice?: number;
  quantity: number;
  weight?: string;
  dimensions?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrendingNow: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface DropdownItem {
  _id: string;
  name: string;
}

interface ProductData {
  _id: string;
  productName: string;
  slug: string;
  sku: string;
  description: string;
  status: string;
  status_feedback?: string;
  brand?: {
    _id: string;
    name: string;
  };
  aboutTheBrand?: string;
  productVariationType?: {
    _id: string;
    name: string;
  };
  productCategory?: Array<{
    _id: string;
    name: string;
  }>;
  tags?: Array<{
    _id: string;
    name: string;
  }>;
  price: number;
  salePrice?: number;
  quantity: number;
  weight?: string;
  dimensions?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrendingNow: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}


const ProductEditForm: React.FC = () => {
  const { companyId, locationId, productId } = useParams<{
    companyId: string;
    locationId: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: () => apiGetProductDetail(productId!),
    enabled: !!productId,
  });

  // Fetch dropdown data
  const { data: brandsData } = useQuery({
    queryKey: ["brands-dropdown"],
    queryFn: apiGetBrandsForDropdown,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-dropdown"],
    queryFn: apiGetCategoriesForDropdown,
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags-dropdown"],
    queryFn: apiGetTagsForDropdown,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProductFormData>({
    defaultValues: {
      productName: "",
      slug: "",
      sku: "",
      description: "",
      status: "draft",
      productCategory: [],
      tags: [],
      metaKeywords: [],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isTrendingNow: false,
      price: 0,
      quantity: 0,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => apiUpdateProduct(productId!, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["product-detail", productId] });
      queryClient.invalidateQueries({ queryKey: ["brand-products"] });
      navigate(
        PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(companyId!, locationId!, productId!)
      );
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === "object" && "response" in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to update product";
      toast.error(errorMessage || "Failed to update product");
    },
  });

  useEffect(() => {
    if ((productData as ApiResponse<ProductData>)?.data) {
      const product = (productData as ApiResponse<ProductData>).data;
      reset({
        productName: product.productName || "",
        slug: product.slug || "",
        sku: product.sku || "",
        description: product.description || "",
        status: product.status || "draft",
        status_feedback: product.status_feedback || "",
        brand: product.brand?._id || "",
        aboutTheBrand: product.aboutTheBrand || "",
        productVariationType: product.productVariationType?._id || "",
        productCategory: product.productCategory?.map((cat: { _id: string; name: string }) => cat._id) || [],
        tags: product.tags?.map((tag: { _id: string; name: string }) => tag._id) || [],
        price: product.price || 0,
        salePrice: product.salePrice || 0,
        quantity: product.quantity || 0,
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        manufacturingDate: product.manufacturingDate || "",
        expiryDate: product.expiryDate || "",
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        isTrendingNow: product.isTrendingNow || false,
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        metaKeywords: product.metaKeywords || [],
      });
    }
  }, [productData, reset]);

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  if (!companyId || !locationId || !productId) {
    return (
      <PageContent
        header={{
          title: "Edit Product",
          description: "Company ID, Location ID, and Product ID are required to edit product.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid product ID provided.</p>
        </div>
      </PageContent>
    );
  }

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Edit Product",
          description: "Loading product information...",
        }}
      >
        <div className="flex justify-center py-8">
          <FullLoader />
        </div>
      </PageContent>
    );
  }

  if (error || !(productData as ApiResponse<ProductData>)?.data) {
    return (
      <PageContent
        header={{
          title: "Edit Product",
          description: "Error loading product information.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500">
            {error?.message || "Failed to load product details."}
          </p>
        </div>
      </PageContent>
    );
  }

  const product = (productData as ApiResponse<ProductData>).data;

  return (
    <PageContent
      header={{
        title: `Edit ${product.productName}`,
        description: `SKU: ${product.sku} | ${product.brand?.name || "Unknown Brand"}`,
        actions: (
          <div className="flex gap-2">
            <Button
              asChild
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <button
                onClick={() =>
                  navigate(
                    PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(
                      companyId,
                      locationId,
                      productId
                    )
                  )
                }
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to View
              </button>
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending || !isDirty}
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ),
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="productName" className="text-sm font-medium">Product Name *</label>
                <Controller
                  control={control}
                  name="productName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="productName"
                      placeholder="Enter product name"
                      required
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">Slug *</label>
                <Controller
                  control={control}
                  name="slug"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="slug"
                      placeholder="product-slug"
                      required
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="sku" className="text-sm font-medium">SKU *</label>
                <Controller
                  control={control}
                  name="sku"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sku"
                      placeholder="Enter SKU"
                      required
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "pending", label: "Pending" },
                        { value: "publish", label: "Published" },
                        { value: "rejected", label: "Rejected" }
                      ]}
                      placeholder="Select status"
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Enter product description"
                    rows={4}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status_feedback" className="text-sm font-medium">Status Feedback</label>
              <Controller
                control={control}
                name="status_feedback"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="status_feedback"
                    placeholder="Enter status feedback (optional)"
                    rows={2}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand and Category Information */}
        <Card>
          <CardHeader>
            <CardTitle>Brand and Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium">Brand</label>
                <Controller
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      options={((brandsData as ApiResponse<DropdownItem[]>)?.data || []).map((brand: DropdownItem) => ({
                        value: brand._id,
                        label: brand.name
                      }))}
                      placeholder="Select brand"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="productVariationType" className="text-sm font-medium">Variation Type</label>
                <Controller
                  control={control}
                  name="productVariationType"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="productVariationType"
                      placeholder="Enter variation type"
                    />
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="aboutTheBrand" className="text-sm font-medium">About the Brand</label>
              <Controller
                control={control}
                name="aboutTheBrand"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="aboutTheBrand"
                    placeholder="Enter brand information"
                    rows={3}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="productCategory" className="text-sm font-medium">Categories</label>
              <Controller
                control={control}
                name="productCategory"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {((categoriesData as ApiResponse<DropdownItem[]>)?.data || []).map((category: DropdownItem) => (
                      <label key={category._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value.includes(category._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, category._id]);
                            } else {
                              field.onChange(field.value.filter((id: string) => id !== category._id));
                            }
                          }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {((tagsData as ApiResponse<DropdownItem[]>)?.data || []).map((tag: DropdownItem) => (
                      <label key={tag._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value.includes(tag._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, tag._id]);
                            } else {
                              field.onChange(field.value.filter((id: string) => id !== tag._id));
                            }
                          }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing and Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing and Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price *</label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="salePrice" className="text-sm font-medium">Sale Price</label>
                <Controller
                  control={control}
                  name="salePrice"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="salePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity *</label>
                <Controller
                  control={control}
                  name="quantity"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="quantity"
                      type="number"
                      placeholder="0"
                      required
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">Weight</label>
                <Controller
                  control={control}
                  name="weight"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="weight"
                      placeholder="e.g., 30ml"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dimensions" className="text-sm font-medium">Dimensions</label>
                <Controller
                  control={control}
                  name="dimensions"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="dimensions"
                      placeholder="e.g., 10x5x2 cm"
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="manufacturingDate" className="text-sm font-medium">Manufacturing Date</label>
                <Controller
                  control={control}
                  name="manufacturingDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="manufacturingDate"
                      type="date"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                <Controller
                  control={control}
                  name="expiryDate"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="expiryDate"
                      type="date"
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Product Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium">
                      Featured Product
                    </label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="isNewArrival"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNewArrival"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isNewArrival" className="text-sm font-medium">
                      New Arrival
                    </label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="isBestSeller"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestSeller"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isBestSeller" className="text-sm font-medium">
                      Best Seller
                    </label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="isTrendingNow"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isTrendingNow"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label htmlFor="isTrendingNow" className="text-sm font-medium">
                      Trending Now
                    </label>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Information */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="metaTitle" className="text-sm font-medium">Meta Title</label>
              <Controller
                control={control}
                name="metaTitle"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="metaTitle"
                    placeholder="Enter meta title"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="metaDescription" className="text-sm font-medium">Meta Description</label>
              <Controller
                control={control}
                name="metaDescription"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="metaDescription"
                    placeholder="Enter meta description"
                    rows={3}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="metaKeywords" className="text-sm font-medium">Meta Keywords</label>
              <Controller
                control={control}
                name="metaKeywords"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="metaKeywords"
                    placeholder="Enter keywords separated by commas"
                    value={field.value.join(", ")}
                    onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContent>
  );
};

export default ProductEditForm;