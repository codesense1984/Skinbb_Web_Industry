import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { ShoppingCartIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface CreateNewOrderCardProps {
  className?: string;
}

export const CreateNewOrderCard: React.FC<CreateNewOrderCardProps> = ({
  className,
}) => {
  const handleCreateOrder = () => {
    // Navigate to order creation page
    console.log("Navigate to create order page");
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-200 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-blue-200 p-4 transition-colors group-hover:bg-blue-300">
            <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-blue-900">
              Create New Order
            </h3>
            <p className="text-sm text-blue-700">
              Manually create or draft an order
            </p>
          </div>
          <Button
            onClick={handleCreateOrder}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-all group-hover:shadow-md hover:bg-blue-700"
          >
            Create Order
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
