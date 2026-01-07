import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { PageContent } from "@/core/components/ui/structure";
import { formatNumber } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { hasAccess } from "@/modules/auth/components/guard";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import {
  apiGetCompanyUsers,
  type CompanyUsersParams,
} from "@/modules/panel/services/http/company.service";
import {
  PlusIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { columns } from "./data";

// Create fetcher for server-side data
const fetcher = (companyId: string) =>
  createSimpleFetcher(
    (params: CompanyUsersParams) => apiGetCompanyUsers(companyId, params),
    {
      dataPath: "data.items",
      totalPath: "data.total",
      filterMapping: {
        search: "search",
        status: "status",
        roleId: "roleId",
        locationId: "locationId",
        brandId: "brandId",
      },
    },
  );

// Stats interface
interface UserStats {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const SellerUsersList: React.FC = () => {
  const navigate = useNavigate();
  const { id: companyId } = useParams();
  const { role, permissions } = useAuth();

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    roleId: "",
    locationId: "",
    brandId: "",
  });

  // Stats state
  const [stats, setStats] = useState<UserStats[]>([]);

  // Check if companyId is available
  if (!companyId) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600">Company ID not found in URL</p>
          </div>
        </div>
      </PageContent>
    );
  }

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiGetCompanyUsers(companyId, {});
      const users = response.data.items || [];

      const activeUsers = users.filter(
        (user) => user.status === "active",
      ).length;
      const inactiveUsers = users.filter(
        (user) => user.status === "inactive",
      ).length;
      const totalUsers = users.length;

      setStats([
        {
          title: "Total Users",
          value: totalUsers,
          icon: <UserGroupIcon className="h-5 w-5" />,
          color: "text-blue-600",
        },
        {
          title: "Active Users",
          value: activeUsers,
          icon: <CheckCircleIcon className="h-5 w-5" />,
          color: "text-green-600",
        },
        {
          title: "Inactive Users",
          value: inactiveUsers,
          icon: <XCircleIcon className="h-5 w-5" />,
          color: "text-red-600",
        },
      ]);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      roleId: "",
      locationId: "",
      brandId: "",
    });
  };

  // Check permissions
  const canCreate = hasAccess({
    userRole: role,
    userPermissions: permissions,
    page: "USERS",
    actions: ["CREATE"],
  });
  const canView = hasAccess({
    userRole: role,
    userPermissions: permissions,
    page: "USERS",
    actions: ["VIEW"],
  });

  if (!canView) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600">
              You don't have permission to view users
            </p>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Users</h1>
            <p className="text-gray-600">Manage users for your company</p>
          </div>
          {canCreate && (
            <Button
              onClick={() => navigate(SELLER_ROUTES.USERS.CREATE(companyId))}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add User
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg bg-gray-50 p-2`}>
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                  options={[]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <Select
                  value={filters.roleId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, roleId: value }))
                  }
                  options={[]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    {/* TODO: Populate from roles API */}
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="seller-member">Seller Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Location
                </label>
                <Select
                  value={filters.locationId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, locationId: value }))
                  }
                  options={[]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {/* TODO: Populate from company locations API */}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Brand
                </label>
                <Select
                  value={filters.brandId}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, brandId: value }))
                  }
                  options={[]}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Brands</SelectItem>
                    {/* TODO: Populate from company brands API */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex justify-end">
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              fetcher={fetcher(companyId)}
              columns={columns}
              isServerSide={true}
            />
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default SellerUsersList;
