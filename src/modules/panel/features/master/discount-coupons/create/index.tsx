import { PageContent } from "@/core/components/ui/structure";
import { CouponForm } from "../shared/coupon-form";

export default function CreateDiscountCoupon() {
  return (
    <PageContent
      header={{
        title: "Create Discount Coupon",
        description: "Add a new discount coupon to your store",
      }}
    >
      <div className="w-full">
        <CouponForm />
      </div>
    </PageContent>
  );
}
