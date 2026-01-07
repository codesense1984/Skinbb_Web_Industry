import React, { useState } from "react";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import { Search, Plus, Edit, Eye, Filter, MoreHorizontal } from "lucide-react";
import { Link } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "Active" | "Inactive" | "Draft";
  image: string;
  createdAt: string;
  updatedAt: string;
}

const SellerProducts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data - replace with actual API calls
  const products: Product[] = [
    {
      id: "PROD-001",
      name: "Premium Skincare Set",
      category: "Skincare",
      price: 199.99,
      stock: 15,
      status: "Active",
      image: "/placeholder-product.jpg",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15",
    },
    {
      id: "PROD-002",
      name: "Anti-Aging Cream",
      category: "Skincare",
      price: 89.99,
      stock: 8,
      status: "Active",
      image: "/placeholder-product.jpg",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-12",
    },
    {
      id: "PROD-003",
      name: "Vitamin C Serum",
      category: "Skincare",
      price: 49.99,
      stock: 22,
      status: "Active",
      image: "/placeholder-product.jpg",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-10",
    },
    {
      id: "PROD-004",
      name: "Moisturizing Lotion",
      category: "Skincare",
      price: 29.99,
      stock: 0,
      status: "Inactive",
      image: "/placeholder-product.jpg",
      createdAt: "2024-01-03",
      updatedAt: "2024-01-08",
    },
    {
      id: "PROD-005",
      name: "Sunscreen SPF 50",
      category: "Skincare",
      price: 39.99,
      stock: 12,
      status: "Draft",
      image: "/placeholder-product.jpg",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-05",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || product.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">
            Manage your product inventory and listings.
          </p>
        </div>
        <Button asChild>
          <Link to={SELLER_ROUTES.PRODUCTS.CREATE}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
              <Button variant="outlined">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute top-2 right-2">
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="truncate text-lg font-semibold">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price}</span>
                  <span
                    className={`text-sm ${product.stock === 0 ? "text-red-600" : "text-gray-600"}`}
                  >
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outlined"
                    asChild
                    className="flex-1"
                  >
                    <Link to={SELLER_ROUTES.PRODUCTS.VIEW(product.id)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outlined"
                    asChild
                    className="flex-1"
                  >
                    <Link to={SELLER_ROUTES.PRODUCTS.EDIT(product.id)}>
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="outlined">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No products found
            </h3>
            <p className="mb-4 text-center text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first product."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button asChild>
                <Link to={SELLER_ROUTES.PRODUCTS.CREATE}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerProducts;
