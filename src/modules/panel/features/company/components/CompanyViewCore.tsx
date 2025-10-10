import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { PageContent } from "@/core/components/ui/structure";
import { STATUS_MAP } from "@/core/config/status";
import { LocationService } from "@/core/services/location.service";
import { formatDate } from "@/core/utils";
import { hasAccess } from "@/modules/auth/components/guard";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { PAGE, PERMISSION } from "@/modules/auth/types/permission.type.";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyLocationById } from "@/modules/panel/services/http/company-location.service";
import { apiGetCompanyDetailById } from "@/modules/panel/services/http/company.service";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  StarIcon,
  TagIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

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

// Location Accordion Item Component
interface LocationAccordionItemProps {
  address: {
    addressId?: string;
    _id?: string;
    addressType: string;
    addressLine1: string;
    city: string;
    country: string;
    state: string;
    postalCode: string;
    landmark?: string;
    isPrimary: boolean;
    status?: string;
  };
  companyId: string;
  index: number;
  isExpanded: boolean;
  onViewBrands: (companyId: string, locationId: string) => void;
  onViewProducts: (companyId: string, locationId: string) => void;
  onViewLocation?: (companyId: string, locationId: string) => void;
  onEditLocation?: (companyId: string, locationId: string) => void;
}

const LocationAccordionItem: React.FC<LocationAccordionItemProps> = ({
  address,
  companyId,
  index,
  isExpanded,
  onViewBrands,
  onViewProducts,
  onViewLocation,
  onEditLocation,
}) => {
  const locationId = address.addressId || address._id;
  const { permissions } = useAuth();

  const {
    data: companyLocationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.LOCATION_DETAILS(companyId, locationId!)],
    queryFn: () => {
      if (!locationId) throw new Error("Location ID is required");
      return apiGetCompanyLocationById(companyId, locationId);
    },
    enabled: isExpanded && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const location = companyLocationData?.data;

  return (
    <AccordionItem value={`address-${index}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-foreground mb-1 text-lg font-medium break-words">
                {address.addressLine1}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {address.addressType}
              </Badge>
              {address.isPrimary && (
                <Badge variant="default" className="text-xs">
                  <StarIcon className="mr-1 h-3 w-3" />
                  Primary
                </Badge>
              )}
              {address.status && (
                <StatusBadge
                  module="brand"
                  status={address.status}
                  variant="badge"
                  showDot={true}
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu
              items={[
                ...(onViewLocation &&
                [
                  STATUS_MAP.company.pending.value,
                  STATUS_MAP.company.rejected.value,
                ].includes(address.status || "")
                  ? [
                      {
                        type: "item" as const,
                        onClick: () => {
                          onViewLocation?.(companyId, locationId || "");
                        },
                        children: (
                          <>
                            <MapPinIcon />
                            View
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(hasAccess({
                  userPermissions: permissions,
                  page: PAGE.COMPANIES,
                  actions: PERMISSION.UPDATE,
                }) && onEditLocation
                  ? [
                      {
                        type: "item" as const,
                        onClick: () => {
                          onEditLocation(companyId, locationId || "");
                        },
                        children: (
                          <>
                            <PencilIcon />
                            Edit
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(![
                  STATUS_MAP.company.pending.value,
                  STATUS_MAP.company.rejected.value,
                ].includes(address.status || "") && onViewBrands
                  ? [
                      {
                        type: "item" as const,
                        onClick: () => {
                          onViewBrands(companyId, locationId || "");
                        },
                        children: (
                          <>
                            <TagIcon />
                            View Brands
                          </>
                        ),
                      },
                    ]
                  : []),
                ...(![
                  STATUS_MAP.company.pending.value,
                  STATUS_MAP.company.rejected.value,
                ].includes(address.status || "") && onViewProducts
                  ? [
                      {
                        type: "item" as const,
                        onClick: () => {
                          onViewProducts(companyId, locationId || "");
                        },
                        children: (
                          <>
                            <DocumentTextIcon />
                            View Products
                          </>
                        ),
                      },
                    ]
                  : []),
              ]}
            >
              <Button variant="ghost" size="icon">
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenu>
            {/* {onViewLocation && address.status === "pending" && (
            {/* {onViewLocation && address.status === "pending" && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLocation(companyId, locationId || "");
                }}
                variant="outlined"
                size="sm"
                className="border-gray-200 bg-white/80 text-xs text-gray-700 hover:bg-white hover:text-gray-800"
              >
                <MapPinIcon className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">View</span>
              </Button>
            )}
            {onEditLocation && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditLocation(companyId, locationId || "");
                }}
                variant="outlined"
                size="sm"
                className="border-gray-200 bg-white/80 text-xs text-gray-700 hover:bg-white hover:text-gray-800"
              >
                <PencilIcon className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewBrands(companyId, locationId || "");
              }}
              variant="outlined"
              size="sm"
              className="border-gray-200 bg-white/80 text-xs text-gray-700 hover:bg-white hover:text-gray-800"
            >
              <TagIcon className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">View Brands</span>
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewProducts(companyId, locationId || "");
              }}
              variant="outlined"
              size="sm"
              className="border-gray-200 bg-white/80 text-xs text-gray-700 hover:bg-white hover:text-gray-800"
            >
              <DocumentTextIcon className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">View Products</span>
            </Button> */}
            </Button> */}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                <span className="text-sm text-gray-600">
                  Loading location details...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto mb-2 h-8 w-8 text-red-500" />
                <p className="text-sm text-red-600">
                  Failed to load location details
                </p>
              </div>
            </div>
          ) : location ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Address Type"
                  value={location.addressType}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Address"
                  value={location.addressLine1 || "-"}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Landmark"
                  value={location.landmark || "-"}
                />
                <InfoItem
                  icon={<PhoneIcon className="h-5 w-5" />}
                  label="Landline"
                  value={location.landlineNumber || location.phoneNumber || "Not available"}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Country"
                  value={location.country || "-"}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="State"
                  value={location.state || "-"}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="City"
                  value={location.city}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Pin code"
                  value={location.postalCode}
                />
                <InfoItem
                  icon={
                    location.isPrimary ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5" />
                    )
                  }
                  label="Primary Location"
                  value={location.isPrimary ? "Yes" : "No"}
                />
                <InfoItem
                  icon={<CalendarIcon className="h-5 w-5" />}
                  label="Created At"
                  value={formatDate(location.createdAt)}
                />
              </div>

              {/* Documents Section */}
              {(location.coiCertificate ||
                location.msmeCertificate ||
                location.panDocument ||
                location.gstDocument) && (
                <Card className="mt-6 shadow-none">
                  <CardHeader className="border-b">
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {location.coiCertificate && (
                      <InfoItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="COI Certificate"
                        value="Certificate Available"
                        className="rounded-lg border p-3"
                      >
                        <Link
                          to={location.coiCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs break-all text-blue-500"
                        >
                          View Document
                        </Link>
                      </InfoItem>
                    )}

                    {location.msmeCertificate && (
                      <InfoItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="MSME Certificate"
                        value={location.msmeNumber ?? "-"}
                        className="rounded-lg border p-3"
                      >
                        <Link
                          to={location.msmeCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs break-all text-blue-500"
                        >
                          View Document
                        </Link>
                      </InfoItem>
                    )}

                    {location.panDocument && (
                      <InfoItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="PAN Document"
                        value={location.panNumber ?? "-"}
                        className="rounded-lg border p-3"
                      >
                        <Link
                          to={location.panDocument}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs break-all text-blue-500"
                        >
                          View Document
                        </Link>
                      </InfoItem>
                    )}

                    {location.gstDocument && (
                      <InfoItem
                        icon={<DocumentTextIcon className="h-5 w-5" />}
                        label="GST Document"
                        value={location.gstNumber ?? "-"}
                        className="rounded-lg border p-3"
                      >
                        <Link
                          to={location.gstDocument}
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
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                No detailed information available
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface CompanyViewCoreProps {
  companyId: string;
  showViewUsersAction?: boolean;
  customHeader?: {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
  };
  onViewBrands?: (companyId: string, locationId: string) => void;
  onViewProducts?: (companyId: string, locationId: string) => void;
  onViewUsers?: (companyId: string) => void;
  onViewLocation?: (companyId: string, locationId: string) => void;
  onEditLocation?: (companyId: string, locationId: string) => void;
}

export const CompanyViewCore: React.FC<CompanyViewCoreProps> = ({
  companyId,
  showViewUsersAction = true,
  customHeader,
  onViewBrands,
  onViewProducts,
  onViewUsers,
  onViewLocation,
  onEditLocation,
}) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  const {
    data: companyData,
    isLoading: companyLoading,
    error: companyError,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.DETAIL(companyId)],
    queryFn: () => apiGetCompanyDetailById(companyId, userId!),
    enabled: !!companyId,
  });

  const company = companyData?.data;

  const handleViewBrands = (companyId: string, locationId: string) => {
    if (onViewBrands) {
      onViewBrands(companyId, locationId);
    } else {
      navigate(PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId));
    }
  };

  const handleViewProducts = (companyId: string, locationId: string) => {
    if (onViewProducts) {
      onViewProducts(companyId, locationId);
    } else {
      navigate(PANEL_ROUTES.COMPANY_LOCATION.PRODUCTS(companyId, locationId));
    }
  };

  const handleViewUsers = (companyId: string) => {
    if (onViewUsers) {
      onViewUsers(companyId);
    } else {
      navigate(PANEL_ROUTES.COMPANY.USERS(companyId));
    }
  };

  // Default header configuration
  const defaultHeader = {
    title: "Company Details",
    description: "View comprehensive company information and addresses",
    actions: showViewUsersAction && (
      <div className="ml-6 flex flex-shrink-0 gap-3">
        <Button
          onClick={() => {
            // Get the primary location ID from company data
            const primaryLocation = company?.addresses?.find(
              (addr) => addr.isPrimary,
            );
            if (primaryLocation) {
              const locationId = primaryLocation.addressId;
              // Navigate to company-location-brand route
              navigate(
                PANEL_ROUTES.COMPANY_LOCATION.BRANDS(companyId, locationId),
              );
            } else {
              // Fallback to general brand list with company and location context
              const firstLocation = company?.addresses?.[0];
              const locationId = firstLocation?.addressId;
              if (locationId) {
                navigate(
                  `${PANEL_ROUTES.BRAND.LIST}?companyId=${companyId}&locationId=${locationId}`,
                );
              } else {
                navigate(`${PANEL_ROUTES.BRAND.LIST}?companyId=${companyId}`);
              }
            }
          }}
          variant="outlined"
          className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-2 h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6Z"
            />
          </svg>
          View Brands
        </Button>
        <Button
          onClick={() => handleViewUsers(companyId)}
          variant="outlined"
          className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          <UserGroupIcon className="mr-2 h-4 w-4" />
          View Users
        </Button>
      </div>
    ),
  };

  const headerConfig = customHeader
    ? { ...defaultHeader, ...customHeader }
    : defaultHeader;

  return (
    <PageContent
      header={headerConfig}
      error={companyError}
      loading={companyLoading}
    >
      {company && (
        <div className="space-y-6">
          {/* Company Header Summary */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-6">
                  {/* Company Logo Placeholder */}
                  <div className="flex-shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 text-2xl font-bold text-white">
                      {company.companyName?.charAt(0) || "C"}
                    </div>
                  </div>

                  {/* Company Basic Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <h1 className="text-foreground text-3xl font-bold">
                        {company.companyName.toUpperCase()}
                      </h1>
                    </div>
                    <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                          <CalendarIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Established
                          </p>
                          <p className="text-foreground font-medium">
                            {company.establishedIn}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Business Type
                          </p>
                          <p className="text-foreground font-medium capitalize">
                            {company.businessType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Company Category
                          </p>
                          <p className="text-foreground font-medium capitalize">
                            {company.companyCategory}
                          </p>
                        </div>
                      </div>
                      {company.website && (
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                            <LinkIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Website
                            </p>
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-foreground text-lg font-bold">
            Company Locations
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {/* Company Addresses Accordion */}
            {company.addresses && company.addresses.length > 0 && (
              <Card className="py-0">
                <CardContent className="py-0">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    value={expandedAddress || ""}
                    onValueChange={setExpandedAddress}
                  >
                    {company.addresses.map((address, index) => (
                      <LocationAccordionItem
                        key={index}
                        address={address}
                        companyId={companyId}
                        index={index}
                        isExpanded={expandedAddress === `address-${index}`}
                        onViewBrands={handleViewBrands}
                        onViewProducts={handleViewProducts}
                        onViewLocation={onViewLocation}
                        onEditLocation={onEditLocation}
                      />
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageContent>
  );
};
