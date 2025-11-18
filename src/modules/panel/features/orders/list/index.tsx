import { TableAction } from "@/core/components/data-table/components/table-action";
import {
  DataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { OrderCard } from "./OrderCard";
import {
  type FilterOption
} from "@/core/components/dynamic-filter";
import { StatusBadge } from "@/core/components/ui/badge";
import { PageContent } from "@/core/components/ui/structure";
import type { PaginationParams } from "@/core/types";
import { formatDate } from "@/core/utils/date";
import { formatCurrency } from "@/core/utils/number";
import {
  BrandFilter,
  CompanyFilter,
  CustomerFilter,
  DEFAULT_PAGE_SIZE,
  FILTER_KEYS,
  StatusFilter,
} from "@/modules/panel/components/data-view";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { useDataView } from "@/core/components/data-view";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import { apiGetCustomerById } from "@/modules/panel/services/http/customer.service";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/modules/panel/types/order.type";
import { useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

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
  customer: FilterOption[];
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
    if (filters.customer?.[0]?.value) {
      params.customerId = filters.customer[0].value;
    }


    const response = await apiGetOrderList(params, signal);

    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data as {
        orders?: Order[];
        totalRecords?: number;
      };
      const orders = responseData?.orders || [];
      
      // Return API response as-is
      // Note: The API should filter by status on the backend, but if it doesn't,
      // we trust the API response. Client-side filtering would only work for the current page,
      // which is not ideal for pagination.
      const result = {
        rows: orders,
        total: responseData?.totalRecords || 0,
      };
      
      return result;
    }

    console.log("❌ Invalid response structure");
    return { rows: [], total: 0 };
  };
};

// Component to handle URL-based customer filter
const CustomerFilterFromUrl = () => {
  const [searchParams] = useSearchParams();
  const { setFilters } = useDataView<Order>();
  const customerId = searchParams.get("customerId");
  const hasSetFilterForCustomerRef = useRef<string | null>(null);
  const lastCustomerNameRef = useRef<string | null>(null);

  // Fetch customer data to get the actual name
  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => apiGetCustomerById(customerId!),
    enabled: !!customerId,
  });

  useEffect(() => {
    if (customerId) {
      // Get customer name from fetched data or use a placeholder
      const customerName = customerData?.data?.name 
        || customerData?.data?.email 
        || customerData?.data?.phoneNumber 
        || "Customer";
      
      // Only set/update filter if:
      // 1. We haven't set it for this customerId yet, OR
      // 2. The customer name has changed (e.g., data just loaded)
      const shouldUpdate = customerId !== hasSetFilterForCustomerRef.current || 
        (customerName !== lastCustomerNameRef.current && hasSetFilterForCustomerRef.current === customerId);
      
      if (shouldUpdate) {
        // Set the customer filter with actual customer name
        const customerFilter: FilterOption[] = [
          {
            label: customerName,
            value: customerId,
          },
        ];
        setFilters({
          customer: customerFilter,
        });
        hasSetFilterForCustomerRef.current = customerId;
        lastCustomerNameRef.current = customerName;
      }
    } else if (!customerId && hasSetFilterForCustomerRef.current) {
      // Clear the filter if customerId is removed from URL
      setFilters({
        customer: [],
      });
      hasSetFilterForCustomerRef.current = null;
      lastCustomerNameRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, customerData?.data]); // Depend on customerId and customerData.data

  return null;
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
      <CustomerFilter />
      {/* <FilterDataItem
        dataKey={PAYMENT_METHOD_FILTER_KEY}
        type="dropdown"
        mode="single"
        options={PAYMENT_METHODS}
        placeholder="Select payment method..."
      /> */}
    </>
  );
};

// Columns definition
const getColumns = () => [
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
      const order = row.original;
      const brandName = order.brandName || order.brand?.name;
      return (
        <div className="text-sm text-gray-900">{brandName || "N/A"}</div>
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
            to: PANEL_ROUTES.ORDER.VIEW(order._id),
            title: "View order details",
          }}
        />
      );
    },
  },
];

// Main component
const OrderList = () => {
  const orderFetcher = useMemo(() => createOrderFetcher(), []);

  const columns = useMemo(() => getColumns(), []);

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
          renderCard={(order) => <OrderCard order={order} />}
          gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
          defaultViewMode="table"
          defaultPageSize={DEFAULT_PAGE_SIZE}
          enableUrlSync={false}
          queryKeyPrefix={PANEL_ROUTES.ORDER.LIST}
          searchPlaceholder="Search orders..."
          filters={
            <>
              <CustomerFilterFromUrl />
              <OrderFilters />
            </>
          }
        />
      </div>
    </PageContent>
  );
};

export default OrderList;
