import { useParams, useNavigate } from 'react-router';
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { Badge, StatusBadge } from "@/core/components/ui/badge";
import { Avatar } from "@/core/components/ui/avatar";
import { formatDate, formatCurrency } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/solid";

const CompanyBrandView = () => {
  const { companyId, brandId } = useParams();
  const navigate = useNavigate();

  if (!companyId || !brandId) {
    return (
      <PageContent
        header={{
          title: "Brand Details",
          description: "Company ID and Brand ID are required to view brand details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company or brand ID provided.</p>
        </div>
      </PageContent>
    );
  }

  // Placeholder for brand data - will be implemented with proper API
  const brand = null;

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
            Brand details will be implemented with the proper API endpoints.
          </p>
          <p className="text-sm text-gray-400 mb-4">
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
        <div className="flex items-start gap-4 p-6 bg-white rounded-lg border">
          {brand.logoImage && (
            <Avatar
              src={brand.logoImage}
              feedback={brand.name.charAt(0)}
              className="w-16 h-16"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{brand.name}</h2>
              <StatusBadge
                status={brand.brandStatus}
                module="brand"
                variant="badge"
              >
                {brand.brandStatus}
              </StatusBadge>
            </div>
            <p className="text-gray-600 mb-4">{brand.aboutTheBrand}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Created: {formatDate(brand.createdAt)}</span>
              <span>Updated: {formatDate(brand.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Brand Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
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
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-sm">{brand.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
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
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Status Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Brand Status</label>
                <p className="text-sm">{brand.brandStatus}</p>
              </div>
              {brand.statusChangeReason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Status Reason</label>
                  <p className="text-sm">{brand.statusChangeReason}</p>
                </div>
              )}
              {brand.statusChangedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Status Changed</label>
                  <p className="text-sm">{formatDate(brand.statusChangedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="space-y-3">
            {brand.authorizationLetter && (
              <div>
                <label className="text-sm font-medium text-gray-500">Authorization Letter</label>
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
                <label className="text-sm font-medium text-gray-500">Cover Image</label>
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
    </PageContent>
  );
};

export default CompanyBrandView;
