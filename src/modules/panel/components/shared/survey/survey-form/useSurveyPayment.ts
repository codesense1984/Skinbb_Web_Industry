import { razorpayKeyId } from "@/core/config/baseUrls";
import {
  apiInitiateSurveyPayment,
  apiVerifySurveyPayment,
} from "@/modules/panel/services/survey.service";
import type {
  InitiatePaymentResponse,
  Survey,
  VerifyPaymentRequest,
} from "@/modules/panel/types/survey.types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRazorpayPayment } from "./useRazorpayPayment";

interface UseSurveyPaymentOptions {
  onPaymentSuccess?: (survey: Survey) => void;
  onPaymentError?: (error: Error) => void;
}

interface UseSurveyPaymentReturn {
  initiatePayment: (surveyId: string) => Promise<void>;
  isProcessing: boolean;
  isRazorpayReady: boolean;
}

/**
 * Hook to handle complete survey payment flow
 * Handles payment initiation, Razorpay checkout, and verification
 */
export function useSurveyPayment(
  options?: UseSurveyPaymentOptions,
): UseSurveyPaymentReturn {
  const {
    isRazorpayLoaded,
    openRazorpayCheckout,
    isLoading: isRazorpayLoading,
  } = useRazorpayPayment();

  // Mutation for initiating payment
  const initiatePaymentMutation = useMutation({
    mutationFn: async (surveyId: string) => {
      const response = await apiInitiateSurveyPayment(surveyId);
      return response.data;
    },
  });

  // Mutation for verifying payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({
      surveyId,
      paymentData,
    }: {
      surveyId: string;
      paymentData: VerifyPaymentRequest;
    }) => {
      const response = await apiVerifySurveyPayment(surveyId, paymentData);
      return response.data;
    },
  });

  const initiatePayment = async (surveyId: string): Promise<void> => {
    try {
      // Step 1: Initiate payment
      const paymentData: InitiatePaymentResponse =
        await initiatePaymentMutation.mutateAsync(surveyId);

      // Extract payment details from new nested structure
      const razorpayOrderId = paymentData.razorpayOrder.id;
      const amount = paymentData.razorpayOrder.amount; // Amount in paise
      const currency = paymentData.razorpayOrder.currency || "INR";
      // Use key from API response, fallback to environment variable
      const razorpayKey = razorpayKeyId || "";
      const surveyTitle = paymentData.payment.paymentDetails.surveyTitle;

      // Validate that we have a Razorpay key
      if (!razorpayKey) {
        throw new Error(
          "Razorpay key is missing. Please check your configuration.",
        );
      }

      // Step 2: Open Razorpay checkout
      const razorpayResponse = await openRazorpayCheckout({
        key: razorpayKey,
        amount: amount, // Amount in paise
        currency: currency,
        name: "Survey Payment",
        description: surveyTitle || `Payment for Survey: ${surveyId}`,
        order_id: razorpayOrderId,
        theme: {
          color: "#6366f1", // indigo-500
        },
      });

      // Step 3: Verify payment
      const verifyData: VerifyPaymentRequest = {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      };

      const verificationResult = await verifyPaymentMutation.mutateAsync({
        surveyId,
        paymentData: verifyData,
      });

      // Payment successful
      toast.success("Payment completed successfully!");
      options?.onPaymentSuccess?.(verificationResult.survey);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Payment failed. Please try again.";

      // Show appropriate toast based on error type
      if (errorMessage.includes("cancelled")) {
        toast.info("Payment was cancelled");
      } else {
        toast.error(errorMessage);
      }

      options?.onPaymentError?.(error);
    }
  };

  const isProcessing =
    initiatePaymentMutation.isPending ||
    verifyPaymentMutation.isPending ||
    isRazorpayLoading;

  return {
    initiatePayment,
    isProcessing,
    isRazorpayReady: isRazorpayLoaded,
  };
}
