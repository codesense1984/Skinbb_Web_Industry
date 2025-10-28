import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { 
  TagIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface AddDiscountCouponCardProps {
  className?: string;
}

export const AddDiscountCouponCard: React.FC<AddDiscountCouponCardProps> = ({ className }) => {
  const handleAddCoupon = () => {
    // Navigate to coupon creation page
    console.log("Navigate to add coupon page");
  };

  return (
    <Card className={cn("bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200 cursor-pointer group", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-green-200 rounded-full group-hover:bg-green-300 transition-colors">
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 group-hover:shadow-md transition-all"
          >
            Add Coupon
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
