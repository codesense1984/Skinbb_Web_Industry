import { useParams, useNavigate } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Avatar } from "@/core/components/ui/avatar";
import { formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { normalizeAxiosError } from "@/core/services/http";
import { apiGetBrandById, apiUpdateBrandStatus, type BrandStatusUpdateRequest } from "@/modules/panel/services/http/company.service";
import { BrandApprovalDialog } from "../components/BrandApprovalDialog";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { STATUS_MAP } from "@/core/config/status";
import type { AxiosError } from "axios";

const CompanyBrandView = () => {
  const { companyId, brandId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  if (!companyId || !brandId) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description:
            "Company ID and Brand ID are required to view brand details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or brand ID provided.</p>
        </div>
      </PageContent>
    );
  }

  // Fetch brand data
  const { data: brandData, isLoading, error } = useQuery({
    queryKey: ["brand", brandId],
    queryFn: () => apiGetBrandById<{ data: any }>(brandId!),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update brand status mutation (for approval)
  const updateStatusMutation = useMutation({
    mutationFn: (data: BrandStatusUpdateRequest) => {
      if (!user?._id) {
        throw new Error("Admin ID not found");
      }
      return apiUpdateBrandStatus(user._id, brandId!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Brand status updated successfully!");
      // Invalidate brand queries
      queryClient.invalidateQueries({
        queryKey: ["brand", brandId],
      });
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        normalizeAxiosError(error)?.message ||
        "Failed to update brand status. Please try again.",
      );
    },
  });

  const handleApproval = async (data: BrandStatusUpdateRequest) => {
    await updateStatusMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description: "Loading brand information...",
        }}
      >
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand data...</p>
        </div>
      </PageContent>
    );
  }

  if (error) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description: "Error loading brand information.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-600 mb-4">Error loading brand data</p>
          <p className="text-gray-600 text-sm mb-4">
            Brand ID: {brandId}
          </p>
          <Button 
            onClick={() => navigate(PANEL_ROUTES.COMPANY.LIST)}
            variant="outlined"
          >
            Back to Companies
          </Button>
        </div>
      </PageContent>
    );
  }

  const brand = brandData?.data || brandData;

  // Debug logging
  console.log("Brand data:", brand);
  console.log("Brand status:", brand?.status);
  console.log("Brand brandStatus:", brand?.brandStatus);
  console.log("STATUS_MAP.brand.active.value:", STATUS_MAP.brand?.active?.value);

  if (!brand) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description: "Brand not found.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500 mb-4">
            Brand not found or has been deleted.
          </p>
          <p className="mb-4 text-sm text-gray-400">
            Company ID: {companyId} | Brand ID: {brandId}
          </p>
          <Button
            onClick={() => navigate(PANEL_ROUTES.COMPANY.LIST)}
            variant="outlined"
          >
            Back to Companies
          </Button>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: brand.name,
        description: `Brand details for ${brand.name}`,
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY.BRANDS(companyId))}
              variant="outlined"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Brands
            </Button>
            <Button
              onClick={() => setIsApprovalDialogOpen(true)}
              variant="outlined"
              color="secondary"
            >
              Manage Approval
            </Button>
            <Button
              onClick={() => navigate(PANEL_ROUTES.COMPANY.BRAND_EDIT(companyId, brandId))}
              variant="contained"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Brand
            </Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-start gap-4 rounded-lg border bg-white p-6">
          {brand.logoImage && (
            <Avatar
              src={brand.logoImage}
              feedback={brand.name.charAt(0)}
              className="h-16 w-16"
            />
          )}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{brand.name}</h2>
              <StatusBadge
                status={brand.status || brand.brandStatus}
                module="brand"
                variant="badge"
              >
                {brand.status || brand.brandStatus}
              </StatusBadge>
            </div>
            <p className="mb-4 text-gray-600">{brand.aboutTheBrand}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Created: {formatDate(brand.createdAt)}</span>
              <span>Updated: {formatDate(brand.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Brand Details */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Website
                </label>
                <p className="text-sm">
                  {brand.websiteUrl ? (
                    <a
                      href={brand.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {brand.websiteUrl}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="text-sm">
                  {brand.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Location
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">{brand.locationCity}</Badge>
                  <span className="text-sm text-gray-500">
                    {brand.locationType} • {brand.locationState}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Status Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Brand Status
                </label>
                <p className="text-sm">{brand.brandStatus}</p>
              </div>
              {brand.statusChangeReason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status Reason
                  </label>
                  <p className="text-sm">{brand.statusChangeReason}</p>
                </div>
              )}
              {brand.statusChangedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status Changed
                  </label>
                  <p className="text-sm">{formatDate(brand.statusChangedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Documents</h3>
          <div className="space-y-3">
            {brand.authorizationLetter && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Authorization Letter
                </label>
                <p className="text-sm">
                  <a
                    href={brand.authorizationLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Document
                  </a>
                </p>
              </div>
            )}
            {brand.coverImage && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Cover Image
                </label>
                <p className="text-sm">
                  <a
                    href={brand.coverImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View Image
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <BrandApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApproval}
        brandName={brand?.name}
        isLoading={updateStatusMutation.isPending}
      />
    </PageContent>
  );
};

export default CompanyBrandView;
