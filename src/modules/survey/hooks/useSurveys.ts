import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  apiCreateSurvey,
  apiDeleteSurvey,
  apiGetSurveyById,
  apiGetSurveys,
  apiUpdateSurvey,
  type CreateSurveyRequest,
  type SurveyListParams,
  type UpdateSurveyRequest,
} from "../services/survey.service";
import { SURVEY_ROUTES } from "../routes/constant";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";

// Query Keys
export const SURVEY_QUERY_KEYS = {
  all: ["surveys"] as const,
  lists: () => [...SURVEY_QUERY_KEYS.all, "list"] as const,
  list: (params?: SurveyListParams) =>
    [...SURVEY_QUERY_KEYS.lists(), params] as const,
  details: () => [...SURVEY_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SURVEY_QUERY_KEYS.details(), id] as const,
  stats: (id: string) => [...SURVEY_QUERY_KEYS.detail(id), "stats"] as const,
  eligibleRespondents: (id: string) =>
    [...SURVEY_QUERY_KEYS.detail(id), "eligible-respondents"] as const,
  paymentStatus: (id: string) =>
    [...SURVEY_QUERY_KEYS.detail(id), "payment-status"] as const,
  metroCities: () => [...SURVEY_QUERY_KEYS.all, "metro-cities"] as const,
};

// List Surveys
export function useSurveys(params?: SurveyListParams) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => apiGetSurveys(params, signal),
    staleTime: 30_000,
  });
}

// Get Survey by ID
export function useSurvey(surveyId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.detail(surveyId!),
    queryFn: ({ signal }) => apiGetSurveyById(surveyId!, signal),
    enabled: enabled && !!surveyId,
    staleTime: 30_000,
  });
}

// Create Survey
export function useCreateSurvey() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");
  const getDetailRoute = (id: string) => 
    isSellerRoute 
      ? SELLER_ROUTES.MARKETING.SURVEYS.VIEW(id)
      : SURVEY_ROUTES.DETAIL(id);

  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => apiCreateSurvey(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.lists() });
      toast.success("Survey created successfully!");
      navigate(getDetailRoute(response.data.data._id));
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create survey");
    },
  });
}

// Update Survey
export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      surveyId,
      data,
    }: {
      surveyId: string;
      data: UpdateSurveyRequest;
    }) => apiUpdateSurvey(surveyId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.detail(variables.surveyId),
      });
      toast.success("Survey updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update survey");
    },
  });
}

// Delete Survey
export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");
  const listRoute = isSellerRoute 
    ? SELLER_ROUTES.MARKETING.SURVEYS.LIST 
    : SURVEY_ROUTES.LIST;

  return useMutation({
    mutationFn: (surveyId: string) => apiDeleteSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.lists() });
      toast.success("Survey deleted successfully!");
      navigate(listRoute);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete survey");
    },
  });
}

