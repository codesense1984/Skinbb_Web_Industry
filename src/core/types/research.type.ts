// export type MarketResearchStatus = "draft" | "active" | "available" | "completed";

// export interface MarketResearch {
//   id: string;
//   description: string;
//   title: string;
//   category: string;
//   startDate: string;
//   respondents: number | string;
//   cost: string;
//   status: MarketResearchStatus;
// }

import type { QuestionType } from "@/modules/panel/types/survey.types";
import type { SurveyStatus } from "@/modules/panel/types/survey.types";

export interface SurveyQuestion {
  text: string;
  description: string;
  type: QuestionType;
  options: string[];
}

export interface SurveyAudience {
  age: string[];
  location: string[];
  gender: string[];
  // interests: string[];
  skin: string[];
  concern: string[];
  skinType: string[];
  respondents: number | string;
}

export interface Survey {
  id?: string;
  title: string;
  description: string;
  category: string;
  questions: SurveyQuestion[];
  audience: SurveyAudience;
  startDate: Date | string;
  cost?: string;
  status: SurveyStatus;
}
