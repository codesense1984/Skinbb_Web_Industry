import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { Button } from "@/core/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useInitiateSurveyPayment, useVerifySurveyPayment, useSurvey } from "@/modules/survey/hooks";
import { useRazorpayPayment } from "@/modules/survey/hooks/useRazorpayPayment";
import { razorpayKeyId } from "@/core/config/baseUrls";
import { toast } from "sonner";
import type { SurveyFormData } from "../index";

interface Step4ReviewLaunchProps {
  form: ReturnType<typeof useForm<SurveyFormData>>;
  onSubmit: () => Promise<string | null>;
  surveyId?: string;
}

const Step4ReviewLaunch = ({ form, onSubmit }: Step4ReviewLaunchProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [savedSurveyId, setSavedSurveyId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{
    amount: number;
    status: string;
    needsPayment: boolean;
  } | null>(null);

  const initiateMutation = useInitiateSurveyPayment();
  const verifyMutation = useVerifySurveyPayment();
  const { openRazorpayCheckout } = useRazorpayPayment();
  
  // Fetch saved survey to get backend-calculated totalPrice and entityId
  const { data: savedSurveyResponse } = useSurvey(savedSurveyId || undefined, !!savedSurveyId);
  const savedSurvey = savedSurveyResponse?.data;

  const formData = form.getValues();
  
  // Use payment info totalPrice if available, otherwise use backend-calculated totalPrice, or calculate estimate
  const totalPriceToPay = paymentInfo?.amount ?? savedSurvey?.totalPrice ?? (formData.questions.reduce((sum, q) => {
    return sum + (q.basePrice || 0);
  }, 0) * (formData.priceMultiplier || 1));

  // Expose dialog trigger to parent
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__triggerLaunchDialog = () => setShowConfirmDialog(true);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__triggerLaunchDialog;
    };
  }, []);

  const handleLaunch = async () => {
    setShowConfirmDialog(false);
    setIsProcessingPayment(true);
    
    try {
      // First, save the survey (create or update) and get the survey ID
      const savedId = await onSubmit();

      console.log("Saved ID:", savedId);
      
      if (!savedId) {
        setIsProcessingPayment(false);
        toast.error("Failed to save survey. Please try again.");
        return;
      }

      // Set saved survey ID to fetch backend-calculated totalPrice
      setSavedSurveyId(savedId);
      
      // Initiate payment - the backend will calculate the correct amount
      await initiatePayment(savedId);
    } catch (error) {
      console.error("Error launching survey:", error);
      setIsProcessingPayment(false);
      toast.error("Failed to launch survey. Please try again.");
    }
  };

  // Initiate payment after survey is saved
  const initiatePayment = async (surveyId: string) => {
    try {
      console.log("Initiating payment for survey:", surveyId);
      const response = await initiateMutation.mutateAsync(surveyId);
      console.log("Payment initiation response:", response);
      
      // Extract payment data from the response structure
      // Actual API response: { statusCode, success, message, data: { payment: {...}, razorpayOrder: {...} } }
      // The response from the service is: { statusCode, success, message, data: { payment, razorpayOrder } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = (response as any)?.data;
      
      if (!responseData) {
        throw new Error("Invalid payment response from server");
      }

      // Handle both possible response structures
      const payment = responseData.payment || responseData.data?.payment;
      const razorpayOrder = responseData.razorpayOrder || responseData.data?.razorpayOrder;

      if (!payment || !razorpayOrder) {
        console.error("Response structure:", responseData);
        throw new Error("Missing payment or razorpay order information");
      }

      // Extract payment details from the actual API response structure
      // Response: { statusCode, data: { payment: {...}, razorpayOrder: {...} }, message, success }
      const razorpayOrderId = razorpayOrder.id || payment.paymentDetails?.razorpayOrderId;
      const amount = razorpayOrder.amount; // Amount in paise (e.g., 250 = ₹2.50)
      const currency = razorpayOrder.currency || payment.currency || "INR";
      
      // Update payment info with the actual Razorpay amount (convert from paise to rupees for display)
      const amountInRupees = amount / 100;
      setPaymentInfo({
        amount: amountInRupees,
        status: payment.status || "pending",
        needsPayment: true,
      });
      
      // Razorpay key - check multiple possible locations in response
      // Fallback to environment variable if backend doesn't provide it
      const razorpayKey = 
        responseData.razorpayKey || 
        payment.razorpayKey || 
        payment.paymentDetails?.razorpayKey ||
        responseData.razorpay?.key ||
        razorpayKeyId; // Fallback to environment variable
      
      console.log("Extracted payment info:", {
        razorpayOrderId,
        amount,
        currency,
        hasKey: !!razorpayKey,
        keySource: responseData.razorpayKey ? "response" : payment.razorpayKey ? "payment" : "env",
      });

      // Validate payment info
      if (!razorpayOrderId || !amount) {
        console.error("Missing payment fields:", {
          hasOrderId: !!razorpayOrderId,
          hasAmount: !!amount,
          responseData,
        });
        throw new Error("Missing payment order information. Please ensure the survey has a valid cost.");
      }

      if (!razorpayKey) {
        console.error("Razorpay key not found. Checked response, payment object, and environment variable.");
        throw new Error("Razorpay configuration missing. Please contact support.");
      }

      // Open Razorpay checkout
      openRazorpayCheckout({
        orderId: razorpayOrderId,
        amount: amount, // Amount in paise
        currency: currency,
        key: razorpayKey,
        name: "SkinBB Survey Payment",
        description: `Payment for survey: ${formData.title}`,
        onSuccess: async (paymentResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            console.log("Payment successful, verifying...", paymentResponse);
            await verifyMutation.mutateAsync({
              surveyId: surveyId,
              data: {
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
            });
            setShowSuccessScreen(true);
            setIsProcessingPayment(false);
            toast.success("Payment completed successfully! Survey will go live in 24 hours.");
          } catch (error) {
            console.error("Payment verification failed:", error);
            setIsProcessingPayment(false);
            const errorMessage = error instanceof Error ? error.message : "Payment verification failed. Please contact support.";
            toast.error(errorMessage);
          }
        },
        onError: (error: Error) => {
          console.error("Razorpay payment error:", error);
          setIsProcessingPayment(false);
          toast.error(error.message || "Payment failed");
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      setIsProcessingPayment(false);
      let errorMessage = "Failed to initiate payment";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        errorMessage = axiosError?.response?.data?.message || axiosError?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  if (showSuccessScreen) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircleIcon className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Survey Successfully Launched</h2>
          <p className="text-gray-600">
            Your survey has been launched successfully and will go live in 24 hours.
          </p>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">{formatCurrency(totalPriceToPay)}</span>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Note: You will receive a confirmation email shortly. Thank you for your patience.
              </p>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={() => {
            const isSellerRoute = window.location.pathname.includes("/marketing/surveys");
            if (isSellerRoute) {
              window.location.href = "/marketing/surveys";
            } else {
              window.location.href = "/surveys";
            }
          }}
        >
          View Survey Report
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Title</div>
                <p className="text-lg font-semibold">{formData.title}</p>
              </div>
              {formData.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <p className="text-sm">{formData.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <p className="text-sm capitalize">{formData.type}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Location Target</div>
                  <p className="text-sm">
                    {formData.locationTarget}
                    {formData.locationTarget === "Metro" && formData.targetMetro
                      ? `: ${formData.targetMetro}`
                      : ""}
                    {formData.locationTarget === "City" && formData.targetCity
                      ? `: ${formData.targetCity}`
                      : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Survey Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        Q{index + 1}. {question.questionText}
                      </h4>
                      <span className="text-xs text-gray-500 capitalize">
                        {question.type}
                      </span>
                    </div>
                    {question.type === "MCQ" && question.options && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                        <ul className="list-disc list-inside text-sm">
                          {question.options.map((opt, optIndex) => (
                            <li key={optIndex}>{opt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {question.type === "Scaling" && (
                      <p className="text-xs text-gray-500 mt-2">
                        Scale: {question.scaleMin} - {question.scaleMax}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Estimated Cost</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalPriceToPay)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reward per Completion</p>
                <p className="text-lg font-semibold">{formData.reward || 0} coins</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Survey Type</p>
                <p className="text-sm font-medium capitalize">{formData.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium">
                  {formData.locationTarget}
                  {formData.locationTarget === "Metro" && formData.targetMetro
                    ? `: ${formData.targetMetro}`
                    : ""}
                  {formData.locationTarget === "City" && formData.targetCity
                    ? `: ${formData.targetCity}`
                    : ""}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-1">Total Price to be paid</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalPriceToPay)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <StatusBadge module="payment" status="pending" variant="badge">
                  Pending
                </StatusBadge>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Survey will go live after payment is completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={() => setShowConfirmDialog(true)}>
        Launch Survey
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Survey Launch</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to launch this survey. You&apos;ll be redirected to complete the payment ({formatCurrency(totalPriceToPay)}). Once payment is completed, the survey will go live in 24 hours. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessingPayment || initiateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLaunch}
              disabled={isProcessingPayment || initiateMutation.isPending}
            >
              {isProcessingPayment || initiateMutation.isPending 
                ? "Processing..." 
                : "Proceed to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Show loading state while processing */}
      {isProcessingPayment && !showSuccessScreen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div>
                <p className="font-semibold">Processing Payment</p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we prepare your payment...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Step4ReviewLaunch;

