import { DataTableToogle } from "@/core/components/data-table";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import type { CustomerList as CustomerListProps } from "@/modules/panel/types/customer.type";
import { formatNumber } from "@/core/utils";
import { useCallback, useEffect, useState } from "react";
import { CustomerCard } from "./CustomerCard";
import { columns, statsData } from "./data";
import { apiGetCustomers } from "@/modules/panel/services/http/customer.service";
import type { CustomerListParams } from "@/modules/panel/types/customer.type";

const CustomerList = () => {
  const [customers, setCustomers] = useState<CustomerListProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(statsData);

  const fetchCustomers = useCallback(async (params?: CustomerListParams) => {
    try {
      setLoading(true);
      const response = await apiGetCustomers(params);
      
      if (response.success) {
        setCustomers(response.data.customers);
        
        // Update stats with real data
        const totalOrders = response.data.customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
        const totalRevenue = response.data.customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
        
        setStats([
          {
            title: "Total Customers",
            value: response.data.totalRecords,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Active Customers",
            value: response.data.customers.filter(c => c.totalOrders > 0).length,
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
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers({ page: 1, limit: 10 });
  }, [fetchCustomers]);

  const renderGridItem = useCallback(
    (row: CustomerListProps) => (
      <CustomerCard
        key={row._id}
        customer={row}
        aria-label={`View ${row.name || 'Customer'} card`}
      />
    ),
    [],
  );

  return (
    <PageContent
      header={{
        title: "Customers",
        description: "Manage and view customer information and analytics.",
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

      <DataTableToogle
        rows={customers}
        columns={columns}
        gridProps={{
          renderGridItem,
        }}
        bodyProps={{
          isLoading: loading,
        }}
      />
    </PageContent>
  );
};

export default CustomerList;
