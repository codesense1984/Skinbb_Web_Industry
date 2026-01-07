import React from "react";
import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import ProductCreate from "@/modules/panel/features/listing/ProductCreate";

const BrandProductCreate: React.FC = () => {
  const { companyId, locationId, brandId } = useParams<{
    companyId: string;
    locationId: string;
    brandId: string;
  }>();

  if (!companyId || !locationId || !brandId) {
    return (
      <PageContent
        header={{
          title: "Create Product",
          description:
            "Company ID, Location ID, and Brand ID are required to create a product.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company, location, or brand ID provided.
          </p>
        </div>
      </PageContent>
    );
  }

  return (
    <ProductCreate
      companyId={companyId}
      locationId={locationId}
      brandId={brandId}
    />
  );
};

export default BrandProductCreate;
