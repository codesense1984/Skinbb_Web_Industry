import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { formatDate } from "@/core/utils";
import { useSellerAuth } from "@/modules/auth/hooks/useSellerAuth";
import { apiGetCompanyLocationBrandById } from "@/modules/panel/services/http/company.service";
import {
  CalendarIcon,
  GlobeAltIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { SELLER_ROUTES } from "../routes/constant";

const SellerBrandView: React.FC = () => {
  const { companyId, locationId, brandId } = useParams();
  const navigate = useNavigate();
  const {
    sellerInfo,
    isLoading: sellerLoading,
    isError: sellerError,
    getCompanyId,
    getPrimaryAddress,
  } = useSellerAuth();

  // Get companyId and locationId from params or seller auth
  const finalCompanyId = companyId || getCompanyId();
  const finalLocationId = locationId || getPrimaryAddress()?.addressId;

  // Fetch brand data using the correct API
  const {
    data: brandData,
    isLoading: brandLoading,
    error: brandError,
  } = useQuery({
    queryKey: ["brand", finalCompanyId, finalLocationId, brandId],
    queryFn: () =>
      apiGetCompanyLocationBrandById(
        finalCompanyId!,
        finalLocationId!,
        brandId!,
      ),
    enabled: !!finalCompanyId && !!finalLocationId && !!brandId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If no brandId, redirect to brands list
  if (!brandId) {
    navigate(
      SELLER_ROUTES.BRAND.LIST +
        `?companyId=${finalCompanyId}&locationId=${finalLocationId}`,
    );
    return null;
  }

  if (!finalCompanyId || !finalLocationId) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description:
            "Company ID and Location ID are required to view brand details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">
            Invalid company or location ID provided.
          </p>
        </div>
      </PageContent>
    );
  }

  if (sellerLoading || brandLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading brand information...</p>
        </div>
      </div>
    );
  }

  if (sellerError || !sellerInfo || brandError || !brandData?.data) {
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
            Failed to load brand information
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  const brand = brandData.data;

  return (
    <PageContent
      header={{
        title: "Brand Details",
        description: `View details for ${brand.name || "Unknown Brand"}`,
        actions: (
          <div className="flex gap-2">
            <Button
              onClick={() =>
                navigate(
                  // SELLER_ROUTES.BRAND.LIST(finalCompanyId!, finalLocationId!),
                  SELLER_ROUTES.BRAND.LIST +
                    `?companyId=${finalCompanyId}&locationId=${finalLocationId}`,
                )
              }
              variant="outlined"
              className="border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Brands
            </Button>
            <Button
              onClick={() =>
                navigate(
                  SELLER_ROUTES.BRAND.EDIT +
                    `?companyId=${finalCompanyId}&locationId=${finalLocationId}&brandId=${brandId}`,
                )
              }
              variant="outlined"
              className="border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {brand.logoImage && (
                <div className="flex-shrink-0">
                  <img
                    src={brand.logoImage}
                    alt={`${brand.name} logo`}
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-foreground text-2xl font-bold">
                    {brand.name}
                  </h1>
                  <StatusBadge
                    module="brand"
                    variant="contained"
                    status={brand.status || ""}
                  />
                </div>
                {brand.aboutTheBrand && (
                  <p className="mt-2 text-sm text-gray-600">
                    {brand.aboutTheBrand}
                  </p>
                )}
                {brand.websiteUrl && (
                  <a
                    href={brand.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <GlobeAltIcon className="mr-1 h-4 w-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Information */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Brand Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Brand Name
                  </p>
                  <p className="font-medium text-gray-900">{brand.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Slug</p>
                  <p className="font-medium text-gray-900">{brand.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Status Changed
                  </p>
                  <p className="font-medium text-gray-900">
                    {brand.statusChangedAt
                      ? formatDate(brand.statusChangedAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-100 p-2">
                  <TagIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {brand.status}
                  </p>
                </div>
              </div>
            </div>
            {brand.statusChangeReason && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  <strong>Status Change Reason:</strong>{" "}
                  {brand.statusChangeReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default SellerBrandView;
