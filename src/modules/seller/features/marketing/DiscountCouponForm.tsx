import { PageContent } from "@/core/components/ui/structure";
import { CouponForm } from "@/modules/panel/features/master/discount-coupons/shared/coupon-form";

export default function DiscountCouponForm() {
  return (
    <PageContent
      header={{
        title: "Create Discount Coupon",
        description: "Add a new discount coupon to your store",
        hasBack: true,
      }}
    >
      <div className="w-full">
        <CouponForm />
      </div>
    </PageContent>
  );
}
