import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { formatDate } from "@/core/utils/date";
import { useSurveyPaymentStatus, useInitiateSurveyPayment, useVerifySurveyPayment } from "@/modules/survey/hooks";
import { FullLoader } from "@/core/components/ui/loader";
import { toast } from "sonner";
import type { Survey } from "@/modules/survey/types/survey.types";
import { CreditCardIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRazorpayPayment } from "@/modules/survey/hooks/useRazorpayPayment";

interface SurveyPaymentTabProps {
  survey: Survey;
}

const SurveyPaymentTab = ({ survey }: SurveyPaymentTabProps) => {
  const { data: paymentData, isLoading } = useSurveyPaymentStatus(survey._id);
  const initiateMutation = useInitiateSurveyPayment();
  const verifyMutation = useVerifySurveyPayment();
  const { openRazorpayCheckout } = useRazorpayPayment();

  if (isLoading) {
    return <FullLoader />;
  }

  const paymentStatus = paymentData?.data?.data?.paymentStatus || survey.paymentStatus;
  const totalPrice = paymentData?.data?.data?.totalPrice || survey.totalPrice;
  const paidAt = paymentData?.data?.data?.paidAt || survey.paidAt;

  const handlePayNow = async () => {
    try {
      const response = await initiateMutation.mutateAsync(survey._id);
      const paymentInfo = response.data.data;

      // Open Razorpay checkout
      openRazorpayCheckout({
        orderId: paymentInfo.razorpayOrderId,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        key: paymentInfo.razorpayKey,
        name: "SkinBB Survey Payment",
        description: `Payment for survey: ${survey.title}`,
        onSuccess: async (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyMutation.mutateAsync({
              surveyId: survey._id,
              data: paymentResponse,
            });
          } catch (error) {
            console.error("Payment verification failed:", error);
          }
        },
        onError: (error: Error) => {
          toast.error(error.message || "Payment failed");
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Total Price
              </label>
              <p className="text-lg font-semibold">{formatCurrency(totalPrice)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Payment Status
              </label>
              <div className="mt-1">
                <StatusBadge
                  module="payment"
                  status={paymentStatus}
                  variant="badge"
                >
                  {paymentStatus}
                </StatusBadge>
              </div>
            </div>
            {paidAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Paid At
                </label>
                <p className="text-sm font-medium">{formatDate(paidAt)}</p>
              </div>
            )}
          </div>

          {paymentStatus === "pending" && (
            <div className="pt-4 border-t">
              <Button
                onClick={handlePayNow}
                disabled={initiateMutation.isPending}
                className="w-full"
              >
                {initiateMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          )}

          {paymentStatus === "paid" && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <p className="font-medium">Payment completed successfully</p>
              </div>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-red-600 mb-2">
                Payment failed. Please try again.
              </p>
              <Button onClick={handlePayNow} disabled={initiateMutation.isPending}>
                Retry Payment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyPaymentTab;

