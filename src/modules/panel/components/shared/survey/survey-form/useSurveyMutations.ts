import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiCreateSurvey,
  apiUpdateSurvey,
} from "@/modules/panel/services/survey.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  SURVEY_ERROR_MESSAGES,
  SURVEY_MESSAGES,
  SURVEY_QUERY_KEYS,
} from "./survey.utils";
import type { SurveySubmitRequest } from "./types";

/**
 * Custom hook for survey creation mutation
 */
export const useSurveyCreateMutation = (navigateTo?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: SurveySubmitRequest) => {
      return apiCreateSurvey(data);
    },
    onSuccess: () => {
      toast.success(SURVEY_MESSAGES.CREATE_SUCCESS);

      // Invalidate and refetch the surveys list
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.SURVEYS_LIST(),
      });

      if (navigateTo) {
        navigate(navigateTo);
      } else {
        navigate(PANEL_ROUTES.SURVEY.LIST, {
          replace: true,
        });
      }
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error?.response?.data?.message ?? SURVEY_MESSAGES.CREATE_ERROR,
      );
    },
  });
};

/**
 * Custom hook for survey update mutation
 */
export const useSurveyUpdateMutation = (navigateTo?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, data }: SurveySubmitRequest) => {
      if (!surveyId) {
        throw new Error(SURVEY_ERROR_MESSAGES.MISSING_SURVEY_ID);
      }
      return apiUpdateSurvey(surveyId, data);
    },
    onSuccess: () => {
      toast.success(SURVEY_MESSAGES.UPDATE_SUCCESS);

      // Invalidate and refetch the surveys list
      queryClient.invalidateQueries({
        queryKey: SURVEY_QUERY_KEYS.SURVEYS_LIST(),
      });

      // Navigate back to surveys list
      if (navigateTo) {
        navigate(navigateTo);
      } else {
        navigate(PANEL_ROUTES.SURVEY.LIST, {
          replace: true,
        });
      }
    },
    onError: (error: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(
        error?.response?.data?.message ?? SURVEY_MESSAGES.UPDATE_ERROR,
      );
    },
  });
};
