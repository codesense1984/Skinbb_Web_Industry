import { PageContent } from "@/core/components/ui/structure";
import { PromotionForm } from "../shared/promotion-form";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGetPromotionById } from "@/modules/panel/services/http/promotion.service";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { FullLoader } from "@/core/components/ui/loader";

const PromotionEdit = () => {
  const { id } = useParams<{ id: string }>();

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
          title: "Edit Promotion",
          description: "Update promotion details",
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

  return (
    <PageContent
      header={{
        title: "Edit Promotion",
        description: "Update promotion details",
      }}
    >
      <PromotionForm initialData={data.data} isEdit={true} isView={false} />
    </PageContent>
  );
};

export default PromotionEdit;

