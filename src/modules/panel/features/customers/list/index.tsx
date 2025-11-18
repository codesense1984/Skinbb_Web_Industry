import {
  DataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { ComingSoon } from "@/core/components/ui/coming-soon";
import { formatNumber } from "@/core/utils";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { columns, statsData } from "./data";
import { CustomerCard } from "./CustomerCard";
import { apiGetCustomers } from "@/modules/panel/services/http/customer.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { DEFAULT_PAGE_SIZE } from "@/modules/panel/components/data-view";
import type { Customer } from "@/modules/panel/types/customer.type";
import type { PaginationParams } from "@/core/types";
import Routines from "../Routines";

// Create fetcher for DataView component
const createCustomerFetcher = (): ServerDataFetcher<Customer> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    filters,
    signal,
  }) => {
    const params: PaginationParams = {
      page: pageIndex + 1,
      limit: pageSize,
    };

    if (globalFilter) {
      params.query = globalFilter;
    }

    if (sorting.length > 0) {
      params.sort = {
        key: sorting[0].id,
        order: sorting[0].desc ? "desc" : "asc",
      };
    }

    const response = await apiGetCustomers(params, signal);

    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data as {
        customers?: Customer[];
        totalRecords?: number;
      };
      return {
        rows: responseData?.customers || [],
        total: responseData?.totalRecords || 0,
      };
    }

    return { rows: [], total: 0 };
  };
};

const CustomerList = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");
  const [stats, setStats] = useState(statsData);
  const customerFetcher = useMemo(() => createCustomerFetcher(), []);

  // Show ComingSoon for segments and reviews views
  if (view === "segments") {
    return <ComingSoon title="Segments" />;
  }
  if (view === "reviews") {
    return <ComingSoon title="Reviews" />;
  }
  if (view === "routines") {
    return <Routines />;
  }

  // Fetch stats separately since we need them for the summary cards
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiGetCustomers({ page: 1, limit: 1000 }); // Get all for stats

      if (response.success) {
        const totalOrders = response.data.customers.reduce(
          (sum, customer) => sum + customer.totalOrders,
          0,
        );
        const totalRevenue = response.data.customers.reduce(
          (sum, customer) => sum + customer.totalSpent,
          0,
        );

        setStats([
          {
            title: "Total Customers",
            value: response.data.totalRecords,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Active Customers",
            value: response.data.customers.filter((c) => c.totalOrders > 0)
              .length,
            barColor: "bg-blue-300",
            icon: false,
          },
          {
            title: "Total Orders",
            value: totalOrders,
            barColor: "bg-violet-300",
            icon: false,
          },
          {
            title: "Total Revenue",
            value: totalRevenue,
            barColor: "bg-red-300",
            icon: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch customer stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <PageContent
      header={{
        title: "Customers",
        description: "Manage and view customer information and analytics.",
        actions: (
          <Button
            onClick={() =>
              (window.location.href = PANEL_ROUTES.CUSTOMER.CREATE)
            }
          >
            Add Customer
          </Button>
        ),
      }}
    >
      <section
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
        aria-label="Customer Statistics"
      >
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataView<Customer>
        fetcher={customerFetcher}
        columns={columns}
        renderCard={(customer) => <CustomerCard customer={customer} />}
        gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        defaultViewMode="table"
        defaultPageSize={DEFAULT_PAGE_SIZE}
        enableUrlSync={false}
        queryKeyPrefix={PANEL_ROUTES.CUSTOMER.LIST}
        searchPlaceholder="Search customers..."
      />
    </PageContent>
  );
};

export default CustomerList;
