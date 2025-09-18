import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import { Link } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const SellerDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const stats = {
    totalProducts: 24,
    totalOrders: 156,
    totalRevenue: 12540,
    pendingOrders: 8,
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: 299.99,
      status: "Pending",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: 149.5,
      status: "Shipped",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      amount: 89.99,
      status: "Delivered",
      date: "2024-01-13",
    },
  ];

  const recentProducts = [
    { id: "PROD-001", name: "Premium Skincare Set", stock: 15, price: 199.99 },
    { id: "PROD-002", name: "Anti-Aging Cream", stock: 8, price: 89.99 },
    { id: "PROD-003", name: "Vitamin C Serum", stock: 22, price: 49.99 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={SELLER_ROUTES.PRODUCTS.CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-muted-foreground text-xs">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-muted-foreground text-xs">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-muted-foreground text-xs">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {order.id}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {order.customer}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.amount}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outlined" className="w-full" asChild>
                <Link to={SELLER_ROUTES.ORDERS.LIST}>
                  <Eye className="mr-2 h-4 w-4" />
                  View All Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${product.price}</p>
                    <p className="text-muted-foreground text-xs">
                      {product.id}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outlined" className="w-full" asChild>
                <Link to={SELLER_ROUTES.PRODUCTS.LIST}>
                  <Eye className="mr-2 h-4 w-4" />
                  View All Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
