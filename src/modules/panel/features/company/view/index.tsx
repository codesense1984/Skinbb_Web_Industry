import { StatusBadge } from "@/core/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Separator } from "@/core/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/core/components/ui/accordion";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { apiGetCompanyDetailById } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { formatDate, formatCurrency } from "@/core/utils";
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  EnvelopeIcon,
  LinkIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { LocationService } from "@/core/services/location.service";

// Reusable InfoItem component for displaying information with icons
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="flex-shrink-0 text-gray-500 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 break-words">
        {value || "-"}
      </p>
    </div>
  </div>
);

const CompanyView = () => {
  const { id } = useParams();

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
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
                  {/* Company Logo Placeholder */}
                <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {company.companyName?.charAt(0) || 'C'}
                    </div>
                  </div>
                  
                  {/* Company Basic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 truncate">
                        {company.companyName}
                      </h1>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Est. {company.establishedIn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        <span className="capitalize">{company.businessType} • {company.companyCategory}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <LinkIcon className="h-4 w-4" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
            {/* Company Information */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="CIN Number"
                    value={company.cinNumber}
                  />
                  <InfoItem
                    icon={<DocumentTextIcon className="h-5 w-5" />}
                    label="MSME Number"
                    value={company.msmeNumber}
                  />
                  <InfoItem
                    icon={<PhoneIcon className="h-5 w-5" />}
                    label="Landline"
                    value={company.landlineNo}
                  />
                  <InfoItem
                    icon={<ShoppingBagIcon className="h-5 w-5" />}
                    label="Product Categories"
                    value={company.productCategory?.join(", ")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Platforms */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  Online Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Social Media Links */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Social Media</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {company.instagramUrl && (
                        <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">IG</span>
                          </div>
                          <span className="text-sm text-gray-700">Instagram</span>
                        </a>
                      )}
                      {company.facebookUrl && (
                        <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">FB</span>
                          </div>
                          <span className="text-sm text-gray-700">Facebook</span>
                        </a>
                      )}
                      {company.youtubeUrl && (
                        <a href={company.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">YT</span>
                          </div>
                          <span className="text-sm text-gray-700">YouTube</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Selling Platforms */}
                  {company.sellingOn && company.sellingOn.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Selling Platforms</h4>
                      <div className="space-y-2">
                        {company.sellingOn.map((platform, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <GlobeAltIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="font-medium">{platform.platform}</span>
                            </div>
                            <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Visit
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Addresses Accordion */}
            {company.addresses && company.addresses.length > 0 && (
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Company Addresses
                    <Badge variant="outline" className="ml-auto">
                      {company.addresses.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {company.addresses.map((address, index) => (
                      <AccordionItem key={index} value={`address-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {address.addressType}
                                </Badge>
                                {address.isPrimary && (
                                  <Badge variant="default" className="text-xs">
                                    <StarIcon className="h-3 w-3 mr-1" />
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 mb-1">
                                  {address.addressLine1}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {LocationService.getStateName(address.country, address.state)} - {address.postalCode}
                                </p>
                                {address.landmark && (
                                  <p className="text-xs text-gray-500">
                                    Near {address.landmark}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="Address Type"
                                value={address.addressType}
                              />
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="Country"
                                value={LocationService.getCountryName(address.country)}
                              />
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="State"
                                value={LocationService.getStateName(address.country, address.state)}
                              />
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="City"
                                value={address.city}
                              />
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="Postal Code"
                                value={address.postalCode}
                              />
                              <InfoItem
                                icon={<MapPinIcon className="h-4 w-4" />}
                                label="Landmark"
                                value={address.landmark}
                              />
                              <InfoItem
                                icon={<DocumentTextIcon className="h-4 w-4" />}
                                label="GST Number"
                                value={address.gstNumber}
                              />
                              <InfoItem
                                icon={<DocumentTextIcon className="h-4 w-4" />}
                                label="PAN Number"
                                value={address.panNumber}
                              />
                            </div>
                            
                            {address.brands && address.brands.length > 0 && (
                              <>
                                <Separator className="my-4" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 mb-3">Associated Brands</p>
                                  <div className="flex flex-wrap gap-2">
                                    {address.brands.map((brand, brandIndex) => (
                                      <Badge key={brandIndex} variant="secondary" className="flex items-center gap-1">
                                        <StarIcon className="h-3 w-3" />
                                        {brand.name}
                                      </Badge>
                                    ))}
              </div>
            </div>
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
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
