import { useNavigate } from "react-router";
import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import type { Order } from "@/modules/panel/types/order.type";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SELLER_ROUTES } from "../../routes/constant";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { BrandFilter } from "@/modules/panel/features/listing/components/BrandFilter";
import { SubscriptionGuard } from "../../components/subscription";

// Create fetcher for server-side data with seller's company ID and brand filtering
const createSellerOrderFetcher = (companyId: string, brandId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      // Always filter by seller's company ID
      const filterParams = {
        ...params,
        companyId, // Always include seller's company ID
        ...(brandId && brandId !== "all" && { brandId: brandId }),
      };
      console.log("🔍 Seller Order Filter Params:", filterParams);
      return apiGetOrderList(filterParams);
    },
    {
      dataPath: "data.orders",
      totalPath: "data.totalRecords",
      filterMapping: {
        status: "status",
        paymentMethod: "paymentMethod",
        brand: "brandId",
      },
    },
  );
};

const SellerOrderList = () => {
  const navigate = useNavigate();
  const { sellerInfo } = useSellerAuth();
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");

  const handleViewOrder = (id: string) => {
    navigate(SELLER_ROUTES.ORDERS.VIEW(id));
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
      // Implement actual delete API call here
    }
  };

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        header: "Order Number",
        accessorKey: "orderNumber",
        cell: ({ row }) => (
          <div className="text-gray-900">{row.original.orderNumber}</div>
        ),
      },
      {
        header: "Brand",
        accessorKey: "brand",
        cell: ({ row }) => {
          const brand = row.original.brand;
          return (
            <div className="text-sm text-gray-900">{brand?.name || "N/A"}</div>
          );
        },
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        cell: ({ row }) => {
          const totalAmount = row.original.totalAmount || 0;
          return (
            <div className="text-right">
              <div className="text-gray-900">{formatCurrency(totalAmount)}</div>
            </div>
          );
        },
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        cell: ({ row }) => {
          const payment = row.original.paymentMethod || "N/A";
          return (
            <div className="text-center">
              <div className="text-sm text-gray-900 uppercase">{payment}</div>
            </div>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          const status = row.original.status || "pending";
          return (
            <StatusBadge module="order" status={status} variant="badge">
              {status}
            </StatusBadge>
          );
        },
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="text-sm text-gray-500">
              {date ? new Date(date).toLocaleDateString() : "N/A"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const order = row.original;
          return (
            <TableAction
              view={{
                onClick: () => handleViewOrder(order._id),
                title: "View order details",
              }}
              delete={{
                onClick: () => handleDeleteOrder(order._id),
                title: "Delete order",
              }}
            />
          );
        },
      },
    ],
    [handleViewOrder, handleDeleteOrder],
  );

  // Don't render if seller info is not available
  if (!sellerInfo?.companyId) {
    return (
      <PageContent
        header={{
          title: "Orders",
          description: "Manage and track your customer orders",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading seller information...</p>
        </div>
      </PageContent>
    );
  }

  return (
    <SubscriptionGuard page="orders" action="list" showCreditModalOnLoad={true}>
      <PageContent
        header={{
          title: "Orders",
          description: "Manage and track your customer orders",
        }}
      >
        <div className="w-full">
          <DataTable
            columns={columns}
            isServerSide
            fetcher={createSellerOrderFetcher(
              sellerInfo.companyId,
              selectedBrandId === "all" ? undefined : selectedBrandId,
            )}
            queryKeyPrefix={`seller-order-list-table-${selectedBrandId}`}
            actionProps={() => ({
              children: (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Brand:</span>
                    <BrandFilter
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      placeholder="All Brands"
                      companyId={sellerInfo.companyId}
                    />
                  </div>
                </div>
              ),
            })}
          />
        </div>
      </PageContent>
    </SubscriptionGuard>
  );
};

export default SellerOrderList;
