import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/data-table";
import { createSimpleFetcher } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetSellerBrandProducts } from "@/modules/panel/services/http/company.service";
import { apiUpdateProductStatus } from "@/modules/panel/services/http/product.service";
import { columns } from "./data";
import { PlusIcon } from "@heroicons/react/24/solid";
import { ProductApprovalDialog } from "../components/ProductApprovalDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Record<
    string,
    unknown
  > | null>(null);
  const queryClient = useQueryClient();

  // Mutation for product status update
  const productStatusMutation = useMutation({
    mutationFn: async (data: { status: string; reason?: string }) => {
      if (!selectedProduct) throw new Error("No product selected");

      // Map approval status to API status
      const apiStatus = data.status === "approved" ? "publish" : "rejected";

      return apiUpdateProductStatus(selectedProduct._id as string, {
        status: apiStatus,
        reason: data.reason,
        feedback: data.reason, // Use reason as feedback as well
      });
    },
    onSuccess: (_, variables) => {
      const action = variables.status === "approved" ? "approved" : "rejected";
      toast.success(`Product ${action} successfully`);
      queryClient.invalidateQueries({
        queryKey: [`brand-products-${companyId}-${brandId}`],
      });
      setIsApprovalDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update product status";
      toast.error(errorMessage);
    },
  });

  // Handle approval dialog
  const handleApproval = async (data: { status: string; reason?: string }) => {
    try {
      await productStatusMutation.mutateAsync(data);
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  // Listen for approval requests from the data table
  useEffect(() => {
    const handleApprovalRequest = (event: CustomEvent) => {
      setSelectedProduct(event.detail.product);
      setIsApprovalDialogOpen(true);
    };

    window.addEventListener(
      "product-approval-request",
      handleApprovalRequest as EventListener,
    );

    return () => {
      window.removeEventListener(
        "product-approval-request",
        handleApprovalRequest as EventListener,
      );
    };
  }, []);

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

      <ProductApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => {
          setIsApprovalDialogOpen(false);
          setSelectedProduct(null);
        }}
        onApprove={handleApproval}
        productName={selectedProduct?.productName as string | undefined}
        isLoading={productStatusMutation.isPending}
      />
    </PageContent>
  );
};

export default BrandProductsList;
