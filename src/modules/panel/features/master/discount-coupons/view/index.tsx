import { useParams } from "react-router";
import { PageContent } from "@/core/components/ui/structure";
import { Button } from "@/core/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiGetCouponById } from "@/modules/panel/services/http/coupon.service";
import { FullLoader } from "@/core/components/ui/loader";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { useNavigate } from "react-router";
import { PencilIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CouponForm } from "../shared/coupon-form";

export default function ViewDiscountCoupon() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: coupon,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["coupon", id],
    queryFn: () => apiGetCouponById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "View Discount Coupon",
          description: "Coupon details",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <FullLoader />
        </div>
      </PageContent>
    );
  }

  if (error || !coupon) {
    return (
      <PageContent
        header={{
          title: "View Discount Coupon",
          description: "Coupon details",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500">Failed to load coupon details</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "View Discount Coupon",
        description: `Details for coupon: ${coupon.data.code}`,
        actions: (
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to List
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON_EDIT(id!))
              }
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Coupon
            </Button>
          </div>
        ),
      }}
    >
      <CouponForm initialData={coupon.data} isView />
    </PageContent>
  );
}
