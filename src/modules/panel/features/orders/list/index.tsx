import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { Badge } from "@/core/components/ui/badge";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate } from "@/core/utils";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import type { Order } from "@/modules/panel/types/order.type";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

// Super simple! Just pass the API function and data paths
const fetcher = () =>
  createSimpleFetcher(apiGetOrderList, {
    dataPath: "data.orders",
    totalPath: "data.totalRecords",
  });
const OrderList = () => {
  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        header: "SKU",
        accessorKey: "orderNumber",
        // cell: (props) => (
        //   <span className="font-bold">{props.row.original.orderNumber}</span>
        // ),
      },
      {
        header: "Customer",
        accessorKey: "fullName",
        // cell: (props) => <span>{props.row.original.fullName}</span>,
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        // cell: (props) => <span>₹{props.row.original.totalAmount}</span>,
      },
      {
        header: "Payment",
        accessorKey: "paymentMethod",
        // cell: (props) => <span>{props.row.original.paymentMethod || "-"}</span>,
      },
      {
        header: "Products",
        accessorKey: "totalProduct",
        // cell: (props) => <span>{props.row.original.totalProduct}</span>,
      },
      // "pending", "placed", "shipped", "delivered", "cancelled"
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge
            className={`tag border-gray-100 dark:border-gray-700 ${
              row.original.status === "pending"
                ? "bg-amber-200"
                : row.original.status === "placed"
                  ? "bg-emerald-200"
                  : row.original.status === "shipped"
                    ? "bg-emerald-200"
                    : row.original.status === "delivered"
                      ? "bg-emerald-200"
                      : row.original.status === "cancelled"
                        ? "bg-red-200"
                        : "bg-amber-200"
            } text-gray-900 capitalize dark:text-gray-900`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) => {
          const startDate = row.getValue("createdAt") as string;
          return formatDate(startDate);
        },
      },
    ],
    [],
  );

  return (
    <PageContent
      header={{
        title: "Orders",
        description: "Manage your orders",
      }}
    >
      <DataTable
        columns={columns}
        isServerSide
        fetcher={fetcher()}
        queryKeyPrefix="order-list-table"
      />
    </PageContent>
  );
};

export default OrderList;
