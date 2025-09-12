import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { CouponForm } from "../shared/coupon-form";
import { useQuery } from "@tanstack/react-query";
import { apiGetCouponById } from "@/modules/panel/services/http/coupon.service";
import { FullLoader } from "@/core/components/ui/loader";

export default function EditDiscountCoupon() {
  const { id } = useParams<{ id: string }>();

  const { data: coupon, isLoading, error } = useQuery({
    queryKey: ["coupon", id],
    queryFn: () => apiGetCouponById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Edit Discount Coupon",
          description: "Update coupon details",
        }}
      >
        <div className="flex justify-center items-center h-64">
          <FullLoader />
        </div>
      </PageContent>
    );
  }

  if (error || !coupon) {
    return (
      <PageContent
        header={{
          title: "Edit Discount Coupon",
          description: "Update coupon details",
        }}
      >
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load coupon details</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Edit Discount Coupon",
        description: `Update details for coupon: ${coupon.data.code}`,
      }}
    >
      <div className="w-full">
        <CouponForm initialData={coupon.data} isEdit />
      </div>
    </PageContent>
  );
}
