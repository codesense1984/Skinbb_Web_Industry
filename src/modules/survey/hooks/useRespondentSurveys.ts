import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiGetAvailableSurveys,
  apiGetMySurveyAttempts,
  apiGetSurveyAttempt,
  apiRespondentAction,
  type AvailableSurveysParams,
  type RespondentActionRequest,
  type SurveyAttemptsParams,
} from "../services/survey.service";

// Query Keys for Respondent
export const RESPONDENT_SURVEY_QUERY_KEYS = {
  all: ["respondent-surveys"] as const,
  available: (params?: AvailableSurveysParams) =>
    [...RESPONDENT_SURVEY_QUERY_KEYS.all, "available", params] as const,
  attempts: (params?: SurveyAttemptsParams) =>
    [...RESPONDENT_SURVEY_QUERY_KEYS.all, "attempts", params] as const,
  attempt: (id: string) =>
    [...RESPONDENT_SURVEY_QUERY_KEYS.all, "attempt", id] as const,
};

// Get Available Surveys
export function useAvailableSurveys(params?: AvailableSurveysParams) {
  return useQuery({
    queryKey: RESPONDENT_SURVEY_QUERY_KEYS.available(params),
    queryFn: ({ signal }) => apiGetAvailableSurveys(params, signal),
    staleTime: 30_000,
  });
}

// Get My Survey Attempts
export function useMySurveyAttempts(params?: SurveyAttemptsParams) {
  return useQuery({
    queryKey: RESPONDENT_SURVEY_QUERY_KEYS.attempts(params),
    queryFn: ({ signal }) => apiGetMySurveyAttempts(params, signal),
    staleTime: 30_000,
  });
}

// Get Survey Attempt by ID
export function useSurveyAttempt(attemptId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: RESPONDENT_SURVEY_QUERY_KEYS.attempt(attemptId!),
    queryFn: ({ signal }) => apiGetSurveyAttempt(attemptId!, signal),
    enabled: enabled && !!attemptId,
    staleTime: 30_000,
  });
}

// Respondent Action (start, submit_answer, complete, abandon)
export function useRespondentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RespondentActionRequest) => apiRespondentAction(data),
    onSuccess: (response, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: RESPONDENT_SURVEY_QUERY_KEYS.available(),
      });
      queryClient.invalidateQueries({
        queryKey: RESPONDENT_SURVEY_QUERY_KEYS.attempts(),
      });

      // If we have an attempt ID, invalidate that specific attempt
      if ("attemptId" in variables) {
        queryClient.invalidateQueries({
          queryKey: RESPONDENT_SURVEY_QUERY_KEYS.attempt(variables.attemptId),
        });
      }

      // Show success message for completion
      if (variables.action === "complete") {
        const reward = response.data.attempt?.reward || 0;
        toast.success(`Survey completed! You earned ${reward} coins!`);
      } else if (variables.action === "abandon") {
        toast.info("Survey abandoned");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Action failed");
    },
  });
}

