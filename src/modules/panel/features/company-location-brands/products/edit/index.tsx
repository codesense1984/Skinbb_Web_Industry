import { PageContent } from "@/core/components/ui/structure";
import { MODE } from "@/core/types";
import ProductCreate from "@/modules/panel/features/listing/ProductCreate";
import React from "react";
import { useParams } from "react-router";

const ProductEditForm: React.FC = () => {
  const { companyId, locationId, productId, brandId } = useParams<{
    companyId: string;
    locationId: string;
    productId: string;
    brandId: string;
  }>();
  // const [searchParams] = useSearchParams();

  // // Set mode to "edit" and pass productId via search params
  // searchParams.set("mode", "edit");
  // searchParams.set("id", productId || "");
  // searchParams.set("companyId", companyId || "");
  // searchParams.set("locationId", locationId || "");
  // Note: brandId is not directly available in useParams for edit,
  // but ProductCreate can derive it or it might be part of the product data.
  // For now, we'll omit passing brandId explicitly if it's not in useParams.

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

  return (
    <ProductCreate
      companyId={companyId}
      locationId={locationId}
      productId={productId} // Pass productId directly as a prop
      brandId={brandId}
      mode={MODE.EDIT} // Explicitly set mode to edit
    />
  );
};

export default ProductEditForm;
