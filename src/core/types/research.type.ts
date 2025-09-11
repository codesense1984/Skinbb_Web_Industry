export type MarketResearchStatus = "active" | "draft" | "closed";

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

export enum SurveyQuestionType {
  yes_no = "yes/no",
  multiple_choice = "multiple choice",
  single_choice = "single choice",
}

export interface SurveyQuestion {
  text: string;
  description: string;
  type: SurveyQuestionType;
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
  status: MarketResearchStatus;
}
