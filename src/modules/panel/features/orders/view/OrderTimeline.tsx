import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import {
  apiGetOrderStatus,
  type OrderStatusTimelineItem,
} from "@/modules/panel/services/http/order.service";
import { formatDate, formatTime } from "@/core/utils/date";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";

interface OrderTimelineProps {
  orderId: string;
  orderNumber?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderId,
  orderNumber,
  isOpen,
  onClose,
}) => {
  const {
    data: statusResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order-status", orderId],
    queryFn: () => apiGetOrderStatus(orderId),
    enabled: isOpen && !!orderId,
    staleTime: 30_000,
  });

  const timeline = statusResponse?.data?.timeline || [];
  const currentStatus = statusResponse?.data?.currentStatus;
  const statusDescription = statusResponse?.data?.statusDescription;
  const nextStep = statusResponse?.data?.nextStep;
  const cancellationReason = statusResponse?.data?.cancellationReason;

  const formatTimelineDate = (timestamp: string) => {
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Shipment Status
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading order status...</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="mb-4 text-red-600">Error loading order status</p>
              <p className="text-sm text-gray-600">Please try again later</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && statusResponse && (
          <div className="space-y-6">
            {/* Current Status Summary */}
            {currentStatus && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Current Status:
                  </span>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {currentStatus}
                  </p>
                </div>
                {currentStatus === "cancelled" && cancellationReason && (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
                    <p className="text-xs font-medium text-red-800">
                      Cancellation Reason:
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {cancellationReason}
                    </p>
                  </div>
                )}
                {statusDescription && (
                  <p className="text-sm text-gray-700">{statusDescription}</p>
                )}
                {nextStep && (
                  <p className="mt-2 text-sm text-blue-600">{nextStep}</p>
                )}
                {orderNumber && (
                  <p className="mt-2 text-xs text-gray-500">
                    Order: {orderNumber}
                  </p>
                )}
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 ? (
              <div className="relative">
                {/* Vertical line - only show if there are multiple items */}
                {timeline.length > 1 && (
                  <div
                    className="absolute top-0 left-4 w-0.5 bg-green-500"
                    style={{ height: `${(timeline.length - 1) * 96}px` }}
                  ></div>
                )}

                <div className="space-y-6">
                  {timeline.map(
                    (item: OrderStatusTimelineItem, index: number) => {
                      const isCompleted = item.completed;
                      const { date, time } = formatTimelineDate(item.timestamp);
                      const isLast = index === timeline.length - 1;

                      return (
                        <div
                          key={index}
                          className={`relative flex items-start gap-4 ${isLast ? "" : "pb-6"}`}
                        >
                          {/* Timeline node */}
                          <div className="relative z-10 flex-shrink-0">
                            {isCompleted ? (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                                <CheckCircleIcon className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div
                              className={`${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                            >
                              <h3
                                className={`text-base font-semibold ${isCompleted ? "text-gray-900" : "text-gray-500"}`}
                              >
                                {item.title}
                              </h3>
                              <p
                                className={`mt-1 text-sm ${isCompleted ? "text-gray-700" : "text-gray-400"}`}
                              >
                                {item.description}
                              </p>
                              <p
                                className={`mt-2 text-xs ${isCompleted ? "text-gray-600" : "text-gray-400"}`}
                              >
                                {date} {time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No timeline data available</p>
              </div>
            )}

            {/* Additional Information */}
            {statusResponse.data.shipment && (
              <div className="mt-6 rounded-lg border border-gray-200 p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">
                  Shipment Details
                </h4>
                <div className="space-y-2 text-sm">
                  {statusResponse.data.shipment.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Number:</span>
                      <span className="font-medium text-gray-900">
                        {statusResponse.data.shipment.trackingNumber}
                      </span>
                    </div>
                  )}
                  {statusResponse.data.shipment.carrier && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carrier:</span>
                      <span className="font-medium text-gray-900">
                        {statusResponse.data.shipment.carrier}
                      </span>
                    </div>
                  )}
                  {statusResponse.data.shipment.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(
                          statusResponse.data.shipment.estimatedDelivery,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Inline version for displaying directly on the page
interface OrderTimelineInlineProps {
  orderId: string;
  orderNumber?: string;
}

export const OrderTimelineInline: React.FC<OrderTimelineInlineProps> = ({
  orderId,
  orderNumber,
}) => {
  const {
    data: statusResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order-status", orderId],
    queryFn: () => apiGetOrderStatus(orderId),
    enabled: !!orderId,
    staleTime: 30_000,
  });

  const timeline = statusResponse?.data?.timeline || [];
  const currentStatus = statusResponse?.data?.currentStatus;
  const statusDescription = statusResponse?.data?.statusDescription;
  const nextStep = statusResponse?.data?.nextStep;
  const cancellationReason = statusResponse?.data?.cancellationReason;

  const formatTimelineDate = (timestamp: string) => {
    return {
      date: formatDate(timestamp),
      time: formatTime(timestamp),
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error loading order status</p>
          <p className="text-sm text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!statusResponse) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status Summary */}
      {currentStatus && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600">
              Current Status:
            </span>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {currentStatus}
            </p>
          </div>
          {currentStatus === "cancelled" && cancellationReason && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
              <p className="text-xs font-medium text-red-800">
                Cancellation Reason:
              </p>
              <p className="mt-1 text-sm text-red-700">{cancellationReason}</p>
            </div>
          )}
          {statusDescription && (
            <p className="text-sm text-gray-700">{statusDescription}</p>
          )}
          {nextStep && <p className="mt-2 text-sm text-blue-600">{nextStep}</p>}
          {orderNumber && (
            <p className="mt-2 text-xs text-gray-500">Order: {orderNumber}</p>
          )}
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 ? (
        <div className="relative">
          {/* Vertical line - only show if there are multiple items */}
          {timeline.length > 1 && (
            <div
              className="absolute top-0 left-4 w-0.5 bg-green-500"
              style={{ height: `${(timeline.length - 1) * 96}px` }}
            ></div>
          )}

          <div className="space-y-6">
            {timeline.map((item: OrderStatusTimelineItem, index: number) => {
              const isCompleted = item.completed;
              const { date, time } = formatTimelineDate(item.timestamp);
              const isLast = index === timeline.length - 1;

              return (
                <div
                  key={index}
                  className={`relative flex items-start gap-4 ${isLast ? "" : "pb-6"}`}
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div
                      className={`${isCompleted ? "text-gray-900" : "text-gray-400"}`}
                    >
                      <h3
                        className={`text-base font-semibold ${isCompleted ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${isCompleted ? "text-gray-700" : "text-gray-400"}`}
                      >
                        {item.description}
                      </p>
                      <p
                        className={`mt-2 text-xs ${isCompleted ? "text-gray-600" : "text-gray-400"}`}
                      >
                        {date} {time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <p>No timeline data available</p>
        </div>
      )}

      {/* Additional Information */}
      {statusResponse.data.shipment && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Shipment Details
          </h4>
          <div className="space-y-2 text-sm">
            {statusResponse.data.shipment.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-medium text-gray-900">
                  {statusResponse.data.shipment.trackingNumber}
                </span>
              </div>
            )}
            {statusResponse.data.shipment.carrier && (
              <div className="flex justify-between">
                <span className="text-gray-600">Carrier:</span>
                <span className="font-medium text-gray-900">
                  {statusResponse.data.shipment.carrier}
                </span>
              </div>
            )}
            {statusResponse.data.shipment.estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(statusResponse.data.shipment.estimatedDelivery)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
