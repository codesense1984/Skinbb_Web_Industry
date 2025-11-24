// Survey Constants and Enums

export const SURVEY_ENTITY_TYPES = ["seller", "manufacturer", "admin"] as const;
export type SurveyEntityType = (typeof SURVEY_ENTITY_TYPES)[number];

export const SURVEY_TYPES = ["flash", "standard"] as const;
export type SurveyType = (typeof SURVEY_TYPES)[number];

export const SURVEY_STATUSES = ["draft", "active", "paused", "completed"] as const;
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export const LOCATION_TARGETS = ["All", "Metro", "City"] as const;
export type LocationTarget = (typeof LOCATION_TARGETS)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const QUESTION_TYPES = ["MCQ", "Yes/No", "Scaling", "Descriptive"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const ATTEMPT_STATUSES = ["in_progress", "completed", "abandoned"] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const SURVEY_ACTIONS = [
  "start",
  "submit_answer",
  "submit_bulk_answers",
  "complete",
  "abandon",
] as const;
export type SurveyAction = (typeof SURVEY_ACTIONS)[number];

// Question Type Base Prices
export const QUESTION_TYPE_BASE_PRICES = {
  MCQ: 10,
  "Yes/No": 5,
  Scaling: 8,
  Descriptive: 15,
} as const;

// Metro Cities
export const METRO_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
] as const;

// Constraints
export const SURVEY_CONSTRAINTS = {
  flashSurveyMaxQuestions: 5,
  priceMultiplierMin: 0.1,
  priceMultiplierDefault: 1.0,
  rewardMin: 0,
  questionOrderMin: 1,
  scalingMin: 1,
  scalingMax: 10,
} as const;

// Defaults
export const SURVEY_DEFAULTS = {
  surveyType: "standard" as SurveyType,
  surveyStatus: "draft" as SurveyStatus,
  locationTarget: "All" as LocationTarget,
  paymentStatus: "pending" as PaymentStatus,
  attemptStatus: "in_progress" as AttemptStatus,
  priceMultiplier: 1.0,
  reward: 0,
  isRequired: true,
  scaleMin: 1,
  scaleMax: 10,
} as const;




