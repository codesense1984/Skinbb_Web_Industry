import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import ProductForm from "../components/product-form/ProductForm";
import {
  apiUpdateProduct,
  apiGetProductById,
} from "../services/product.service";
import type { ProductFormSchema, ProductReqData } from "../types/product.types";
import { transformApiResponseToFormData } from "../utils/product.utils";

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const setBackendErrorRef = useRef<((errors: any[]) => void) | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormSchema | null>(null);

  // Fetch product data for editing
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => apiGetProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (productData) {
      const transformedData = transformApiResponseToFormData(productData);
      setFormData(transformedData);
    }
  }, [productData]);

  const handleFormSubmit = async (values: ProductReqData) => {
    if (!id) return;

    console.log("Submitted values", values);
    setIsSubmitting(true);

    try {
      const result = await apiUpdateProduct(id, values);

      toast.success(result.message || "Product updated successfully!");

      // Navigate back to products list or wherever appropriate
      navigate("/panel/products");
    } catch (error) {
      console.error("Failed to update product:", error);

      // Handle backend field-level errors
      if (setBackendErrorRef.current && error?.response?.data?.errors) {
        setBackendErrorRef.current(error.response.data.errors);
        return;
      }

      // Show general error message
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
            Failed to load product details
          </p>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!productData || !formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">No product data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600">Update product information</p>
      </div>

      <ProductForm
        setBackendErrorRef={setBackendErrorRef}
        defaultValues={formData}
        onFormSubmit={handleFormSubmit}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/panel/products")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </ProductForm>
    </div>
  );
};

export default ProductEdit;
