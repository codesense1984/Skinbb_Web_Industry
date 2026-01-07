import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import ProductForm from "../components/product-form/ProductForm";
import { apiCreateProduct } from "../services/product.service";
import type { ProductFormSchema, ProductReqData } from "../types/product.types";

const ProductCreate = () => {
  const navigate = useNavigate();

  const setBackendErrorRef = useRef<((errors: any[]) => void) | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values: ProductReqData) => {
    console.log("Submitted values", values);
    setIsSubmitting(true);

    try {
      const result = await apiCreateProduct(values);

      toast.success(result.message || "Product created successfully!");

      // Navigate back to products list or wherever appropriate
      navigate("/panel/products");
    } catch (error) {
      console.error("Failed to create product:", error);

      // Handle backend field-level errors
      if (setBackendErrorRef.current && error?.response?.data?.errors) {
        setBackendErrorRef.current(error.response.data.errors);
        return;
      }

      // Show general error message
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues: ProductFormSchema = {
    productName: "",
    slug: "",
    description: "",
    status: { label: "Draft", value: "draft" },
    productVariationType: {
      value: "685a4f3f2d20439677a5e89d",
      label: "Simple product",
    },
    brand: null,
    aboutTheBrand: "",
    productCategory: null,
    tags: null,
    marketedBy: null,
    marketedByAddress: "",
    manufacturedBy: null,
    manufacturedByAddress: "",
    importedBy: null,
    importedByAddress: "",
    capturedBy: null,
    capturedDate: new Date(),
    ingredients: null,
    keyIngredients: null,
    benefit: null,
    thumbnail: [],
    images: [],
    barcodeImage: [],
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    price: "",
    salePrice: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    metaData: [],
    attributes: [],
    variants: [],
    removeAttributes: [],
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
        <p className="text-gray-600">Add a new product to your inventory</p>
      </div>

      <ProductForm
        newProduct
        setBackendErrorRef={setBackendErrorRef}
        defaultValues={defaultValues}
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
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </ProductForm>
    </div>
  );
};

export default ProductCreate;
