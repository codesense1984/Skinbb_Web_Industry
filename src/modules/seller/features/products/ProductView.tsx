import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Package } from "lucide-react";
import { Link, useParams } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const ProductView: React.FC = () => {
  const { id } = useParams();

  // Mock data - replace with actual API call
  const product = {
    id: id || "PROD-001",
    name: "Premium Skincare Set",
    category: "Skincare",
    price: 199.99,
    stock: 15,
    status: "Active",
    description:
      "A comprehensive skincare set featuring our best-selling products for complete skin care routine.",
    images: ["/placeholder-product.jpg"],
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={SELLER_ROUTES.PRODUCTS.LIST}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Product ID: {product.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={SELLER_ROUTES.PRODUCTS.EDIT(product.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Image */}
        <Card>
          <CardContent className="p-6">
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Status
                </span>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Category
                </span>
                <span className="text-sm">{product.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Price</span>
                <span className="text-lg font-semibold">${product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Stock</span>
                <span
                  className={`text-sm ${product.stock === 0 ? "text-red-600" : "text-gray-900"}`}
                >
                  {product.stock} units
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Created
                </span>
                <span className="text-sm">{product.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Last Updated
                </span>
                <span className="text-sm">{product.updatedAt}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{product.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Update Stock
            </Button>
            <Button variant="outline">Duplicate Product</Button>
            <Button variant="outline">View Analytics</Button>
            <Button variant="outline">Share Product</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductView;
