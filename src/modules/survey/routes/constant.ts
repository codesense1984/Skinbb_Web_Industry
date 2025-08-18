import { ROUTES } from "@/core/routes/routes.constant";

const BASE = "/survey";

export const SURVEY_ROUTES = {
  SURVEY: BASE,
  SURVEYS: "/surveys",
  CREATE: `${BASE}${ROUTES.CREATE}`,
  EDIT: (id: string | number = ":id") => `${BASE}/${id}${ROUTES.EDIT}`,
  DETAIL: (id: string | number = ":id") => `${BASE}/${id}`,
};
