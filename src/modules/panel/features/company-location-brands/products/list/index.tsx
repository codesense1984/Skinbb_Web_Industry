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
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/solid";

// Create fetcher for server-side data
const fetcher = (companyId: string, locationId: string, brandId: string) =>
  createSimpleFetcher(
    (params) => apiGetCompanyLocationProducts(companyId, locationId, {
      ...(params && { params }),
      brand: brandId, // Filter by brand ID
    }),
    {
      dataPath: "data.items",
      totalPath: "data.total",
      filterMapping: {
        status: "status",
        category: "category",
        tag: "tag",
      },
    },
  );

const BrandProductsList: React.FC = () => {
  const { companyId, locationId, brandId } = useParams<{
    companyId: string;
    locationId: string;
    brandId: string;
  }>();

  if (!companyId || !locationId || !brandId) {
    return (
      <PageContent
        header={{
          title: "Brand Products",
          description: "Company ID, Location ID, and Brand ID are required to view products.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company, location, or brand ID provided.</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Brand Products",
        description: "Manage products for this brand",
        actions: (
          <div className="flex gap-2">
            <Button
              asChild
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <NavLink to={PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId)}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Brands
              </NavLink>
            </Button>
            <Button color={"primary"} asChild>
              <NavLink to={PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCT_CREATE(companyId, locationId, brandId)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Product
              </NavLink>
            </Button>
          </div>
        ),
      }}
    >
      <DataTable
        columns={columns(companyId, locationId, brandId)}
        isServerSide
        fetcher={fetcher(companyId, locationId, brandId)}
        queryKeyPrefix={`brand-products-${companyId}-${locationId}-${brandId}`}
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

export default BrandProductsList;
