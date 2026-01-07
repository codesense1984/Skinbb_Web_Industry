import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { TagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface AddDiscountCouponCardProps {
  className?: string;
}

export const AddDiscountCouponCard: React.FC<AddDiscountCouponCardProps> = ({
  className,
}) => {
  const handleAddCoupon = () => {
    // Navigate to coupon creation page
    console.log("Navigate to add coupon page");
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-green-100 transition-all duration-200 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-green-200 p-4 transition-colors group-hover:bg-green-300">
            <TagIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-green-900">
              Add Discount Coupon
            </h3>
            <p className="text-sm text-green-700">
              Create a new coupon or promo code
            </p>
          </div>
          <Button
            onClick={handleAddCoupon}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-all group-hover:shadow-md hover:bg-green-700"
          >
            Add Coupon
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
