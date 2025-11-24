import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import {
  Search,
  Eye,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { Link } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderDate: string;
  items: number;
  shippingAddress: string;
}

const SellerOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data - replace with actual API calls
  const orders: Order[] = [
    {
      id: "ORD-001",
      customerName: "John Doe",
      customerEmail: "john.doe@email.com",
      totalAmount: 299.99,
      status: "Pending",
      orderDate: "2024-01-15",
      items: 3,
      shippingAddress: "123 Main St, City, State 12345",
    },
    {
      id: "ORD-002",
      customerName: "Jane Smith",
      customerEmail: "jane.smith@email.com",
      totalAmount: 149.5,
      status: "Shipped",
      orderDate: "2024-01-14",
      items: 2,
      shippingAddress: "456 Oak Ave, City, State 12345",
    },
    {
      id: "ORD-003",
      customerName: "Bob Johnson",
      customerEmail: "bob.johnson@email.com",
      totalAmount: 89.99,
      status: "Delivered",
      orderDate: "2024-01-13",
      items: 1,
      shippingAddress: "789 Pine Rd, City, State 12345",
    },
    {
      id: "ORD-004",
      customerName: "Alice Brown",
      customerEmail: "alice.brown@email.com",
      totalAmount: 199.99,
      status: "Processing",
      orderDate: "2024-01-12",
      items: 2,
      shippingAddress: "321 Elm St, City, State 12345",
    },
    {
      id: "ORD-005",
      customerName: "Charlie Wilson",
      customerEmail: "charlie.wilson@email.com",
      totalAmount: 79.99,
      status: "Cancelled",
      orderDate: "2024-01-11",
      items: 1,
      shippingAddress: "654 Maple Dr, City, State 12345",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case "Pending":
        return ["Process", "Cancel"];
      case "Processing":
        return ["Ship", "Cancel"];
      case "Shipped":
        return ["Mark Delivered"];
      case "Delivered":
        return [];
      case "Cancelled":
        return [];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">
            Manage and track your customer orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search orders..."
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
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outlined">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{order.orderDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>
                        {order.items} item{order.items !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        ${order.totalAmount}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{order.shippingAddress}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" variant="outlined" asChild>
                    <Link to={SELLER_ROUTES.ORDERS.VIEW(order.id)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  {getStatusActions(order.status).map((action) => (
                    <Button key={action} size="sm" variant="outlined">
                      {action}
                    </Button>
                  ))}
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
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mb-4 text-center text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Orders will appear here when customers make purchases."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerOrders;
