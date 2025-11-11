import {
  DataView,
  useDataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import {
  FilterDataItem,
  type FilterOption,
} from "@/core/components/dynamic-filter";
import { PageContent } from "@/core/components/ui/structure";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { formatDate } from "@/core/utils/date";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import type { Order } from "@/modules/panel/types/order.type";
import type { PaginationParams } from "@/core/types";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  DEFAULT_PAGE_SIZE,
  FILTER_KEYS,
  StatusFilter,
  CompanyFilter,
  BrandFilter,
} from "@/modules/panel/components/data-view";

// Constants
const PAYMENT_METHOD_FILTER_KEY = FILTER_KEYS.PAYMENT_METHOD;

// Common payment methods
const PAYMENT_METHODS: FilterOption[] = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "UPI", value: "upi" },
  { label: "Wallet", value: "wallet" },
  { label: "Net Banking", value: "netbanking" },
  { label: "COD", value: "cod" },
];

type OrderFilters = {
  status: FilterOption[];
  company: FilterOption[];
  brand: FilterOption[];
  paymentMethod: FilterOption[];
};

// Order fetcher for DataView component
const createOrderFetcher = (): ServerDataFetcher<Order> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    filters,
    signal,
  }) => {
    const params: PaginationParams = {
      page: pageIndex + 1, // API uses 1-based pagination
      limit: pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.order = sorting[0].desc ? "desc" : "asc";
    }

    // Map filters to API params
    if (filters.status?.[0]?.value) {
      params.status = filters.status[0].value;
    }
    if (filters.company?.[0]?.value) {
      params.companyId = filters.company[0].value;
    }
    if (filters.brand?.[0]?.value) {
      params.brandId = filters.brand[0].value;
    }
    if (filters.paymentMethod?.[0]?.value) {
      params.paymentMethod = filters.paymentMethod[0].value;
    }

    const response = await apiGetOrderList(params, signal);

    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data as {
        orders?: Order[];
        totalRecords?: number;
      };
      return {
        rows: responseData?.orders || [],
        total: responseData?.totalRecords || 0,
      };
    }

    return { rows: [], total: 0 };
  };
};

// Filter components
const OrderFilters = () => {
  const { filters } = useDataView<Order>();
  const selectedCompanyId = filters?.company?.[0]?.value;

  return (
    <>
      <StatusFilter module="order" />
      <CompanyFilter />
      <BrandFilter selectedCompanyId={selectedCompanyId} />
      <FilterDataItem
        dataKey={PAYMENT_METHOD_FILTER_KEY}
        type="dropdown"
        mode="single"
        options={PAYMENT_METHODS}
        placeholder="Select payment method..."
      />
    </>
  );
};

// Columns definition
const getColumns = (
  handleViewOrder: (id: string) => void,
  handleDeleteOrder: (id: string) => void,
) => [
  {
    header: "Order Number",
    accessorKey: "orderNumber",
    cell: ({ row }: { row: { original: Order } }) => (
      <div className="text-gray-900">{row.original.orderNumber}</div>
    ),
  },
  {
    header: "Customer",
    accessorKey: "fullName",
    cell: ({ row }: { row: { original: Order } }) => {
      const fullName = row.original.fullName;
      return (
        <div>
          <div className="text-gray-900">{fullName || "N/A"}</div>
        </div>
      );
    },
  },
  {
    header: "Brand",
    accessorKey: "brand",
    cell: ({ row }: { row: { original: Order } }) => {
      const brand = row.original.brand;
      return (
        <div className="text-sm text-gray-900">{brand?.name || "N/A"}</div>
      );
    },
  },
  {
    header: "Amount",
    accessorKey: "totalAmount",
    cell: ({ row }: { row: { original: Order } }) => {
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
    cell: ({ row }: { row: { original: Order } }) => {
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
    cell: ({ row }: { row: { original: Order } }) => {
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
    cell: ({ row }: { row: { original: Order } }) => {
      const date = row.original.createdAt;
      return (
        <div className="text-sm text-gray-500">
          {date ? formatDate(date) : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Order } }) => {
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
];

// Main component
const OrderList = () => {
  const navigate = useNavigate();
  const orderFetcher = useMemo(() => createOrderFetcher(), []);

  const handleViewOrder = useCallback(
    (id: string) => {
      navigate(PANEL_ROUTES.ORDER.VIEW(id));
    },
    [navigate],
  );

  const handleDeleteOrder = useCallback((id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
      // TODO: Implement actual delete API call here
      console.log("Delete order:", id);
    }
  }, []);

  const columns = useMemo(
    () => getColumns(handleViewOrder, handleDeleteOrder),
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
        <DataView<Order>
          fetcher={orderFetcher}
          columns={columns}
          defaultViewMode="table"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          enableUrlSync={false}
          queryKeyPrefix={PANEL_ROUTES.ORDER.LIST}
          searchPlaceholder="Search orders..."
          filters={<OrderFilters />}
        />
      </div>
    </PageContent>
  );
};

export default OrderList;
