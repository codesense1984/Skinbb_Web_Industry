import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiGetSurveyPaymentStatus,
  apiInitiateSurveyPayment,
  apiVerifySurveyPayment,
  type VerifyPaymentRequest,
} from "../services/survey.service";
import { SURVEY_QUERY_KEYS } from "./useSurveys";

export function useSurveyPaymentStatus(
  surveyId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.paymentStatus(surveyId!),
    queryFn: ({ signal }) => apiGetSurveyPaymentStatus(surveyId!, signal),
    enabled: enabled && !!surveyId,
    staleTime: 30_000,
  });
}

export function useInitiateSurveyPayment() {
  return useMutation({
    mutationFn: (surveyId: string) => apiInitiateSurveyPayment(surveyId),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });
}

export function useVerifySurveyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string;
      data: VerifyPaymentRequest;
    }) => apiVerifySurveyPayment(surveyId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.paymentStatus(variables.surveyId),
      });
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.detail(variables.surveyId),
      });
      toast.success("Payment verified successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment verification failed");
    },
  });
}

