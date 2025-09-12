import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { Badge } from "@/core/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { apiGetCompanyDetailById } from "@/modules/panel/services/http/company.service";
import { apiGetCompanyLocationById } from "@/modules/panel/services/http/company-location.service";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { formatDate } from "@/core/utils";
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CalendarIcon,
  DocumentTextIcon,
  LinkIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { LocationService } from "@/core/services/location.service";

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
  };
  companyId: string;
  index: number;
  isExpanded: boolean;
}

const LocationAccordionItem: React.FC<LocationAccordionItemProps> = ({
  address,
  companyId,
  index,
  isExpanded,
}) => {
  const locationId = address.addressId || address._id;


  const {
    data: locationData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.LOCATION_DETAILS(companyId, locationId || "")],
    queryFn: () => {
      if (!locationId) throw new Error("Location ID is required");
      return apiGetCompanyLocationById(companyId, locationId);
    },
    enabled: isExpanded && !!locationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const location = locationData?.data;

  return (
    <AccordionItem value={`address-${index}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex w-full items-center justify-between pr-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {address.addressType}
              </Badge>
              {address.isPrimary && (
                <Badge variant="default" className="text-xs">
                  <StarIcon className="mr-1 h-3 w-3" />
                  Primary
                </Badge>
              )}
            </div>
    <div className="min-w-0 flex-1">
              <p className="mb-1 font-medium text-gray-900">
                {address.addressLine1}
              </p>
              <p className="text-sm text-gray-600">
                {address.city},{" "}
                {LocationService.getStateName(address.country, address.state)} -{" "}
                {address.postalCode}
              </p>
              {address.landmark && (
                <p className="text-xs text-gray-500">Near {address.landmark}</p>
              )}
            </div>
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  label="Phone"
                  value={location.phoneNumber || "-"}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="Country"
                  value={LocationService.getCountryName(location.country)}
                />
                <InfoItem
                  icon={<MapPinIcon className="h-5 w-5" />}
                  label="State"
                  value={LocationService.getStateName(
                    location.country,
                    location.state,
                  )}
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        value="Certificate Available"
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

const CompanyView = () => {
  const { id } = useParams();
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);


  const {
    data: companyData,
    isLoading: companyLoading,
    error: companyError,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.DETAIL(id!)],
    queryFn: () => apiGetCompanyDetailById(id!),
    enabled: !!id,
  });

  const company = companyData?.data;

  return (
    <PageContent
      header={{
        title: "Company Details",
        description: "View comprehensive company information and addresses",
      }}
      error={companyError}
      loading={companyLoading}
    >
      {company && (
        <div className="space-y-6">
          {/* Company Header Summary */}
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
                  {/* Company Logo Placeholder */}
                <div className="flex-shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
                      {company.companyName?.charAt(0) || "C"}
                    </div>
                  </div>
                  
                  {/* Company Basic Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h1 className="truncate text-3xl font-bold text-gray-900">
                        {company.companyName}
                      </h1>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Est. {company.establishedIn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        <span className="capitalize">
                          {company.businessType} • {company.companyCategory}
                        </span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <LinkIcon className="h-4 w-4" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Company Addresses Accordion */}
            {company.addresses && company.addresses.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Company Locations
                    <Badge variant="outline" className="ml-auto">
                      {company.addresses.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
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
                        companyId={id!}
                        index={index}
                        isExpanded={expandedAddress === `address-${index}`}
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

export default CompanyView;
