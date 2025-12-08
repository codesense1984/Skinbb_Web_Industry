import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { AlertCircle, CreditCard, Zap } from "lucide-react";
import { useSubscriptionPlans } from "../../hooks/useSubscriptionPlans";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiInitiatePayment,
  apiVerifyPayment,
} from "../../services/http/subscription.service";
import { ENDPOINTS } from "../../config/endpoint.config";
import { toast } from "sonner";
import { useSubscription } from "../../hooks/useSubscription";
import type { VerifyPaymentRequest } from "../../types/subscription.types";
import { loadRazorpayScript } from "../../utils/razorpay";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  message?: string;
  requiredCredits?: number;
  availableCredits?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  message,
  requiredCredits,
  availableCredits,
}: UpgradeModalProps) {
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { refresh: refreshSubscription } = useSubscription();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  // Load Razorpay script when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript()
        .then(() => setRazorpayLoaded(true))
        .catch(() => {
          toast.error("Failed to load payment gateway");
        });
    }
  }, [isOpen]);

  // Add styles to ensure Razorpay modal is clickable
  useEffect(() => {
    if (razorpayOpen) {
      // Add style to ensure Razorpay elements are above everything
      const style = document.createElement('style');
      style.id = 'razorpay-override';
      style.textContent = `
        .razorpay-container,
        .razorpay-checkout-frame,
        [id^="razorpay"],
        iframe[src*="razorpay"] {
          z-index: 99999 !important;
          pointer-events: auto !important;
        }
        [data-slot="dialog-overlay"] {
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById('razorpay-override');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [razorpayOpen]);

  const initiatePaymentMutation = useMutation({
    mutationFn: (planId: string) => apiInitiatePayment(planId),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: ({
      planId,
      paymentData,
    }: {
      planId: string;
      paymentData: VerifyPaymentRequest;
    }) => apiVerifyPayment(planId, paymentData),
  });

  const handlePurchase = async (planId: string) => {
    try {
      setProcessing(true);
      setSelectedPlanId(planId);

      const response = await initiatePaymentMutation.mutateAsync(planId);

      // If free plan, subscription is already created
      if (response.data.isFreePlan) {
        toast.success("Free plan assigned successfully!");
        await refreshSubscription();
        queryClient.invalidateQueries({
          queryKey: [ENDPOINTS.SUBSCRIPTION.CURRENT],
        });
        onClose();
        return;
      }

      const { razorpayOrder, plan } = response.data;

      if (!razorpayOrder || !window.Razorpay) {
        toast.error("Payment gateway not available");
        setProcessing(false);
        return;
      }

      // Close dialog first
      onClose();
      setRazorpayOpen(true);

      // Store handler function
      const paymentHandler = async (paymentResponse: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          setProcessing(true);
          const verifyResponse = await verifyPaymentMutation.mutateAsync({
            planId,
            paymentData: {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            },
          });

          toast.success("Payment verified and subscription activated!");
          await refreshSubscription();
          queryClient.invalidateQueries({
            queryKey: [ENDPOINTS.SUBSCRIPTION.CURRENT],
          });
          setRazorpayOpen(false);
        } catch (error: any) {
          console.error("Payment verification failed:", error);
          toast.error(
            error?.message || "Payment verification failed. Please contact support.",
          );
          setRazorpayOpen(false);
        } finally {
          setProcessing(false);
        }
      };

      // Wait for dialog to fully close and DOM to update
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Open Razorpay payment gateway
          const options = {
            key: razorpayOrder.key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order_id: razorpayOrder.id,
            name: "Skinbb",
            description: `Subscription: ${plan?.name || "Plan"}`,
            handler: paymentHandler,
            prefill: {
              name: "User",
              email: "user@example.com",
              contact: "9999999999",
            },
            theme: {
              color: "#3399cc",
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
                setSelectedPlanId(null);
                setRazorpayOpen(false);
              },
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        });
      });
    } catch (error: any) {
      console.error("Purchase failed:", error);
      toast.error(error?.message || "Failed to initiate purchase");
    } finally {
      setProcessing(false);
    }
  };

  // Filter out free plans
  const paidPlans = plans.filter((plan) => plan.planType !== "free");

  return (
    <Dialog 
      open={isOpen && !razorpayOpen} 
      onOpenChange={(open) => !open && !razorpayOpen && onClose()}
    >
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={razorpayOpen ? { display: 'none' } : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            {requiredCredits !== undefined
              ? "Insufficient Credits"
              : "Subscription Required"}
          </DialogTitle>
          <DialogDescription>
            {message ||
              (requiredCredits !== undefined
                ? `You need ${requiredCredits} credits but only have ${availableCredits} credits.`
                : "You need a subscription to access this feature.")}
          </DialogDescription>
        </DialogHeader>

        {requiredCredits !== undefined && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800">Credits Required</p>
                <p className="text-sm text-yellow-600">
                  {requiredCredits} credits needed
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-yellow-800">Available</p>
                <p className="text-sm text-yellow-600">
                  {availableCredits} credits
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold">Available Plans</h3>

          {plansLoading ? (
            <div className="text-center py-8">Loading plans...</div>
          ) : paidPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No plans available
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {paidPlans.map((plan) => {
                const isProcessing = processing && selectedPlanId === plan._id;

                return (
                  <div
                    key={plan._id}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-lg">{plan.name}</h4>
                      <p className="text-sm text-gray-500">
                        {plan.description || `${plan.planType} plan`}
                      </p>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          ₹{plan.price}
                        </span>
                        {plan.planType !== "free" && (
                          <span className="text-sm text-gray-500">
                            /{plan.planType === "monthly" ? "month" : "year"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <Zap className="inline h-4 w-4 mr-1" />
                        {plan.credits.toLocaleString()} credits
                      </div>
                    </div>

                    <div className="mb-3 space-y-1 text-sm">
                      {plan.modules?.length > 0 && (
                        <div>
                          <p className="font-medium">Modules:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {plan.modules.map((module, idx) => (
                              <li key={idx}>{module.page}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {plan.features?.length > 0 && (
                        <div>
                          <p className="font-medium">Features:</p>
                          <ul className="list-disc list-inside text-gray-600">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx}>
                                {feature.page}.{feature.action}
                                {feature.creditCost > 0 && (
                                  <span className="text-xs">
                                    {" "}
                                    ({feature.creditCost} credits)
                                  </span>
                                )}
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{plan.features.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      color="primary"
                      onClick={() => handlePurchase(plan._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : plan.price === 0 ? (
                        "Get Free Plan"
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Purchase Plan
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

