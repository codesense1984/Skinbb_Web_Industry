import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { DataTable } from "@/core/components/data-table";
import { StatusBadge } from "@/core/components/ui/badge";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { ComboBox } from "@/core/components/ui/combo-box";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/core/components/ui/dialog";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCatalogList, apiApproveCatalog, apiDownloadCatalog, apiRejectCatalog, type CatalogListParams, type CatalogJob, type CatalogApprovalResponse } from "@/modules/panel/services/http/product.service";
import { api } from "@/core/services/http";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useParams, useLocation } from "react-router";
import { Download, CheckCircle, XCircle, Settings } from "lucide-react";
import { toast } from "sonner";

interface CatalogListProps {
  isAdminPanel?: boolean;
}

// Manage Approval Dialog Component
const ManageApprovalDialog = ({ 
  catalogJob, 
  approveMutation, 
  rejectMutation 
}: { 
  catalogJob: CatalogJob;
  approveMutation: UseMutationResult<CatalogApprovalResponse, unknown, { importJobId: string; status: string; reason?: string }, unknown>;
  rejectMutation: UseMutationResult<CatalogApprovalResponse, unknown, { importJobId: string; status: string; reason?: string }, unknown>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"approve" | "reject">("approve");


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog onOpenChange called with:", open);
      if (!open && !approveMutation.isPending && !rejectMutation.isPending) {
        setIsOpen(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => {
            setAction("approve");
            setIsOpen(true);
          }}
          className="h-8 px-2 text-xs"
        >
          <Settings className="h-3 w-3 mr-1" />
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Catalog Approval</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Action</Label>
            <div className="flex gap-2">
              <Button
                variant={action === "approve" ? "contained" : "outlined"}
                size="sm"
                onClick={() => setAction("approve")}
                className="flex-1"
                type="button"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant={action === "reject" ? "contained" : "outlined"}
                size="sm"
                onClick={() => setAction("reject")}
                className="flex-1"
                type="button"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select an action above, then click the button below to confirm
            </p>
          </div>
          
          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outlined"
              onClick={() => setIsOpen(false)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (action === "approve") {
                  approveMutation.mutate({ 
                    importJobId: catalogJob._id, 
                    status: "approved" 
                  }, {
                    onSuccess: () => {
                      setIsOpen(false);
                      setReason("");
                    }
                  });
                } else if (action === "reject" && reason.trim()) {
                  rejectMutation.mutate({ 
                    importJobId: catalogJob._id, 
                    status: "rejected", 
                    reason: reason.trim() 
                  }, {
                    onSuccess: () => {
                      setIsOpen(false);
                      setReason("");
                    }
                  });
                }
              }}
              disabled={
                approveMutation.isPending || 
                rejectMutation.isPending || 
                (action === "reject" && !reason.trim())
              }
              variant="contained"
              className="min-w-[100px]"
              type="button"
            >
              {approveMutation.isPending || rejectMutation.isPending ? (
                "Processing..."
              ) : (
                <>
                  {action === "approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CatalogList: React.FC<CatalogListProps> = ({ isAdminPanel = false }) => {
  const { sellerInfo } = useSellerAuth();
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Determine if this is admin context
  const isAdminContext = isAdminPanel ||
    location.pathname.includes("/panel/") ||
    location.pathname.includes("/admin/") ||
    (user && !sellerInfo);

  // Filter states
  const [filters, setFilters] = useState<CatalogListParams>({
    page: 1,
    limit: 10,
    companyId: isAdminContext ? "" : (params.companyId || sellerInfo?.companyId || ""),
    brandId: isAdminContext ? "" : (params.brandId || ""),
    categoryId: "",
    status: undefined,
    validationStatus: undefined,
    sortBy: "createdAt",
    order: "desc",
  });

  // Create fetchers for dropdowns (admin only)
  const companiesFetcher = createSimpleFetcher(apiGetCompanyList, {
    dataPath: "data.items",
    totalPath: "data.total",
  });

  const createBrandFetcher = (companyId?: string) => {
    return createSimpleFetcher(
      (params: Record<string, unknown>) => {
        const filterParams = {
          ...params,
          ...(companyId && { companyId }),
        };
        return apiGetBrands(filterParams);
      },
      {
        dataPath: "data.brands",
        totalPath: "data.totalRecords",
      }
    );
  };

  const brandsFetcher = createBrandFetcher(filters.companyId);

  // Category API function
  const apiGetCategories = async (params?: { search?: string; limit?: number; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.limit) searchParams.append("limit", params.limit?.toString() || "100");
    if (params?.page) searchParams.append("page", params.page?.toString() || "1");
    
    const queryString = searchParams.toString();
    const url = queryString ? `/api/v1/product-category/?${queryString}` : "/api/v1/product-category/";
    
    return api.get(url);
  };

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-catalog-list"],
    queryFn: () => apiGetCategories({ limit: 100 }),
  });

  // Fetch companies (admin only)
  const { data: companiesData } = useQuery({
    queryKey: ["companies-catalog-list"],
    queryFn: () => apiGetCompanyList({ page: 1, limit: 1000 }),
    enabled: isAdminContext,
  });

  // Note: Brands are not currently displayed since catalog data doesn't include brandId
  // This would require additional API calls to fetch brands by company

  // Transform categories data for ComboBox
  const categoryOptions = useMemo(() => {
    return (categoriesData as { data: { productCategories: Array<{ _id: string; name: string }> } })?.data?.productCategories?.map((category) => ({
      value: category._id,
      label: category.name,
    })) || [];
  }, [categoriesData]);

  // Create lookup maps for names
  const categoryMap = useMemo(() => {
    const map = new Map();
    categoryOptions.forEach(cat => {
      map.set(cat.value, cat.label);
    });
    return map;
  }, [categoryOptions]);

  const companyMap = useMemo(() => {
    const map = new Map();
    if (companiesData) {
      (companiesData as { data: { items: Array<{ _id: string; companyName: string }> } })?.data?.items?.forEach(company => {
        map.set(company._id, company.companyName);
      });
    }
    return map;
  }, [companiesData]);

  // Fetch brands data
  const { data: brandsData } = useQuery({
    queryKey: ["brands-list"],
    queryFn: () => apiGetBrands({ limit: 1000 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create brand lookup map
  const brandMap = useMemo(() => {
    const map = new Map();
    if (brandsData) {
      (brandsData as { data: { brands: Array<{ _id: string; name: string }> } })?.data?.brands?.forEach(brand => {
        map.set(brand._id, brand.name);
      });
    }
    return map;
  }, [brandsData]);


  // Fetch catalog list - now handled by DataTable fetcher

  // Approve catalog mutation
  const approveMutation = useMutation({
    mutationFn: (data: { importJobId: string; status: string; reason?: string }) => {
      return apiApproveCatalog(data.importJobId, { status: data.status, reason: data.reason });
    },
    onSuccess: () => {
      toast.success("Catalog approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["catalog-list"] });
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === "object" && "response" in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to approve catalog";
      toast.error("Approval failed", { description: errorMessage });
    },
  });

  // Download catalog mutation
  const downloadMutation = useMutation({
    mutationFn: apiDownloadCatalog,
    onSuccess: (response) => {
      console.log("Download response:", response);
      // Check multiple possible response structures
      let downloadUrl = null;
      
      if (response?.data?.downloadUrl) {
        downloadUrl = response.data.downloadUrl;
      } else if ((response as unknown as Record<string, unknown>)?.downloadUrl) {
        downloadUrl = (response as unknown as Record<string, unknown>).downloadUrl as string;
      } else if ((response as unknown as Record<string, unknown>)?.data && 
                 ((response as unknown as Record<string, unknown>).data as Record<string, unknown>)?.url) {
        downloadUrl = ((response as unknown as Record<string, unknown>).data as Record<string, unknown>).url as string;
      } else if ((response as unknown as Record<string, unknown>)?.url) {
        downloadUrl = (response as unknown as Record<string, unknown>).url as string;
      }
      
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
        toast.success("Download started!");
      } else {
        console.error("Download URL not found in response:", response);
        toast.error("Download failed", { description: "Download URL not found in response" });
      }
    },
    onError: (error: unknown) => {
      console.error("Download error:", error);
      const errorMessage = error && typeof error === "object" && "response" in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to download catalog";
      toast.error("Download failed", { description: errorMessage });
    },
  });

  // Reject catalog mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { importJobId: string; status: string; reason?: string }) => 
      apiRejectCatalog(data.importJobId, { status: data.status, reason: data.reason }),
    onSuccess: () => {
      toast.success("Catalog rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["catalog-list"] });
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === "object" && "response" in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to reject catalog";
      toast.error("Rejection failed", { description: errorMessage });
    },
  });


  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: "fileName",
      header: "File Name",
      cell: ({ row }: { row: { original: CatalogJob } }) => (
        <div className="font-medium text-sm truncate max-w-[200px]" title={row.original.fileName}>
          {row.original.fileName}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: CatalogJob } }) => (
        <div className="flex flex-col gap-1">
          <StatusBadge module="product" status={row.original.status} variant="badge" />
          {row.original.status === "rejected" && row.original.errorMessage && (
            <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={row.original.errorMessage}>
              Reason: {row.original.errorMessage}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }: { row: { original: CatalogJob } }) => {
        const categoryName = categoryMap.get(row.original.categoryId) || "Unknown";
        return (
          <div className="text-sm font-medium text-gray-700">
            {categoryName}
          </div>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: ({ row }: { row: { original: CatalogJob } }) => {
        const brandName = brandMap.get(row.original.brandId) || "Unknown";
        return (
          <div className="text-sm font-medium text-gray-700">
            {brandName}
          </div>
        );
      },
    },
    {
      accessorKey: "companyId",
      header: "Company",
      cell: ({ row }: { row: { original: CatalogJob } }) => {
        const companyName = companyMap.get(row.original.sellerId) || row.original.sellerId;
        return (
          <div className="text-sm text-gray-600 truncate max-w-[120px]" title={companyName}>
            {companyName.toUpperCase()}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: CatalogJob } }) => (
        <div className="flex gap-1">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => {
              // Try API download first, fallback to direct fileUrl
              if (row.original.fileUrl) {
                // Direct download fallback
                window.open(row.original.fileUrl, "_blank");
                toast.success("Download started!");
              } else {
                // Use API download
                downloadMutation.mutate(row.original._id);
              }
            }}
            disabled={downloadMutation.isPending}
            className="h-8 px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          {/* Always show Manage button for testing */}
          <ManageApprovalDialog 
            catalogJob={row.original} 
            approveMutation={approveMutation}
            rejectMutation={rejectMutation}
          />
          {/* Original conditional rendering */}
          {(() => {
            console.log("Checking status for row:", row.original.status, "for catalog:", row.original._id);
            const shouldShow = row.original.status === "completed" || row.original.status === "pending";
            console.log("Should show ManageApprovalDialog:", shouldShow);
            return false; // Disabled for now to test
          })() && (
            <ManageApprovalDialog 
              catalogJob={row.original} 
              approveMutation={approveMutation}
              rejectMutation={rejectMutation}
            />
          )}
        </div>
      ),
    },
  ], [downloadMutation, approveMutation, rejectMutation, categoryMap, companyMap, brandMap]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CatalogListParams, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination - now handled by DataTable

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Company Filter (Admin Only) */}
            {isAdminContext && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Company</div>
                <PaginationComboBox
                  apiFunction={companiesFetcher}
                  transform={(company: { _id: string; companyName: string }) => ({
                    label: company.companyName,
                    value: company._id,
                  })}
                  placeholder="All companies"
                  value={filters.companyId || ""}
                  onChange={(selectedValue: string | string[]) => {
                    const stringValue = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
                    handleFilterChange("companyId", stringValue || "");
                  }}
                  className="w-full"
                  queryKey={["companies-catalog-filter"]}
                  emptyMessage="No companies found"
                  enabled={isAdminContext}
                />
              </div>
            )}

            {/* Brand Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Brand</div>
              <PaginationComboBox
                apiFunction={brandsFetcher}
                transform={(brand: { _id: string; name: string }) => ({
                  label: brand.name,
                  value: brand._id,
                })}
                placeholder={!filters.companyId && isAdminContext ? "Select company first" : "All brands"}
                value={filters.brandId || ""}
                onChange={(selectedValue: string | string[]) => {
                  const stringValue = Array.isArray(selectedValue) ? selectedValue[0] : selectedValue;
                  handleFilterChange("brandId", stringValue || "");
                }}
                className="w-full"
                queryKey={["brands-catalog-filter", filters.companyId || "none"]}
                emptyMessage={!filters.companyId && isAdminContext ? "Select company first" : "No brands found"}
                enabled={!isAdminContext || !!filters.companyId}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Category</div>
              <ComboBox
                options={categoryOptions}
                placeholder="All categories"
                value={filters.categoryId || ""}
                onChange={(value: string) => handleFilterChange("categoryId", value || "")}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <DataTable
          columns={columns}
          isServerSide
          fetcher={createSimpleFetcher(
            (params: Record<string, unknown>) => apiGetCatalogList({ ...filters, ...params }),
            {
              dataPath: "data.importJobs",
              totalPath: "data.pagination.totalJobs",
            }
          )}
          queryKeyPrefix={`catalog-list-${JSON.stringify(filters)}`}
        />
      </div>
    </div>
  );
};

export default CatalogList;
