import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface CreateNewProductCardProps {
  className?: string;
}

export const CreateNewProductCard: React.FC<CreateNewProductCardProps> = ({
  className,
}) => {
  const handleCreateProduct = () => {
    // Navigate to product creation page
    console.log("Navigate to create product page");
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 transition-all duration-200 hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-pink-200 p-4 transition-colors group-hover:bg-pink-300">
            <PlusIcon className="h-8 w-8 text-pink-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-pink-900">
              Create New Product
            </h3>
            <p className="text-sm text-pink-700">
              Add a new product listing to your catalog
            </p>
          </div>
          <Button
            onClick={handleCreateProduct}
            className="flex items-center gap-2 rounded-lg bg-pink-600 px-6 py-2 text-white transition-all group-hover:shadow-md hover:bg-pink-700"
          >
            Create Product
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
