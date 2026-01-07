import React from "react";
import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import ProductForm from "@/modules/panel/features/products/components/product-form/ProductForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type {
  ProductReqData,
  ProductFormSchema,
} from "@/modules/panel/features/products/types/product.types";
import { normalizeAxiosError } from "@/core/services/http";
import { apiGetCompanyLocationProductById } from "@/modules/panel/services/http/company.service";
import { transformApiResponseToFormData } from "@/modules/panel/features/products/utils/product.utils";

const CompanyLocationProductEdit: React.FC = () => {
  const { companyId, locationId, productId } = useParams<{
    companyId: string;
    locationId: string;
    productId: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch product data
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company-location-product", companyId, locationId, productId],
    queryFn: () =>
      apiGetCompanyLocationProductById(companyId!, locationId!, productId!),
    enabled: !!companyId && !!locationId && !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: ProductReqData) => {
      return api.put(
        ENDPOINTS.COMPANY_LOCATION_PRODUCTS.UPDATE(
          companyId!,
          locationId!,
          productId!,
        ),
        data,
      );
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Product updated successfully!");
      // Invalidate products list and product details
      queryClient.invalidateQueries({
        queryKey: ["company-location-products", companyId, locationId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "company-location-product",
          companyId,
          locationId,
          productId,
        ],
      });
      // Navigate back to product view
      navigate(
        PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(
          companyId!,
          locationId!,
          productId!,
        ),
      );
    },
    onError: (error: any) => {
      toast.error(
        normalizeAxiosError(error)?.message || "Failed to update product",
      );
    },
  });

  const handleFormSubmit = (values: ProductReqData) => {
    updateProductMutation.mutate(values);
  };

  if (!companyId || !locationId || !productId) {
    return (
      <PageContent
        header={{
          title: "Edit Product",
          description:
            "Company ID, Location ID, and Product ID are required to edit a product.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company, location, or product ID provided.
          </p>
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">Loading product information...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !productData?.data) {
    return (
      <PageContent
        header={{
          title: "Edit Product",
          description: "Failed to load product information",
        }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="font-medium text-red-600">
              Failed to load product information
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Please try refreshing the page or contact support.
            </p>
          </div>
        </div>
      </PageContent>
    );
  }

  const product = productData.data;
  const defaultValues: ProductFormSchema =
    transformApiResponseToFormData(product);

  return (
    <PageContent
      header={{
        title: "Edit Product",
        description: `Edit ${product.productName || "Unknown Product"}`,
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(
                  PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(
                    companyId,
                    locationId,
                    productId,
                  ),
                )
              }
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Product
            </Button>
          </div>
        ),
      }}
    >
      <div className="mx-auto max-w-4xl">
        <ProductForm
          onFormSubmit={handleFormSubmit}
          defaultValues={defaultValues}
          newProduct={false}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_VIEW(
                    companyId,
                    locationId,
                    productId,
                  ),
                )
              }
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateProductMutation.isPending
                ? "Updating..."
                : "Update Product"}
            </button>
          </div>
        </ProductForm>
      </div>
    </PageContent>
  );
};

export default CompanyLocationProductEdit;
