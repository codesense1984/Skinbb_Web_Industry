import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { PageContent } from "@/core/components/ui/structure";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Textarea } from "@/core/components/ui/textarea";
import { Input } from "@/core/components/ui/input";
import {
  apiGetOrderDetails,
  apiCancelOrderByAdmin,
  apiRefundOrderByAdmin,
  apiGetOrderStatus,
} from "@/modules/panel/services/http/order.service";
import type { OrderDetails } from "@/modules/panel/types/order.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  CalendarIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { formatDate, formatTime } from "@/core/utils/date";
import { formatCurrency } from "@/core/utils/number";
import { OrderTimelineInline } from "./OrderTimeline";

export default function OrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [refundNotes, setRefundNotes] = useState("");

  const {
    data: orderResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-details", id],
    queryFn: () => apiGetOrderDetails(id!),
    enabled: !!id,
  });

  // Also fetch order status to get the most current status
  const {
    data: statusResponse,
  } = useQuery({
    queryKey: ["order-status", id],
    queryFn: () => apiGetOrderStatus(id!),
    enabled: !!id,
  });

  const order = orderResponse?.data as OrderDetails | undefined;
  // Use currentStatus from status API if available, otherwise fall back to orderStatus
  const currentOrderStatus = statusResponse?.data?.currentStatus || order?.orderStatus;

  const cancelOrderMutation = useMutation({
    mutationFn: (reason: string) => apiCancelOrderByAdmin(id!, { reason }),
    onSuccess: (response) => {
      toast.success(response.data.message || "Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
      queryClient.invalidateQueries({ queryKey: ["order-status", id] });
      setIsCancelDialogOpen(false);
      setCancelReason("");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to cancel order. Please try again.",
      );
    },
  });

  const handleCancelOrder = () => {
    if (cancelReason.trim()) {
      cancelOrderMutation.mutate(cancelReason.trim());
    }
  };

  const refundOrderMutation = useMutation({
    mutationFn: (data: {
      amount?: number;
      reason: string;
      notes?: { [key: string]: string };
      receipt?: string;
    }) => apiRefundOrderByAdmin(id!, data),
    onSuccess: (response) => {
      toast.success(response.data.message || "Refund initiated successfully");
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
      queryClient.invalidateQueries({ queryKey: ["order-status", id] });
      setIsRefundDialogOpen(false);
      setRefundReason("");
      setRefundAmount("");
      setRefundNotes("");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to initiate refund. Please try again.",
      );
    },
  });

  const handleRefundOrder = () => {
    if (refundReason.trim()) {
      const refundData: {
        amount?: number;
        reason: string;
        notes?: { [key: string]: string };
        receipt?: string;
      } = {
        reason: refundReason.trim(),
      };

      // If amount is specified, use it (API expects amount in base currency unit)
      // If not specified, API will process full refund
      if (refundAmount && typeof refundAmount === "number" && refundAmount > 0) {
        // Ensure amount doesn't exceed order total
        const maxAmount = order.totalAmount;
        refundData.amount = Math.min(refundAmount, maxAmount);
      }

      if (refundNotes.trim()) {
        refundData.notes = {
          notes: refundNotes.trim(),
        };
      }

      refundData.receipt = `Refund-${order.orderNumber}`;

      refundOrderMutation.mutate(refundData);
    }
  };

  // Orders cannot be cancelled if they are already cancelled, shipped, delivered, or refunded
  const canCancelOrder =
    order &&
    currentOrderStatus !== "cancelled" &&
    currentOrderStatus !== "shipped" &&
    currentOrderStatus !== "delivered" &&
    order.paymentStatus !== "refunded";

  // Check if order can be refunded (only for delivered orders, not already refunded)
  // Show refund button only when:
  // 1. Shipment status is "delivered" (not pending, placed, shipped, cancelled, or refunded)
  // 2. Payment status is not "refunded"
  const canRefundOrder =
    !!order &&
    currentOrderStatus?.toLowerCase() === "delivered" &&
    order.paymentStatus !== "refunded";

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Fetching order details",
        }}
      >
        <div className="w-full">
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-4 text-red-600">Error loading order details</p>
                <p className="text-sm text-gray-600">Order ID: {id}</p>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-background flex items-center gap-4 rounded-md p-4 shadow-md">
            <div className="w-full flex flex-col">
              <p className="text-sm font-medium text-gray-600">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
              <span className="text-sm font-bold text-blue-600">#</span>
            </div>
          </div>

          <div className="bg-background flex items-center gap-4 rounded-md p-4 shadow-md">
            <div className="w-full flex flex-col">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-200">
              <span className="text-sm font-bold text-green-600">₹</span>
            </div>
          </div>

          <div className="bg-background flex items-center gap-4 rounded-md p-4 shadow-md">
            <div className="w-full flex flex-col">
              <p className="text-sm font-medium text-gray-600">Order Status</p>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold text-gray-900 capitalize">{order.orderStatus}</p>
                {order.orderStatus === "cancelled" && (
                  order.cancellationReason || 
                  (order as any).cancelReason || 
                  (order as any).cancellation_reason || 
                  (order as any).cancel_reason
                ) && (
                  <p className="text-xs text-gray-600 italic">
                    Reason: {
                      order.cancellationReason || 
                      (order as any).cancelReason || 
                      (order as any).cancellation_reason || 
                      (order as any).cancel_reason
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-200">
              <span className="text-sm font-bold text-purple-600">📦</span>
            </div>
          </div>

          <div className="bg-background flex items-center gap-4 rounded-md p-4 shadow-md">
            <div className="w-full flex flex-col">
              <p className="text-sm font-medium text-gray-600">Payment</p>
              <p className="text-xl font-bold text-gray-900 uppercase">
                {typeof order.payment === "string" 
                  ? order.payment 
                  : order.payment?.paymentGateway || order.payment?.paymentMethod || "N/A"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200">
              <CreditCardIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Order Info & Customer */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Order Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-sm font-medium text-gray-600">
                  Order Date
                </span>
                <span className="text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-sm font-medium text-gray-600">
                  Order Time
                </span>
                <span className="text-sm text-gray-900">
                  {formatTime(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-sm font-medium text-gray-600">
                  Payment Status
                </span>
                <Badge variant="outline" className="capitalize">
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentStatus === "refunded" && (
                <div className="flex items-center justify-between border-b border-gray-100 py-3">
                  <span className="text-sm font-medium text-gray-600">
                    Refund Status
                  </span>
                  <Badge variant="outline" className="capitalize bg-green-50 text-green-700 border-green-200">
                    Refunded
                  </Badge>
                </div>
              )}
              {order.orderStatus === "cancelled" && (
                order.cancellationReason || 
                (order as any).cancelReason || 
                (order as any).cancellation_reason || 
                (order as any).cancel_reason
              ) && (
                <div className="flex items-start justify-between border-b border-gray-100 py-3">
                  <span className="text-sm font-medium text-gray-600">
                    Cancellation Reason
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-[60%]">
                    {
                      order.cancellationReason || 
                      (order as any).cancelReason || 
                      (order as any).cancellation_reason || 
                      (order as any).cancel_reason
                    }
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-600">
                  Items Count
                </span>
                <span className="text-sm text-gray-900">
                  {order.items?.length || 0} items
                </span>
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
              <div className="mb-6 flex items-center space-x-4">
                {order.customer?.profilePic?.url ? (
                  <img
                    src={order.customer.profilePic.url}
                    alt={order.customer.name || "Customer"}
                    className="h-14 w-14 rounded-full border-2 border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200">
                    <span className="text-lg font-medium text-gray-500">
                      {(order.customer?.name || "C")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {order.customer?.name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.customer?.phoneNumber || "N/A"}
                  </p>
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
                <div
                  key={item?._id || index}
                  className="flex items-center space-x-4 rounded-lg border bg-gray-50 p-4"
                >
                  <div className="flex h-18 w-18 items-center justify-center rounded-lg border bg-white">
                    {item?.thumbnail && item.thumbnail.length > 0 ? (
                      <img
                        src={item.thumbnail[0]}
                        alt={item.productName || "Product"}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900">
                      {item?.productName || "Unknown Product"}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Qty: {item?.quantity || 0}</span>
                        {item?.sku && <span>SKU: {item.sku}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item?.price || 0)}
                        </span>
                        {item?.salesPrice && item.salesPrice > 0 && (
                          <div className="mt-1 text-xs text-green-600">
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

        {/* Payment Summary, Shipping Address & Billing Address - Merged Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                  <span className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
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
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 text-sm text-gray-500">
                  <span>Customer Payment:</span>
                  <span>{formatCurrency(order.customerPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <p className="text-lg font-medium text-gray-900">
                  {order.shippingAddress?.fullName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress?.phoneNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress?.street || "N/A"}
                </p>
                {order.shippingAddress?.landmark && (
                  <p className="text-sm text-gray-600">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {order.shippingAddress?.city || "N/A"},{" "}
                  {order.shippingAddress?.state || "N/A"},{" "}
                  {order.shippingAddress?.country || "N/A"} -{" "}
                  {order.shippingAddress?.postalCode || "N/A"}
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
                <p className="text-lg font-medium text-gray-900">
                  {order.billingAddress?.fullName || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress?.phoneNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress?.street || "N/A"}
                </p>
                {order.billingAddress?.landmark && (
                  <p className="text-sm text-gray-600">
                    Landmark: {order.billingAddress.landmark}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {order.billingAddress?.city || "N/A"},{" "}
                  {order.billingAddress?.state || "N/A"},{" "}
                  {order.billingAddress?.country || "N/A"} -{" "}
                  {order.billingAddress?.postalCode || "N/A"}
                </p>
                <Badge variant="outline" className="mt-3 text-xs">
                  {order.billingAddress?.label || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipment Status Timeline - At the bottom */}
        {id && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Shipment Status
                </CardTitle>
                <div className="flex items-center gap-2">
                  {canRefundOrder && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={() => setIsRefundDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Issue Refund
                    </Button>
                  )}
                  {canCancelOrder && (
                    <Button
                      variant="outlined"
                      color="destructive"
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <OrderTimelineInline
                orderId={id}
                orderNumber={order.orderNumber}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? Please provide a reason for cancellation.
              <br />
              <span className="text-sm font-medium text-red-600 mt-1 block">
                Note: Orders that are shipped or delivered cannot be cancelled.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="cancel-reason"
                className="text-sm font-medium text-gray-700"
              >
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancel-reason"
                placeholder="Enter the reason for cancellation (e.g., Customer requested cancellation)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            {cancelOrderMutation.isError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {cancelOrderMutation.error instanceof Error
                  ? cancelOrderMutation.error.message
                  : "Failed to cancel order. Please try again."}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outlined"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={cancelOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="destructive"
              onClick={handleCancelOrder}
              disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
              loading={cancelOrderMutation.isPending}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Order Dialog */}
      {order && (
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Refund</DialogTitle>
              <DialogDescription>
                Initiate a Razorpay refund for this order. The refund will be processed through Razorpay.
                <br />
                <span className="text-sm font-medium text-orange-600 mt-1 block">
                  Note: Only Razorpay payments can be refunded. Leave amount empty for full refund.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="refund-amount"
                  className="text-sm font-medium text-gray-700"
                >
                  Refund Amount (₹)
                  <span className="text-gray-500 text-xs ml-1">
                    (Leave empty for full refund: {formatCurrency(order.totalAmount)})
                  </span>
                </label>
                <Input
                  id="refund-amount"
                  type="number"
                  placeholder="Enter refund amount"
                  value={refundAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRefundAmount(value === "" ? "" : parseFloat(value));
                  }}
                  min="0"
                  max={order.totalAmount}
                  step="0.01"
                />
              </div>
            <div className="space-y-2">
              <label
                htmlFor="refund-reason"
                className="text-sm font-medium text-gray-700"
              >
                Refund Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="refund-reason"
                placeholder="Enter the reason for refund (e.g., Customer requested refund)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="refund-notes"
                className="text-sm font-medium text-gray-700"
              >
                Additional Notes (Optional)
              </label>
              <Textarea
                id="refund-notes"
                placeholder="Enter any additional notes or case information"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            {refundOrderMutation.isError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {refundOrderMutation.error instanceof Error
                  ? refundOrderMutation.error.message
                  : "Failed to initiate refund. Please try again."}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outlined"
              onClick={() => {
                setIsRefundDialogOpen(false);
                setRefundReason("");
                setRefundAmount("");
                setRefundNotes("");
              }}
              disabled={refundOrderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="warning"
              onClick={handleRefundOrder}
              disabled={!refundReason.trim() || refundOrderMutation.isPending}
              loading={refundOrderMutation.isPending}
            >
              Initiate Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </PageContent>
  );
}
