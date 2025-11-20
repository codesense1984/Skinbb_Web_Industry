import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiGetSurveyPaymentStatus,
  apiInitiateSurveyPayment,
  apiVerifySurveyPayment,
} from "../services/survey.service";
import type { VerifyPaymentRequest } from "../types/survey.types";
import { SURVEY_QUERY_KEYS } from "./useSurveys";

export function useSurveyPaymentStatus(
  surveyId: string | undefined,
  entityId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.paymentStatus(surveyId!),
    queryFn: ({ signal }) => apiGetSurveyPaymentStatus(surveyId!, entityId, signal),
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
      // Invalidate all survey-related queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.paymentStatus(variables.surveyId),
      });
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.detail(variables.surveyId),
      });
      // Invalidate lists to update status in survey list view
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.lists(),
      });
      
      // Update the survey detail cache with the returned survey data if available
      // Response structure: { statusCode, success, message, data: { paymentStatus, survey } }
      if (response?.data?.survey) {
        queryClient.setQueryData(
          SURVEY_QUERY_KEYS.detail(variables.surveyId),
          {
            statusCode: response.statusCode,
            success: response.success,
            message: response.message,
            data: response.data.survey,
          },
        );
      }
      
      toast.success("Payment verified successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment verification failed");
    },
  });
}

