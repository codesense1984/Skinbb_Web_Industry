// Survey Types based on backend models

export type SurveyStatus = "draft" | "active" | "available" | "completed";
export type SurveyType = "FLASH" | "STANDARD";
export type LocationTarget = "All" | "Metro" | "City";
export type SurveyAttemptStatus = "in_progress" | "completed" | "abandoned";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type RefundStatus = "none" | "partial" | "full";

export type QuestionType = "MCQ" | "Yes/No" | "Scaling" | "Descriptive";

export interface User {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

export interface SellerId {
  _id: string;
  companyName: string;
}

export interface SurveyTypeId {
  _id: string;
  name: string;
  displayName: string;
}

export interface PaymentInfo {
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: string | null;
  transactionId?: string | null;
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
  sellerId: SellerId;
  title: string;
  description?: string;
  brandIds: string[];
  productIds: string[];
  surveyTypeId: SurveyTypeId;
  maxQuestions: number;
  extraQuestionsCount: number;
  extraQuestionsPrice: number;
  extraQuestionsDiscount: number;
  totalPrice: number;
  reward: number; // reward coins per completed attempt
  couponId?: string | null;
  couponCode?: string | null;
  eligibleRespondentsCount: number;
  perRespondentCharge: number;
  locationTarget: LocationTarget;
  targetMetro?: string[]; // array of metro city names, required when locationTarget = "Metro"
  targetCity?: string; // required when locationTarget = "City"
  targetGender?: string[] | null;
  targetAgeMin?: number | null;
  targetAgeMax?: number | null;
  targetSkinTypes: string[];
  targetSkinConcerns: string[];
  targetHairTypes: string[];
  targetHairConcerns: string[];
  status: SurveyStatus;
  totalAttempts: number;
  completedAttempts: number;
  partialAttempts: number;
  isDeleted: boolean;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  paidAt?: string | null;
  refundedAmount: number;
  refundedAt?: string | null;
  refundStatus: RefundStatus;
  startDate?: string | null;
  endDate?: string | null;
  scheduledAt?: string | null;
  estimatedCompletionTime: number;
  createdAt: string;
  updatedAt: string;
  role?: string; // "seller" | "manufacturer" | "admin"
  type?: SurveyType; // "STANDARD" | "FLASH" | "standard" | "flash"
  questionCount?: number;
  payment?: PaymentInfo;
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

export type RespondentAction =
  | "start"
  | "submit_answer"
  | "complete"
  | "abandon";

export interface StartSurveyRequest {
  action: "start";
  surveyId: string;
  sessionId?: string; // Optional: for anonymous users (not needed for authenticated admin)
}

export interface SubmitAnswerRequest {
  action: "submit_answer";
  attemptId: string;
  questionId: string;
  answer: string | number | boolean; // Value depends on question type
  sessionId?: string; // Optional: for anonymous users (not needed for authenticated admin)
}

export interface CompleteSurveyRequest {
  action: "complete";
  attemptId: string;
  sessionId?: string; // Optional: for anonymous users (not needed for authenticated admin)
}

export interface AbandonSurveyRequest {
  action: "abandon";
  attemptId: string;
  sessionId?: string; // Optional: for anonymous users (not needed for authenticated admin)
}

export type RespondentActionRequest =
  | StartSurveyRequest
  | SubmitAnswerRequest
  | CompleteSurveyRequest
  | AbandonSurveyRequest;

// Response structure matches API specification
export interface RespondentActionResponse {
  // For "start" action
  attempt?: {
    _id: string;
    surveyId: string;
    respondentId: string | null; // null for anonymous
    sessionId?: string; // if provided
    status: SurveyAttemptStatus;
    startedAt: string;
  };
  survey?: Survey;
  questions?: Question[];

  // For "submit_answer" action
  _id?: string; // attempt ID
  answers?: SurveyAnswer[];
  currentQuestionIndex?: number;

  // For "complete" action
  status?: SurveyAttemptStatus;
  completedAt?: string;
  reward?: number;
  rewardCredited?: boolean; // false for anonymous users

  // For "abandon" action
  abandonedAt?: string;

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
