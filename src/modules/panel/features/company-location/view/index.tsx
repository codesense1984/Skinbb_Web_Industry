import { Badge, StatusBadge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { apiGetCompanyLocationDetail } from "../../../services/http/company-location.service";
import { CompanyApprovalDialog } from "../../company/components/approval/CompanyApprovalDialog";
import { useState } from "react";
import {
  apiUpdateCompanyStatus,
  type CompanyStatusUpdateRequest,
} from "@/modules/panel/services/http/company.service";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { normalizeAxiosError } from "@/core/services/http";
import { Button } from "@/core/components/ui/button";

const CompanyLocationView = () => {
  const { companyId, locationId } = useParams();
  const queryClient = useQueryClient();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Fetch company location detail data
  const {
    data: locationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PANEL_ROUTES.COMPANY_LOCATION.VIEW(companyId, locationId)],
    queryFn: () => apiGetCompanyLocationDetail(companyId!, locationId!),
    enabled: !!companyId && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update company status mutation (for approval)
  const updateStatusMutation = useMutation({
    mutationFn: (data: CompanyStatusUpdateRequest) => {
      return apiUpdateCompanyStatus(locationId!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Company status updated successfully!");
      // Invalidate company list and company details queries
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId)] });
      queryClient.invalidateQueries({
        queryKey: [PANEL_ROUTES.COMPANY_LOCATION.VIEW(companyId, locationId)],
      });
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        normalizeAxiosError(error)?.message,
        // error?.response?.data?.message ||
        //   error?.message ||
        //   "Failed to update company status. Please try again.",
      );
    },
  });

  const handleApproval = async (data: CompanyStatusUpdateRequest) => {
    await updateStatusMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="font-medium text-red-600">
            Failed to load location details
          </p>
          <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">No location data found</p>
        </div>
      </div>
    );
  }

  // The locationData is the CompanyOnboading object directly
  const company = locationData.company;
  const currentLocation: any = company.addresses?.find(
    (addr: any) => addr.addressId === locationId,
  );
  const owner = company.owner;

  if (!currentLocation) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <PageContent
      header={{
        title: "View Location",
        description: `Review location details for ${company.companyName}`,
        actions: (
          <div className="flex gap-3">
            <Button
              onClick={() => setIsApprovalDialogOpen(true)}
              variant="outlined"
              color="secondary"
            >
              Manage Approval
            </Button>
          </div>
        ),
      }}
      className="space-y-6"
    >
      {/* Location Header */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-6">
            {company.logo && (
              <div className="flex-shrink-0">
                <img
                  src={company.logo}
                  alt={`${company.companyName} logo`}
                  className="h-20 w-20 rounded-lg border object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold">
                  {company.companyName}
                </h1>
                <StatusBadge
                  module={"company"}
                  variant="contained"
                  status={currentLocation?.status}
                />
              </div>

              {company.companyDescription && (
                <p className="mt-2 text-sm text-gray-600">
                  {company.companyDescription}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}

      {/* Location Details */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Address Type</p>
                  <p className="text-foreground font-medium capitalize">
                    {currentLocation.addressType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">GST Number</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.gstNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">PAN Number</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.panNumber || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">CIN Number</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.cinNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">MSME Number</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.msmeNumber || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <MapPinIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Landmark</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.landmark || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  {currentLocation.isPrimary ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Primary Location
                  </p>
                  <p className="text-foreground font-medium">
                    {currentLocation.isPrimary ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <CalendarIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Created At</p>
                  <p className="text-foreground font-medium">
                    {currentLocation.createdAt
                      ? new Date(currentLocation.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {(currentLocation.coiCertificate ||
            currentLocation.msmeCertificate ||
            currentLocation.panDocument ||
            currentLocation.gstDocument) && (
            <Card className="mt-6 shadow-none">
              <CardHeader className="border-b">
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {currentLocation.coiCertificate && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        COI Certificate
                      </p>
                      <p className="text-foreground text-lg font-bold">
                        {currentLocation.cinNumber ?? "-"}
                      </p>
                      <a
                        href={currentLocation.coiCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}

                {currentLocation.msmeCertificate && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        MSME Certificate
                      </p>
                      <p className="text-foreground text-lg font-bold">
                        {currentLocation.msmeNumber ?? "-"}
                      </p>

                      <a
                        href={currentLocation.msmeCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}

                {currentLocation.panDocument && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        PAN Document
                      </p>
                      <p className="text-foreground text-lg font-bold">
                        {currentLocation.panNumber ?? "-"}
                      </p>
                      <a
                        href={currentLocation.panDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}

                {currentLocation.gstDocument && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        GST Document
                      </p>
                      <p className="text-foreground text-lg font-bold">
                        {currentLocation.gstNumber ?? "-"}
                      </p>
                      <a
                        href={currentLocation.gstDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        View Document
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Brand Details */}
      {currentLocation.brands && currentLocation.brands.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Brand Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentLocation.brands.map((brand: any) => (
                <div key={brand._id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-start gap-4">
                    {brand.logoImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={brand.logoImage}
                          alt={`${brand.name} logo`}
                          className="h-16 w-16 rounded-lg border object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-foreground text-lg font-semibold">
                          {brand.name}
                        </h3>
                        {brand?.status && (
                          <Badge variant="outline" className="text-xs">
                            {brand?.status}
                          </Badge>
                        )}
                      </div>
                      {brand.aboutTheBrand && (
                        <p className="mb-1 text-sm text-gray-600">
                          {brand.aboutTheBrand}
                        </p>
                      )}
                      {brand.websiteUrl && (
                        <a
                          href={brand.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {brand.websiteUrl}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Brand Metrics */}
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Total SKU
                        </p>
                        <p className="text-foreground text-lg font-bold">
                          {brand.totalSKU?.toLocaleString() || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Avg Selling Price
                        </p>
                        <p className="text-foreground text-lg font-bold">
                          ₹{brand.averageSellingPrice?.toLocaleString() || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <TagIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Product Categories
                        </p>
                        <p className="text-foreground text-lg font-bold">
                          {brand.productCategory?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="rounded-lg bg-orange-100 p-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Marketing Budget
                        </p>
                        <p className="text-foreground text-lg font-bold">
                          ₹{brand.marketingBudget?.toLocaleString() || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selling Platforms */}
                  {brand.sellingOn && brand.sellingOn.length > 0 && (
                    <Card className="shadow-none">
                      <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5" />
                          Selling Platforms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {brand.sellingOn.map(
                          (platform: any, platformIndex: number) => (
                            <div
                              key={platformIndex}
                              className="flex items-center gap-3"
                            >
                              <div className="rounded-lg bg-gray-100 p-2">
                                <GlobeAltIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium capitalize">
                                  {platform.platform}
                                </p>
                                <a
                                  href={platform.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs break-all text-blue-600 hover:text-blue-800"
                                >
                                  {platform.url}
                                </a>
                              </div>
                            </div>
                          ),
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card className="shadow-none">
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Brand Owner
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Owner Name
                          </p>
                          <p className="text-foreground font-medium">
                            {brand.owner?.ownerUser || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <PhoneIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Phone Number
                          </p>
                          <p className="text-foreground font-medium">
                            {brand.owner?.ownerPhone || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                          <svg
                            className="h-5 w-5 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Email</p>
                          <p className="text-foreground font-medium">
                            {brand.owner?.ownerEmail || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2">
                          <PhoneIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Landline Number
                          </p>
                          <p className="text-foreground font-medium">
                            {brand.owner.landlineNo || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-100 p-2">
                          <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Designation
                          </p>
                          <p className="text-foreground font-medium">
                            {brand.owner?.ownerDesignation || "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Brand Online Presence */}
                  <Card className="shadow-none">
                    <CardHeader className="border-b">
                      <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Online Presence
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {brand.instagramUrl && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-pink-100 p-2">
                            <svg
                              className="h-5 w-5 text-pink-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281H7.721c-.552 0-1-.448-1-1s.448-1 1-1h8.558c.552 0 1 .448 1 1s-.448 1-1 1z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Instagram
                            </p>
                            <a
                              href={brand.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm break-all text-blue-600 hover:text-blue-800"
                            >
                              {brand.instagramUrl}
                            </a>
                          </div>
                        </div>
                      )}

                      {brand.facebookUrl && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2">
                            <svg
                              className="h-5 w-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              Facebook
                            </p>
                            <a
                              href={brand.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm break-all text-blue-600 hover:text-blue-800"
                            >
                              {brand.facebookUrl}
                            </a>
                          </div>
                        </div>
                      )}

                      {brand.youtubeUrl && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-red-100 p-2">
                            <svg
                              className="h-5 w-5 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-sm">
                              YouTube
                            </p>
                            <a
                              href={brand.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm break-all text-blue-600 hover:text-blue-800"
                            >
                              {brand.youtubeUrl}
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Company Name</p>
                  <p className="text-foreground font-medium">
                    {company.companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <TagIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Business Type</p>
                  <p className="text-foreground font-medium">
                    {company.businessType || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <TagIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Company Category
                  </p>
                  <p className="text-foreground font-medium">
                    {company.companyCategory || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <CalendarIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Established In
                  </p>
                  <p className="text-foreground font-medium">
                    {company.establishedIn || "-"}
                  </p>
                </div>
              </div>

              {/* <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2">
                  <PhoneIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Landline Number</p>
                  <p className="font-medium text-foreground">
                    {company.landlineNo || "-"}
                  </p>
                </div>
              </div> */}

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Designation</p>
                  <p className="text-foreground font-medium">
                    {owner?.ownerDesignation || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  {company.subsidiaryOfGlobalBusiness ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Subsidiary of Global Business
                  </p>
                  <p className="text-foreground font-medium">
                    {company.subsidiaryOfGlobalBusiness ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <MapPinIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Headquarters</p>
                  <p className="text-foreground font-medium">
                    {company.headquaterLocation || "-"}
                  </p>
                </div>
              </div>

              {company.website && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Company Website
                    </p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm break-all text-blue-600 hover:text-blue-800"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
            {company.companyDescription && (
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Company Description
                  </p>
                  <p className="text-foreground font-medium">
                    {company.companyDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-muted-foreground text-sm">
                  Location Created At
                </p>
                <p className="font-medium">
                  {currentLocation.createdAt
                    ? new Date(currentLocation.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-muted-foreground text-sm">
                  Location Last Updated
                </p>
                <p className="font-medium">
                  {currentLocation.updatedAt
                    ? new Date(currentLocation.updatedAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>

            {currentLocation.statusChangeReason && (
              <div className="flex items-start gap-3">
                <div className="rounded bg-yellow-100 p-1">
                  <svg
                    className="h-4 w-4 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Status Change Reason
                  </p>
                  <p className="font-medium">
                    {currentLocation.statusChangeReason}
                  </p>
                </div>
              </div>
            )}

            {currentLocation.statusChangedAt && (
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Status Changed At
                  </p>
                  <p className="font-medium">
                    {new Date(
                      currentLocation.statusChangedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <CompanyApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApproval}
        companyName={company?.companyName}
        isLoading={updateStatusMutation.isPending}
      />
    </PageContent>
  );
};

export default CompanyLocationView;
