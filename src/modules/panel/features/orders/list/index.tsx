import { useNavigate } from "react-router";
import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import type { Order } from "@/modules/panel/types/order.type";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

// Simple fetcher
const fetcher = () =>
  createSimpleFetcher(apiGetOrderList, {
    dataPath: "data.orders",
    totalPath: "data.totalRecords",
  });

const OrderList = () => {
  const navigate = useNavigate();

  const handleViewOrder = (id: string) => {
    navigate(PANEL_ROUTES.ORDER.VIEW(id));
  };

  const handleDeleteOrder = (id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
      console.log("Delete order:", id);
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
        header: "Customer",
        accessorKey: "fullName",
        cell: ({ row }) => {
          const fullName = row.original.fullName;
          return (
            <div>
              <div className="text-gray-900">{fullName || "N/A"}</div>
            </div>
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

  return (
    <PageContent
      header={{
        title: "Orders",
        description: "Manage and track all customer orders",
      }}
    >
      <div className="w-full">
        <DataTable
          columns={columns}
          isServerSide
          fetcher={fetcher()}
          queryKeyPrefix="order-list-table"
        />
      </div>
    </PageContent>
  );
};

export default OrderList;
