import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetSellerBrandProducts } from "@/modules/panel/services/http/company.service";
import { PlusIcon } from "@heroicons/react/24/solid";
import React from "react";
import { NavLink, useParams } from "react-router";
import { columns } from "./data";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Create fetcher for server-side data
const fetcher = (companyId: string, brandId: string) =>
  createSimpleFetcher(
    (params) =>
      apiGetSellerBrandProducts(companyId, brandId, {
        ...(params && { ...params }),
      }),
    {
      dataPath: "data.products",
      totalPath: "data.pagination.totalRecords",
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
          description:
            "Company ID, Location ID, and Brand ID are required to view products.",
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
    <PageContent
      header={{
        title: "Brand Products",
        description: "Manage products for this brand",
        actions: (
          <div className="flex gap-2">
            <Button color={"secondary"} asChild>
              <NavLink
                to={PANEL_ROUTES.COMPANY_LOCATION.BRAND_PRODUCT_CREATE(
                  companyId,
                  locationId,
                  brandId,
                )}
              >
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
        fetcher={fetcher(companyId, brandId)}
        queryKeyPrefix={ENDPOINTS.SELLER_BRAND_PRODUCTS.LIST(
          companyId,
          brandId,
        )}
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
