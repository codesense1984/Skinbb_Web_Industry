import { useQuery } from "@tanstack/react-query";
import { apiGetMetroCities } from "../services/survey.service";
import { SURVEY_QUERY_KEYS } from "./useSurveys";

export function useMetroCities() {
  return useQuery({
    queryKey: SURVEY_QUERY_KEYS.metroCities(),
    queryFn: ({ signal }) => apiGetMetroCities(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes - metro cities don't change often
  });
}

