import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetOrderDetails } from "@/modules/panel/services/http/order.service";
import type { OrderDetails } from "@/modules/panel/types/order.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon, PhoneIcon, MapPinIcon, CreditCardIcon, ShoppingBagIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { formatDate, formatTime } from "@/core/utils/date";
import { formatCurrency } from "@/core/utils/number";

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ["order-details", id],
    queryFn: () => apiGetOrderDetails(id!),
    enabled: !!id,
  });

  const order = orderResponse?.data as OrderDetails | undefined;

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Fetching order details",
        }}
      >
        <div className="w-full">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading order details...</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !order) {
    return (
      <PageContent
        header={{
          title: "Error",
          description: "Failed to load order details",
        }}
      >
        <div className="w-full">
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error loading order details</p>
                <p className="text-gray-600 text-sm">Order ID: {id}</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Order Details",
        description: `Order ${order.orderNumber}`,
        actions: (
          <Button
            variant="outlined"
            onClick={() => navigate(PANEL_ROUTES.ORDER.LIST)}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        ),
      }}
    >
      <div className="w-full space-y-8">
        {/* Compact Order Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Order Number</p>
                  <p className="text-xl font-bold text-blue-900">{order.orderNumber}</p>
                </div>
                <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">#</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Amount</p>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Order Status</p>
                  <Badge variant="outline" className="capitalize text-sm font-medium">
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">📦</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Payment</p>
                  <p className="text-sm font-bold text-orange-900 uppercase">{order.payment}</p>
                </div>
                <div className="h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <CreditCardIcon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Info & Customer & Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Order Date</span>
                <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Order Time</span>
                <span className="text-sm text-gray-900">{formatTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Payment Status</span>
                <Badge variant="outline" className="capitalize">
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-gray-600">Items Count</span>
                <span className="text-sm text-gray-900">{order.items?.length || 0} items</span>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCardIcon className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between py-3 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.totalDiscount)}</span>
                </div>
              )}
              {order.totalCouponDiscount > 0 && (
                <div className="flex justify-between py-3 text-green-600">
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(order.totalCouponDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 pt-2">
                <span>Customer Payment:</span>
                <span>{formatCurrency(order.customerPayment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>


          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneIcon className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                {order.customer?.profilePic?.url ? (
                  <img
                    src={order.customer.profilePic.url}
                    alt={order.customer.name || "Customer"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                    <span className="text-gray-500 text-lg font-medium">
                      {(order.customer?.name || "C")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 text-lg">{order.customer?.name || "N/A"}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.customer?.phoneNumber || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Ordered */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBagIcon className="h-5 w-5" />
              Products Ordered ({order.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(order.items || []).map((item, index) => (
                <div key={item?._id || index} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                  <div className="w-18 h-18 bg-white rounded-lg flex items-center justify-center border">
                    {item?.thumbnail && item.thumbnail.length > 0 ? (
                      <img
                        src={item.thumbnail[0]}
                        alt={item.productName || "Product"}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2">
                      {item?.productName || "Unknown Product"}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Qty: {item?.quantity || 0}</span>
                        {item?.sku && <span>SKU: {item.sku}</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 text-sm">
                          {formatCurrency(item?.price || 0)}
                        </span>
                        {item?.salesPrice && item.salesPrice > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Sale: {formatCurrency(item.salesPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCardIcon className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.totalDiscount > 0 && (
                <div className="flex justify-between py-3 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.totalDiscount)}</span>
                </div>
              )}
              {order.totalCouponDiscount > 0 && (
                <div className="flex justify-between py-3 text-green-600">
                  <span>Coupon Discount:</span>
                  <span>-{formatCurrency(order.totalCouponDiscount)}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 pt-2">
                <span>Customer Payment:</span>
                <span>{formatCurrency(order.customerPayment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPinIcon className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-gray-900 text-lg">{order.shippingAddress?.fullName || "N/A"}</p>
                <p className="text-gray-600 text-sm">{order.shippingAddress?.phoneNumber || "N/A"}</p>
                <p className="text-gray-600 text-sm">{order.shippingAddress?.street || "N/A"}</p>
                {order.shippingAddress?.landmark && (
                  <p className="text-gray-600 text-sm">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p className="text-gray-600 text-sm">
                  {order.shippingAddress?.city || "N/A"}, {order.shippingAddress?.state || "N/A"}, {order.shippingAddress?.country || "N/A"} - {order.shippingAddress?.postalCode || "N/A"}
                </p>
                <Badge variant="outline" className="mt-3 text-xs">
                  {order.shippingAddress?.label || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPinIcon className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-gray-900 text-lg">{order.billingAddress?.fullName || "N/A"}</p>
                <p className="text-gray-600 text-sm">{order.billingAddress?.phoneNumber || "N/A"}</p>
                <p className="text-gray-600 text-sm">{order.billingAddress?.street || "N/A"}</p>
                {order.billingAddress?.landmark && (
                  <p className="text-gray-600 text-sm">Landmark: {order.billingAddress.landmark}</p>
                )}
                <p className="text-gray-600 text-sm">
                  {order.billingAddress?.city || "N/A"}, {order.billingAddress?.state || "N/A"}, {order.billingAddress?.country || "N/A"} - {order.billingAddress?.postalCode || "N/A"}
                </p>
                <Badge variant="outline" className="mt-3 text-xs">
                  {order.billingAddress?.label || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}