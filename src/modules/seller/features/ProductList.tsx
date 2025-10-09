import React from "react";
import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/data-table";
import { createSimpleFetcher } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { apiGetCompanyLocationProducts } from "@/modules/panel/services/http/company.service";
import { columns } from "./ProductListData";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../routes/constant";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";

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

const SellerProductList: React.FC = () => {
  const { companyId, locationId } = useParams<{
    companyId: string;
    locationId: string;
  }>();
  const { sellerInfo, isLoading: sellerLoading, isError: sellerError, getCompanyId, getPrimaryAddress } = useSellerAuth();

  // Get companyId and locationId from params or seller auth
  const finalCompanyId = companyId || getCompanyId();
  const finalLocationId = locationId || getPrimaryAddress()?.addressId;

  if (sellerLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading seller information...</p>
        </div>
      </div>
    );
  }

  if (sellerError || !sellerInfo) {
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
            Failed to load seller information
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!finalCompanyId || !finalLocationId) {
    return (
      <PageContent
        header={{
          title: "Products",
          description: "Company ID and Location ID are required to view products.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or location ID provided.</p>
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
            <NavLink to={SELLER_ROUTES.COMPANY_LOCATION_PRODUCTS.CREATE(finalCompanyId, finalLocationId)}>
              Add Product
            </NavLink>
          </Button>
        ),
      }}
    >
      <DataTable
        columns={columns}
        isServerSide
        fetcher={fetcher(finalCompanyId, finalLocationId)()}
        queryKeyPrefix={`seller-products-${finalCompanyId}-${finalLocationId}`}
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

export default SellerProductList;
