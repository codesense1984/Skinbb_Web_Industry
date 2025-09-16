import React from "react";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { normalizeAxiosError } from "@/core/services/http";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiUpdateCompanyStatus,
  type CompanyStatusUpdateRequest,
} from "@/modules/panel/services/http/company.service";
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
import type { AxiosError } from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { apiGetCompanyLocationDetail } from "../../../services/http/company-location.service";
import { CompanyApprovalDialog } from "../../company/components/approval/CompanyApprovalDialog";
import type { CompanyOnboardingAddressDetail } from "@/modules/panel/types";
import { formatCurrency, formatDate } from "@/core/utils";
import { LocationService } from "@/core/services/location.service";

// Type definitions for brand data
interface BrandOwner {
  ownerUser?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  landlineNo?: string;
  ownerDesignation?: string;
}

interface SellingPlatform {
  platform: string;
  url: string;
}

interface Brand {
  _id: string;
  name: string;
  status?: string;
  aboutTheBrand?: string;
  websiteUrl?: string;
  logoImage?: string;
  totalSKU?: number;
  averageSellingPrice?: number;
  brandType?: string[];
  marketingBudget?: number;
  sellingOn?: SellingPlatform[];
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  owner?: BrandOwner;
}

// Reusable InfoItem component for displaying information with icons
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
  children?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  iconBgColor = "bg-primary/10",
  iconTextColor = "text-muted-foreground",
  className = "",
  children,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconBgColor} border-border rounded-lg border p-2`}>
        <div className={`${iconTextColor} h-5 w-5`}>{icon}</div>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
        {children}
      </div>
    </div>
  );
};

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
      queryClient.invalidateQueries({
        queryKey: [PANEL_ROUTES.COMPANY_LOCATION.LIST(companyId)],
      });
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
  const currentLocation: CompanyOnboardingAddressDetail | undefined =
    company.addresses?.find(
      (addr: CompanyOnboardingAddressDetail) => addr.addressId === locationId,
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
            {currentLocation?.status !== STATUS_MAP.company.approved.value && (
              <Button
                onClick={() => setIsApprovalDialogOpen(true)}
                variant="outlined"
                color="secondary"
              >
                Manage Approval
              </Button>
            )}
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
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="Address Type"
              value={currentLocation.addressType}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="Address"
              value={currentLocation.addressLine1 || "-"}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="Landmark"
              value={currentLocation.landmark || "-"}
            />
            <InfoItem
              icon={<PhoneIcon className="h-5 w-5" />}
              label="Landline"
              value={currentLocation.landlineNumber || "-"}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="Country"
              value={LocationService.getCountryName(currentLocation.country)}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="State"
              value={LocationService.getStateName(
                currentLocation.country,
                currentLocation.state,
              )}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="City"
              value={currentLocation.city}
            />
            <InfoItem
              icon={<MapPinIcon className="h-5 w-5" />}
              label="Pin code"
              value={currentLocation.postalCode}
            />
            <InfoItem
              icon={
                currentLocation.isPrimary ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )
              }
              label="Primary Location"
              value={currentLocation.isPrimary ? "Yes" : "No"}
            />
            <InfoItem
              icon={<CalendarIcon className="h-5 w-5" />}
              label="Created At"
              value={formatDate(currentLocation.createdAt)}
            />
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
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="COI Certificate"
                    value={currentLocation.cinNumber ?? "-"}
                    className="rounded-lg border p-3"
                  >
                    <Link
                      to={currentLocation.coiCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs break-all text-blue-500"
                    >
                      View Document
                    </Link>
                  </InfoItem>
                )}

                {currentLocation.msmeCertificate && (
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="MSME Certificate"
                    value={currentLocation.msmeNumber ?? "-"}
                    className="rounded-lg border p-3"
                  >
                    <Link
                      to={currentLocation.msmeCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs break-all text-blue-500"
                    >
                      View Document
                    </Link>
                  </InfoItem>
                )}

                {currentLocation.panDocument && (
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="PAN Document"
                    value={currentLocation.panNumber ?? "-"}
                    className="rounded-lg border p-3"
                  >
                    <Link
                      to={currentLocation.panDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs break-all text-blue-500"
                    >
                      View Document
                    </Link>
                  </InfoItem>
                )}

                {currentLocation.gstDocument && (
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="GST Document"
                    value={currentLocation.gstNumber ?? "-"}
                    className="rounded-lg border p-3"
                  >
                    <Link
                      to={currentLocation.gstDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs break-all text-blue-500"
                    >
                      View Document
                    </Link>
                  </InfoItem>
                )}
              </div>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Brand Details */}
      {currentLocation.brands && Array.isArray(currentLocation.brands) && currentLocation.brands.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Brand Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentLocation.brands
                .filter((brand: Brand | null) => brand != null)
                .map((brand: Brand) => (
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
                    <InfoItem
                      icon={<ShoppingBagIcon className="h-5 w-5" />}
                      label="Total SKU"
                      value={
                        <span className="text-lg font-bold">
                          {brand.totalSKU
                            ? brand.totalSKU.toLocaleString()
                            : "-"}
                        </span>
                      }
                      // iconBgColor="bg-blue-100"
                      // iconTextColor="text-blue-600"
                      className="rounded-lg border p-3"
                    />
                    <InfoItem
                      icon={<CurrencyDollarIcon className="h-5 w-5" />}
                      label="Avg Selling Price"
                      value={
                        <span className="text-lg font-bold">
                          {formatCurrency(brand.averageSellingPrice || 0)}
                        </span>
                      }
                      // iconBgColor="bg-green-100"
                      // iconTextColor="text-green-600"
                      className="rounded-lg border p-3"
                    />
                    <InfoItem
                      icon={<TagIcon className="h-5 w-5" />}
                      label="Product Categories"
                      value={
                        <span className="text-lg font-bold">
                          {brand.brandType ? brand.brandType.length : 0}
                        </span>
                      }
                      // iconBgColor="bg-purple-100"
                      // iconTextColor="text-purple-600"
                      className="rounded-lg border p-3"
                    />
                    <InfoItem
                      icon={<CurrencyDollarIcon className="h-5 w-5" />}
                      label="Marketing Budget"
                      value={
                        <span className="text-lg font-bold">
                          {formatCurrency(brand.marketingBudget || 0)}
                        </span>
                      }
                      // iconBgColor="bg-orange-100"
                      // iconTextColor="text-orange-600"
                      className="rounded-lg border p-3"
                    />
                  </div>

                  {/* Selling Platforms */}
                  {brand.sellingOn && Array.isArray(brand.sellingOn) && brand.sellingOn.length > 0 && (
                    <Card className="shadow-none">
                      <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                          <LinkIcon className="h-5 w-5" />
                          Selling Platforms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {brand.sellingOn
                          .filter((platform: SellingPlatform | null) => platform != null)
                          .map(
                            (platform: SellingPlatform, platformIndex: number) => (
                              <div
                                key={platformIndex}
                                className="flex items-center gap-3"
                              >
                                <div className="rounded-lg bg-gray-100 p-2">
                                  <GlobeAltIcon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium capitalize">
                                    {platform?.platform || "Unknown Platform"}
                                  </p>
                                  <a
                                    href={platform?.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs break-all text-blue-600 hover:text-blue-800"
                                  >
                                    {platform?.url || "No URL"}
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
                      <InfoItem
                        icon={<UserIcon className="h-5 w-5" />}
                        label="Owner Name"
                        value={brand.owner?.ownerUser || "-"}
                        // iconBgColor="bg-blue-100"
                        // iconTextColor="text-blue-600"
                      />
                      <InfoItem
                        icon={<PhoneIcon className="h-5 w-5" />}
                        label="Phone Number"
                        value={brand.owner?.ownerPhone || "-"}
                        // iconBgColor="bg-green-100"
                        // iconTextColor="text-green-600"
                      />
                      <InfoItem
                        icon={
                          <svg
                            className="h-5 w-5"
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
                        }
                        label="Email"
                        value={brand.owner?.ownerEmail || "-"}
                        // iconBgColor="bg-purple-100"
                        // iconTextColor="text-purple-600"
                      />
                      <InfoItem
                        icon={<PhoneIcon className="h-5 w-5" />}
                        label="Fixed landline Number"
                        value={brand.owner?.landlineNo || "-"}
                        // iconBgColor="bg-orange-100"
                        // iconTextColor="text-orange-600"
                      />
                      <InfoItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="Designation"
                        value={brand.owner?.ownerDesignation || "-"}
                        // iconBgColor="bg-indigo-100"
                        // iconTextColor="text-indigo-600"
                      />
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
              <InfoItem
                icon={<BuildingOfficeIcon className="h-5 w-5" />}
                label="Company Name"
                value={company.companyName}
                // iconBgColor="bg-blue-100"
                // iconTextColor="text-blue-600"
              />
              <InfoItem
                icon={<TagIcon className="h-5 w-5" />}
                label="Business Type"
                value={company.businessType || "-"}
                // iconBgColor="bg-green-100"
                // iconTextColor="text-green-600"
              />
              <InfoItem
                icon={<TagIcon className="h-5 w-5" />}
                label="Company Category"
                value={company.companyCategory || "-"}
                // iconBgColor="bg-purple-100"
                // iconTextColor="text-purple-600"
              />
            </div>

            <div className="space-y-4">
              <InfoItem
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Established In"
                value={company.establishedIn || "-"}
                // iconBgColor="bg-pink-100"
                // iconTextColor="text-pink-600"
              />
              <InfoItem
                icon={<DocumentTextIcon className="h-5 w-5" />}
                label="Designation"
                value={owner?.ownerDesignation || "-"}
                // iconBgColor="bg-indigo-100"
                // iconTextColor="text-indigo-600"
              />
            </div>

            <div className="space-y-4">
              <InfoItem
                icon={
                  company.subsidiaryOfGlobalBusiness ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <XCircleIcon className="h-5 w-5" />
                  )
                }
                label="Subsidiary of Global Business"
                value={company.subsidiaryOfGlobalBusiness ? "Yes" : "No"}
                // iconBgColor="bg-gray-100"
                // iconTextColor={
                //   company.subsidiaryOfGlobalBusiness
                //     ? "text-green-600"
                //     : "text-red-600"
                // }
              />
              <InfoItem
                icon={<MapPinIcon className="h-5 w-5" />}
                label="Headquarters"
                value={company.headquaterLocation || "-"}
                // iconBgColor="bg-pink-100"
                // iconTextColor="text-pink-600"
              />
              {company.website && (
                <InfoItem
                  icon={<GlobeAltIcon className="h-5 w-5" />}
                  label="Company Website"
                  value={
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm break-all text-blue-600 hover:text-blue-800"
                    >
                      {company.website}
                    </a>
                  }
                  // iconBgColor="bg-blue-100"
                  // iconTextColor="text-blue-600"
                />
              )}
            </div>
            {company.companyDescription && (
              <InfoItem
                icon={<GlobeAltIcon className="h-5 w-5" />}
                label="Company Information"
                value={company.companyDescription}
                // iconBgColor="bg-blue-100"
                // iconTextColor="text-blue-600"
                className="col-span-4"
              />
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
            <InfoItem
              icon={<CalendarIcon className="h-5 w-5" />}
              label="Location Created At"
              value={formatDate(currentLocation.createdAt)}
              // iconTextColor="text-gray-400"
            />
            <InfoItem
              icon={<CalendarIcon className="h-5 w-5" />}
              label="Location Last Updated"
              value={formatDate(currentLocation.updatedAt)}
              // iconTextColor="text-gray-400"
            />
            {currentLocation.statusChangeReason && (
              <InfoItem
                icon={
                  <svg
                    className="h-4 w-4"
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
                }
                label="Status Change Reason"
                value={currentLocation.statusChangeReason}
                // iconBgColor="bg-yellow-100"
                // iconTextColor="text-yellow-600"
                className="items-start"
              />
            )}
            {currentLocation.statusChangedAt && (
              <InfoItem
                icon={<CalendarIcon className="h-5 w-5" />}
                label="Status Changed At"
                value={formatDate(currentLocation.statusChangedAt)}
                // iconTextColor="text-gray-400"
              />
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
