import React from "react";
import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/data-table";
import { createSimpleFetcher } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { apiGetCompanyLocationProducts } from "@/modules/panel/services/http/company.service";
import { columns } from "./data";
import { NavLink } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

// Create fetcher for server-side data
const fetcher = (companyId: string, locationId: string) =>
  createSimpleFetcher(
    (params) => apiGetCompanyLocationProducts(companyId, locationId, params),
    {
      dataPath: "data.items",
      totalPath: "data.total",
      filterMapping: {
        status: "status",
        category: "category",
        brand: "brand",
        tag: "tag",
      },
    },
  );

const CompanyLocationProductsList: React.FC = () => {
  const { companyId, locationId } = useParams<{
    companyId: string;
    locationId: string;
  }>();

  if (!companyId || !locationId) {
    return (
      <PageContent
        header={{
          title: "Products",
          description:
            "Company ID and Location ID are required to view products.",
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

  return (
    <PageContent
      header={{
        title: "Location Products",
        description: "Manage products for this company location.",
        actions: (
          <Button color={"primary"} asChild>
            <NavLink
              to={PANEL_ROUTES.COMPANY_LOCATION.PRODUCT_CREATE(
                companyId,
                locationId,
              )}
            >
              Add Product
            </NavLink>
          </Button>
        ),
      }}
    >
      <DataTable
        columns={columns}
        isServerSide
        fetcher={fetcher(companyId, locationId)()}
        queryKeyPrefix={`company-location-products-${companyId}-${locationId}`}
        actionProps={(tableState) => ({
          children: (
            <StatusFilter
              tableState={tableState}
              module="product"
              multi={false} // Single selection mode
            />
          ),
        })}
      />
    </PageContent>
  );
};

export default CompanyLocationProductsList;
