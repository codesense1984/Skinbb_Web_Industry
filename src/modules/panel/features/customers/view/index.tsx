import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { apiGetCustomerById } from "@/modules/panel/services/http/customer.service";
import { apiGetOrderList } from "@/modules/panel/services/http/order.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { User, Package, Activity, ArrowLeft, Sparkles, FileText, Wallet } from "lucide-react";
import { DataView, type ServerDataFetcher } from "@/core/components/data-view";
import type { Order } from "@/modules/panel/types/order.type";
import type { PaginationParams } from "@/core/types";
import { formatCurrency, formatDate } from "@/core/utils";
import { StatusBadge } from "@/core/components/ui/badge";
import { TableAction } from "@/core/components/data-table/components/table-action";
import { DEFAULT_PAGE_SIZE } from "@/modules/panel/components/data-view";
import { ComingSoon } from "@/core/components/ui/coming-soon";

type TabType = "profile" | "routines" | "surveys" | "wallet" | "orders";

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { id: "profile", label: "My Profile", icon: <User className="h-5 w-5" /> },
  { id: "routines", label: "Routines", icon: <Sparkles className="h-5 w-5" /> },
  { id: "surveys", label: "Survey Participations", icon: <FileText className="h-5 w-5" /> },
  { id: "wallet", label: "Wallet", icon: <Wallet className="h-5 w-5" /> },
  { id: "orders", label: "Orders", icon: <Package className="h-5 w-5" /> },
];

// Create order fetcher for customer orders
const createCustomerOrderFetcher = (customerId: string): ServerDataFetcher<Order> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    signal,
  }) => {
    const params: PaginationParams = {
      page: pageIndex + 1,
      limit: pageSize,
      customerId, // Always filter by customer
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.order = sorting[0].desc ? "desc" : "asc";
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

// Order columns for customer orders tab
const getOrderColumns = (handleViewOrder: (id: string) => void) => [
  {
    header: "Order Number",
    accessorKey: "orderNumber",
    cell: ({ row }: { row: { original: Order } }) => (
      <div className="text-gray-900">{row.original.orderNumber}</div>
    ),
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
        />
      );
    },
  },
];

// Info field component
const InfoField = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base text-gray-900">{value || "N/A"}</p>
  </div>
);

const CustomerView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const {
    data: customerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => apiGetCustomerById(id!),
    enabled: !!id,
  });

  const handleViewOrder = (orderId: string) => {
    navigate(PANEL_ROUTES.ORDER.VIEW(orderId));
  };

  const orderFetcher = React.useMemo(
    () => (id ? createCustomerOrderFetcher(id) : null),
    [id],
  );

  const orderColumns = React.useMemo(
    () => getOrderColumns(handleViewOrder),
    [handleViewOrder],
  );

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Please wait while we load customer data.",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading customer data...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !customerData?.data) {
    return (
      <PageContent
        header={{
          title: "Customer Not Found",
          description: "The customer you're looking for doesn't exist.",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Customer not found</p>
            <Button onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}>
              Back to Customers
            </Button>
          </div>
        </div>
      </PageContent>
    );
  }

  const customer = customerData.data;
  const roleLabel = customer.role || "Customer";

  return (
    <PageContent
      header={{
        title: "Customer Details",
        description: "View and manage customer information",
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.CUSTOMER.EDIT(customer._id))}
            >
              Edit Customer
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </div>
        ),
      }}
    >
      <div className="flex gap-6">
        {/* Left Sidebar - Tab Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-6 flex items-center gap-4 border-b pb-4">
              <Avatar className="size-16 border-2 border-gray-200">
                <AvatarImage
                  src={customer.profilePic?.url}
                  alt={`${customer.name || "Customer"} profile`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-100">
                  <User className="size-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {customer.name || "Customer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {customer.email || customer.phoneNumber || "No contact info"}
                </p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border bg-gray-50 p-4 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">Total Order Value</p>
                    <p className="text-xl font-bold text-gray-900 break-words overflow-hidden">
                      {formatCurrency(customer.totalSpent || 0, {
                        useAbbreviation: false,
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.totalOrders || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(customer.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">City</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.city || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <InfoField label="Full Name" value={customer.name} />
                    <InfoField label="Role" value={roleLabel} />
                    <InfoField label="Email" value={customer.email} />
                    <InfoField label="Phone No" value={customer.phoneNumber} />
                    <InfoField label="City" value={customer.city} />
                    <InfoField label="Joined Date" value={formatDate(customer.createdAt)} />
                  </div>
                </div>

                {/* Address Information - Placeholder for future */}
                {customer.city && (
                  <div className="space-y-4 border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Address Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <InfoField label="City" value={customer.city} />
                      <InfoField label="State" value="N/A" />
                      <InfoField label="Country" value="N/A" />
                      <InfoField label="Postal Code" value="N/A" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Routines Tab */}
            {activeTab === "routines" && (
              <div>
                <ComingSoon title="Routines" description="Customer routines will be displayed here" />
              </div>
            )}

            {/* Surveys Tab */}
            {activeTab === "surveys" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Survey Participations
                </h2>
                <ComingSoon title="My Surveys" description="Customer survey participations will be displayed here" />
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Wallet
                  </h2>
                  <div className="rounded-lg border bg-gray-50 p-6 mb-6">
                    <p className="text-sm text-gray-500 mb-2">Wallet Balance</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(0, { useAbbreviation: false })}
                    </p>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <Button variant="outlined">Add</Button>
                    <Button variant="outlined">Withdraw</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Last Transaction
                  </h3>
                  <ComingSoon title="Transaction History" description="Wallet transaction history will be displayed here" />
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && orderFetcher && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer Orders
                </h2>
                <DataView<Order>
                  fetcher={orderFetcher}
                  columns={orderColumns}
                  defaultViewMode="table"
                  defaultPageSize={DEFAULT_PAGE_SIZE}
                  enableUrlSync={false}
                  queryKeyPrefix={`customer-orders-${id}`}
                  searchPlaceholder="Search orders..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default CustomerView;
