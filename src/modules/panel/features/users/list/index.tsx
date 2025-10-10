import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate, formatNumber } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyUsers, type CompanyUsersParams } from "@/modules/panel/services/http/company.service";
import { PlusIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { columns } from "./data";

// Create fetcher for server-side data
const fetcher = (companyId: string) =>
  createSimpleFetcher((params: CompanyUsersParams) => apiGetCompanyUsers(companyId, params), {
    dataPath: "data.items",
    totalPath: "data.total",
    filterMapping: {
      search: "search",
      status: "status",
      roleId: "roleId",
      locationId: "locationId",
      brandId: "brandId",
    },
  });

// Stats interface
interface UserStats {
  title: string;
  value: number;
  barColor: string;
  icon: boolean;
}

const UserList = () => {
  const navigate = useNavigate();
  const { id: companyId } = useParams();
  const { permissions } = useAuth();
  const [stats, setStats] = useState<UserStats[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    roleId: "",
    locationId: "",
    brandId: "",
    dateRange: "",
  });

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Company Users",
          description: "Company ID is required to view users.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company ID provided.</p>
        </div>
      </PageContent>
    );
  }

  // Fetch stats separately since we need them for the summary cards
  const fetchStats = useCallback(async () => {
    try {
      console.log("Fetching user stats...");
      const response = await apiGetCompanyUsers(companyId, { page: 1, limit: 1000 }); // Get all for stats
      console.log("User stats response:", response);

      if (response.success) {
        const totalUsers = response.data.total;
        const activeUsers = response.data.items.filter(user => user.isActive).length;
        const inactiveUsers = response.data.items.filter(user => !user.isActive).length;

        // Calculate new users this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newThisMonth = response.data.items.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
        }).length;

        setStats([
          {
            title: "Total Users",
            value: totalUsers,
            barColor: "bg-primary",
            icon: true,
          },
          {
            title: "Active Users",
            value: activeUsers,
            barColor: "bg-green-500",
            icon: false,
          },
          {
            title: "Inactive Users",
            value: inactiveUsers,
            barColor: "bg-red-500",
            icon: false,
          },
          {
            title: "New This Month",
            value: newThisMonth,
            barColor: "bg-blue-500",
            icon: true,
          },
        ]);
      } else {
        console.error("API response not successful:", response);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      roleId: "",
      locationId: "",
      brandId: "",
      dateRange: "",
    });
  };

  return (
    <PageContent
      header={{
        title: "Users",
        description: "Manage and view seller member information and analytics.",
        actions: (
          <Button onClick={() => navigate(PANEL_ROUTES.USER.CREATE)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add User
          </Button>
        ),
      }}
    >
      <div className="space-y-6">
        {/* User Statistics */}
        <section
          className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
          aria-label="User Statistics"
        >
          {stats.map((item) => (
            <Card key={item.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </p>
                    <p className="text-2xl font-bold">{formatNumber(item.value)}</p>
                  </div>
                  <div className={`rounded-full p-2 ${item.barColor}`}>
                    {item.icon ? (
                      <UserGroupIcon className="h-4 w-4 text-white" />
                    ) : item.title === "Active Users" ? (
                      <CheckCircleIcon className="h-4 w-4 text-white" />
                    ) : item.title === "Inactive Users" ? (
                      <XCircleIcon className="h-4 w-4 text-white" />
                    ) : (
                      <CalendarIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={filters.roleId}
                  onValueChange={(value) => handleFilterChange("roleId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="seller-member">Seller Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) => handleFilterChange("locationId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    {/* TODO: Add location options from API */}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select
                  value={filters.brandId}
                  onValueChange={(value) => handleFilterChange("brandId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All brands</SelectItem>
                    {/* TODO: Add brand options from API */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mr-2"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable
          columns={columns()}
          isServerSide
          fetcher={fetcher(companyId)}
          queryKeyPrefix={PANEL_ROUTES.COMPANY.USERS(companyId)}
        />
      </div>
    </PageContent>
  );
};

export default UserList;
