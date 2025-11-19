import { useQuery } from "@tanstack/react-query";
import {
  apiGetEligibleRespondents,
  apiGetSurveyStats,
  apiEstimateEligibleRespondents,
} from "../services/survey.service";
import { SURVEY_QUERY_KEYS } from "./useSurveys";
import type { EstimateEligibleRespondentsParams } from "../types/survey.types";

export function useSurveyStats(surveyId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.stats(surveyId!),
    queryFn: ({ signal }) => apiGetSurveyStats(surveyId!, signal),
    enabled: enabled && !!surveyId,
    staleTime: 30_000,
  });
}

export function useEligibleRespondents(
  surveyId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.eligibleRespondents(surveyId!),
    queryFn: ({ signal }) => apiGetEligibleRespondents(surveyId!, signal),
    enabled: enabled && !!surveyId,
    staleTime: 30_000,
  });
}

export function useEstimateEligibleRespondents(
  params: EstimateEligibleRespondentsParams | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["survey", "estimate-eligible-respondents", params],
    queryFn: ({ signal }) => apiEstimateEligibleRespondents(params!, signal),
    enabled: enabled && !!params && !!params.locationTarget,
    staleTime: 30_000,
  });
}

