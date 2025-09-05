import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
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
import type { AxiosError } from "axios";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import {
  apiGetCompanyDetailData,
  apiUpdateCompanyStatus,
  type CompanyStatusUpdateRequest,
} from "../../../services/http/company.service";
import { CompanyApprovalDialog } from "../components/approval/CompanyApprovalDialog";

const CompanyView = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Fetch company data
  const {
    data: companyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [PANEL_ROUTES.COMPANY.DETAIL(id)],
    queryFn: () => apiGetCompanyDetailData(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update company status mutation (for approval)
  const updateStatusMutation = useMutation({
    mutationFn: (data: CompanyStatusUpdateRequest) => {
      return apiUpdateCompanyStatus(id!, data);
    },
    onSuccess: (response) => {
      toast.success(response.message || "Company status updated successfully!");
      // Invalidate company list and company details queries
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.COMPANY.LIST] });
      queryClient.invalidateQueries({
        queryKey: [PANEL_ROUTES.COMPANY.DETAIL(id)],
      });
      setIsApprovalDialogOpen(false);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Company status update error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update company status. Please try again.",
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
          <p className="text-gray-600">Loading company details...</p>
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
            Failed to load company details
          </p>
          <p className="mt-1 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!companyData?.data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600">No company data found</p>
        </div>
      </div>
    );
  }

  const { company, ownerUser, addresses } = companyData.data;

  return (
    <PageContent
      header={{
        title: "View Company",
        description: "Review company details and manage approval status",
        actions: (
          <div className="flex gap-3">
            {company?.status && (
              <StatusBadge
                module={"company"}
                variant="default"
                status={company?.status}
              />
            )}
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
      {/* Company Header */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-6">
            {company.brandLogo && (
              <div className="flex-shrink-0">
                <img
                  src={company.brandLogo}
                  alt={`${company.companyName} logo`}
                  className="h-20 w-20 rounded-lg border object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {company.companyName}
                </h1>
                <StatusBadge
                  module={"company"}
                  variant="contained"
                  status={company?.status}
                />
              </div>
              {company.designation && (
                <p className="text-sm text-gray-500">
                  Designation: {company.designation}
                </p>
              )}
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
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium text-gray-900">
                  {ownerUser
                    ? `${ownerUser.firstName} ${ownerUser.lastName}`.trim()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <PhoneIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900">
                  {ownerUser
                    ? `${ownerUser.countryCode} ${ownerUser.phoneNumber}`
                    : "N/A"}
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
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">
                  {ownerUser?.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <PhoneIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Landline Number</p>
                <p className="font-medium text-gray-900">
                  {company.landlineNo || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="font-medium text-gray-900">
                  {company.designation || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Company Details
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
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium text-gray-900">
                    {company.companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <TagIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Business Type</p>
                  <p className="font-medium text-gray-900">
                    {company.businessType || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2">
                  <TagIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company Category</p>
                  <p className="font-medium text-gray-900">
                    {company.companyCategory || "N/A"}
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
                  <p className="text-sm text-gray-500">CIN Number</p>
                  <p className="font-medium text-gray-900">
                    {company.cinNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">MSME Number</p>
                  <p className="font-medium text-gray-900">
                    {company.msmeNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <CalendarIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Established In</p>
                  <p className="font-medium text-gray-900">
                    {company.establishedIn || "N/A"}
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
                  <p className="text-sm text-gray-500">
                    Subsidiary of Global Business
                  </p>
                  <p className="font-medium text-gray-900">
                    {company.subsidiaryOfGlobalBusiness ? "Yes" : "No"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-pink-100 p-2">
                  <MapPinIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Headquarters</p>
                  <p className="font-medium text-gray-900">
                    {company.headquartersAddress || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Section */}
          {(company.coiCertificate || company.msmeCertificate) && (
            <div className="mt-6 border-t pt-6">
              <h4 className="mb-4 font-medium text-gray-900">Certificates</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {company.coiCertificate && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">COI Certificate</p>
                      <a
                        href={company.coiCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        {company.coiCertificate}
                      </a>
                    </div>
                  </div>
                )}

                {company.msmeCertificate && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <DocumentTextIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">MSME Certificate</p>
                      <a
                        href={company.msmeCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-blue-600 hover:text-blue-800"
                      >
                        {company.msmeCertificate}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total SKU</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company.totalSKU?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Selling Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{company.averageSellingPrice?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <TagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {company.productCategory?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Marketing Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{company.marketingBudget?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selling Platforms */}
      {company.sellingOn && company.sellingOn.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5" />
              Selling Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {company?.sellingOn?.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="rounded-lg bg-gray-100 p-2">
                    <GlobeAltIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{platform.platform}</p>
                    <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all text-blue-600 hover:text-blue-800"
                  >
                    {platform.url}
                  </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media & Website */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Online Presence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {company.website && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Website</p>
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

            {company.instagramUrl && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
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
                  <p className="font-medium">Instagram</p>
                  <a
                    href={company.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all text-blue-600 hover:text-blue-800"
                  >
                    {company.instagramUrl}
                  </a>
                </div>
              </div>
            )}

            {company.facebookUrl && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
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
                  <p className="font-medium">Facebook</p>
                  <a
                    href={company.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all text-blue-600 hover:text-blue-800"
                  >
                    {company.facebookUrl}
                  </a>
                </div>
              </div>
            )}

            {company.youtubeUrl && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
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
                  <p className="font-medium">YouTube</p>
                  <a
                    href={company.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all text-blue-600 hover:text-blue-800"
                  >
                    {company.youtubeUrl}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Addresses and Brand Profiles */}
      {addresses && addresses.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5" />
              Addresses & Brand Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {addresses.map((address, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 capitalize">
                          {address.addressType} Address
                        </h5>
                        {address.isPrimary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Address:</span>
                        <span className="font-medium">
                          {address.addressLine1}
                          {address.addressLine2 && `, ${address.addressLine2}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">City:</span>
                        <span className="font-medium">{address.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">State:</span>
                        <span className="font-medium">{address.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Country:</span>
                        <span className="font-medium">{address.country}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Postal Code:
                        </span>
                        <span className="font-medium">
                          {address.postalCode}
                        </span>
                      </div>
                      {address.landmark && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Landmark:
                          </span>
                          <span className="font-medium">
                            {address.landmark}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">GST:</span>
                        <span className="font-medium">{address.gstNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">PAN:</span>
                        <span className="font-medium">{address.panNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Profiles for this address */}
                  {address.brands && address.brands.length > 0 && (
                    <div className="border-t pt-4">
                      <h5 className="mb-3 font-medium text-gray-900">
                        Brand Profiles
                      </h5>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {address.brands.map((brand, brandIndex) => (
                          <div
                            key={brandIndex}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-purple-100 p-2">
                                <TagIcon className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {brand.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Slug: {brand.slug}
                                </p>
                                {brand.aboutTheBrand && (
                                  <p className="mt-1 text-xs text-gray-600">
                                    {brand.aboutTheBrand}
                                  </p>
                                )}
                                {brand.websiteUrl && (
                                  <a
                                    href={brand.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    {brand.websiteUrl}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {company.createdAt
                    ? new Date(company.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {company.updatedAt
                    ? new Date(company.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {company.statusChangeReason && (
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
                  <p className="text-sm text-gray-500">Status Change Reason</p>
                  <p className="font-medium">{company.statusChangeReason}</p>
                </div>
              </div>
            )}

            {company.statusChangedAt && (
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status Changed At</p>
                  <p className="font-medium">
                    {new Date(company.statusChangedAt).toLocaleDateString()}
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

export default CompanyView;
