import React from "react";
import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import ProductCreate from "@/modules/panel/features/listing/ProductCreate";

const CompanyLocationProductCreate: React.FC = () => {
  const { companyId, locationId } = useParams<{
    companyId: string;
    locationId: string;
  }>();

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Create Product",
          description:
            "Company ID and Location ID are required to create a product.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company or location ID provided.
          </p>
        </div>
      </PageContent>
    );
  }

  return <ProductCreate />;
};

export default CompanyLocationProductCreate;
