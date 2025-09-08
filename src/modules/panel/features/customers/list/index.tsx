import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { formatNumber } from "@/core/utils";
import { useCallback, useEffect, useState } from "react";
import { columns, statsData } from "./data";
import { apiGetCustomers } from "@/modules/panel/services/http/customer.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

// Create fetcher for server-side data
const fetcher = () =>
  createSimpleFetcher(apiGetCustomers, {
    dataPath: "data.customers",
    totalPath: "data.totalRecords",
    filterMapping: {
      query: "query",
    },
  });

const CustomerList = () => {
  const [stats, setStats] = useState(statsData);

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
            onClick={() => window.location.href = PANEL_ROUTES.CUSTOMER.CREATE}
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

      <DataTable
        columns={columns}
        isServerSide
        fetcher={fetcher()}
        queryKeyPrefix={PANEL_ROUTES.CUSTOMER.LIST}
      />
    </PageContent>
  );
};

export default CustomerList;
