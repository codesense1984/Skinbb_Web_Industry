import { ROUTE } from "@/core/routes/constant";

const SURVEY_BASE = "/survey";
const SURVEYS = "/surveys";

export const SURVEY_ROUTES = {
  BASE: SURVEY_BASE, // /survey
  LIST: SURVEYS, // /surveys
  CREATE: ROUTE.build(SURVEY_BASE, ROUTE.seg.create), // /survey/create
  EDIT: (id: string = ROUTE.seg.id) =>
    ROUTE.build(SURVEY_BASE, id, ROUTE.seg.edit), // /survey/:id/edit
  DETAIL: (id: string = ROUTE.seg.id) => ROUTE.build(SURVEY_BASE, id), // /survey/:id
};
