import { PageContent } from "@/core/components/ui/structure";
import { PromotionForm } from "@/modules/panel/features/promotions/shared/promotion-form";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGetPromotionById } from "@/modules/panel/services/http/promotion.service";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { FullLoader } from "@/core/components/ui/loader";
import { Button } from "@/core/components/ui/button";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils/date";

const PromotionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: [ENDPOINTS.PROMOTION.GET_BY_ID(id!)],
    queryFn: () => apiGetPromotionById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <FullLoader />;
  }

  if (error || !data?.data) {
    return (
      <PageContent
        header={{
          title: "View Promotion",
          description: "Promotion details",
        }}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error
            ? "Failed to load promotion. Please try again."
            : "Promotion not found."}
        </div>
      </PageContent>
    );
  }

  const promotion = data.data;

  return (
    <PageContent
      header={{
        title: promotion.title,
        description: promotion.subtitle || "Promotion details",
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => navigate(SELLER_ROUTES.MARKETING.PROMOTIONS.EDIT(id!))}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(SELLER_ROUTES.MARKETING.PROMOTIONS.LIST)}
            >
              Back to List
            </Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Image Preview */}
        {promotion.imageUrl && (
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-2 font-semibold">Promotion Image</h3>
            <img
              src={promotion.imageUrl}
              alt={promotion.imageAltText || promotion.title}
              className="h-auto max-w-full rounded"
            />
          </div>
        )}

        {/* Form in View Mode */}
        <PromotionForm initialData={promotion} isEdit={false} isView={true} />

        {/* Additional Info */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 font-semibold">Additional Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <StatusBadge
                  module="promotion"
                  status={promotion.isActive ? "active" : "inactive"}
                  variant="badge"
                >
                  {promotion.isActive ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Promotion For
              </label>
              <div className="mt-1 text-sm text-gray-900 capitalize">
                {promotion.promotionFor}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created At
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {formatDate(promotion.createdAt)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Updated At
              </label>
              <div className="mt-1 text-sm text-gray-900">
                {formatDate(promotion.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
};

export default PromotionView;

