import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { 
  PlusIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";

interface CreateNewProductCardProps {
  className?: string;
}

export const CreateNewProductCard: React.FC<CreateNewProductCardProps> = ({ className }) => {
  const handleCreateProduct = () => {
    // Navigate to product creation page
    console.log("Navigate to create product page");
  };

  return (
    <Card className={cn("bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all duration-200 cursor-pointer group", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-pink-200 rounded-full group-hover:bg-pink-300 transition-colors">
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
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 group-hover:shadow-md transition-all"
          >
            Create Product
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
