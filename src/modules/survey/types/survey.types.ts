// Survey Types based on backend models

export type SurveyStatus = "draft" | "active" | "paused" | "completed";
export type SurveyType = "flash" | "standard";
export type LocationTarget = "All" | "Metro" | "City";
export type QuestionType = "MCQ" | "Yes/No" | "Scaling" | "Descriptive";
export type SurveyAttemptStatus = "in_progress" | "completed" | "abandoned";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface User {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface Question {
  _id?: string;
  surveyId?: string;
  order: number;
  questionText: string;
  type: QuestionType;
  basePrice?: number;
  isRequired: boolean;
  options?: string[]; // for MCQ
  scaleMin?: number; // for Scaling
  scaleMax?: number; // for Scaling
  scaleLabel?: {
    min?: string;
    max?: string;
  };
  defaultAnswer?: string | number | boolean;
  isDeleted?: boolean;
}

export interface Survey {
  _id: string;
  createdBy: User;
  entityType: "seller" | "manufacturer" | "admin";
  entityId: string;
  title: string;
  description?: string;
  type: SurveyType;
  status: SurveyStatus;
  priceMultiplier?: number;
  totalPrice: number;
  reward: number; // reward coins per completed attempt
  locationTarget: LocationTarget;
  targetCity?: string; // required when locationTarget = "City"
  targetMetro?: string; // required when locationTarget = "Metro"
  totalAttempts: number;
  completedAttempts: number;
  partialAttempts: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  questions?: Question[]; // included when fetching survey details
}

export interface SurveyAnswer {
  questionId: string;
  answer: string | number | boolean; // type depends on question.type
  answeredAt?: string;
}

export interface SurveyAttempt {
  _id: string;
  surveyId: string;
  respondentId: User;
  status: SurveyAttemptStatus;
  answers: SurveyAnswer[];
  currentQuestionIndex: number;
  reward: number;
  rewardCredited: boolean;
  rewardCreditedAt?: string;
  startedAt: string;
  completedAt?: string;
  abandonedAt?: string;
  survey?: Survey; // included when fetching attempt details
  questions?: Question[]; // included when fetching attempt details
}

export interface SurveyStats {
  totalAttempts: number;
  completedAttempts: number;
  partialAttempts: number;
  completionRate: number; // percentage
  averageCompletionTime: number; // seconds
}

export interface EligibleRespondentsResponse {
  count: number;
  surveyId?: string;
}

export interface EstimateEligibleRespondentsParams {
  locationTarget: LocationTarget;
  targetMetro?: string;
  targetCity?: string;
}

export interface MetroCitiesResponse {
  metroCities: string[];
}

// API Request/Response Types

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  type: SurveyType;
  priceMultiplier?: number;
  reward?: number;
  locationTarget: LocationTarget;
  targetCity?: string;
  targetMetro?: string;
  status?: SurveyStatus;
  questions: Omit<Question, "_id" | "surveyId" | "isDeleted">[];
}

export interface UpdateSurveyRequest extends Partial<CreateSurveyRequest> {
  _id?: string;
}

export interface SurveyListParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: SurveyStatus;
  type?: SurveyType;
}

export interface SurveyListResponse {
  surveys: Survey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AvailableSurveysParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  type?: SurveyType;
  status?: SurveyStatus;
}

export interface AvailableSurvey extends Survey {
  isInProgress?: boolean;
  inProgressAttemptId?: string;
}

export interface AvailableSurveysResponse {
  surveys: AvailableSurvey[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Respondent Action Types

export type RespondentAction = "start" | "submit_answer" | "complete" | "abandon";

export interface StartSurveyRequest {
  action: "start";
  surveyId: string;
}

export interface SubmitAnswerRequest {
  action: "submit_answer";
  attemptId: string;
  questionId: string;
  answer: string | number | boolean;
}

export interface CompleteSurveyRequest {
  action: "complete";
  attemptId: string;
}

export interface AbandonSurveyRequest {
  action: "abandon";
  attemptId: string;
}

export type RespondentActionRequest =
  | StartSurveyRequest
  | SubmitAnswerRequest
  | CompleteSurveyRequest
  | AbandonSurveyRequest;

export interface RespondentActionResponse {
  attempt?: SurveyAttempt;
  survey?: Survey;
  questions?: Question[];
  message?: string;
}

// Payment Types

export interface InitiatePaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayKey: string;
  paymentId?: string;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentStatusResponse {
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paidAt?: string;
  totalPrice: number;
}

// Survey Attempts List

export interface SurveyAttemptsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  status?: SurveyAttemptStatus;
}

export interface SurveyAttemptsResponse {
  attempts: SurveyAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

