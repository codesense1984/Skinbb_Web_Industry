import { ROUTE } from "@/core/routes/constant";

const SURVEY_BASE = "/surveys";

export const APP_USER_SURVEY_ROUTES = {
  BASE: SURVEY_BASE,
  AVAILABLE: SURVEY_BASE, // /surveys
  TAKE: (surveyId: string = ROUTE.seg.id) =>
    ROUTE.build(SURVEY_BASE, surveyId, "take"), // /surveys/:id/take
  MY_ATTEMPTS: ROUTE.build(SURVEY_BASE, "my-attempts"), // /surveys/my-attempts
  ATTEMPT_DETAIL: (attemptId: string = ROUTE.seg.id) =>
    ROUTE.build(SURVEY_BASE, "attempts", attemptId), // /surveys/attempts/:id
} as const;

