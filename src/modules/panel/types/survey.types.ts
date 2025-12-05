// Survey Types based on backend models

export type SurveyStatus = "draft" | "active" | "available" | "completed";
export type SurveyType = "FLASH" | "STANDARD";
export type LocationTarget = "All" | "Metro" | "City";
export type SurveyAttemptStatus = "in_progress" | "completed" | "abandoned";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type RefundStatus = "none" | "partial" | "full";

export type QuestionType =
  | "SINGLE_CHOICE"
  | "YES/NO"
  | "RATING"
  | "TEXT"
  | "MULTIPLE_CHOICE"; // Keeping old types for backward compatibility

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

export interface SurveyDetailQuestion {
  _id: string;
  surveyId: string;
  questionText: string;
  questionTypeId: QuestionTypeId;
  basePrice: number;
  options: any[];
  scaleMin: number;
  scaleMax: number;
  order: number;
  isRequired: boolean;
  isDeleted: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
  scaleLabel: {
    min: string;
    max: string;
  };
}

export interface QuestionTypeId {
  _id: string;
  name: string;
  displayName: string;
}

export interface SurveyDetailResponse {
  survey: Survey;
  // questions: SurveyDetailQuestion[];
}

export interface CreateSurveyResponse {
  survey: Survey;
  questions: Question[];
}

export interface UpdateSurveyResponse {
  survey: Survey;
  questions: Question[];
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
  maxResponses: number;
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
  targetAgeRanges?: AgeRange[];
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
  // questions?: Question[]; // included when fetching attempt details
  questions?: SurveyDetailQuestion[];
  // included when fetching attempt details
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
  breakdown: {
    totalUsers: number;
    afterLocation: number;
    afterGender: number;
    afterAge: number;
    afterSkinType: number;
    afterSkinConcerns: number;
    afterHairType: number;
    afterHairConcerns: number;
    finalCount: number;
  };
  estimatedCost: {
    eligibleRespondentsCount: number;
    effectiveRespondentsCount: number;
    maxResponses: number;
    totalCost: number;
    costBreakdown: {
      questions: Record<string, number>;
      extraQuestions: Record<string, number>;
      rewards: Record<string, number>;
      perRespondentCharge: Record<string, number>;
      coupon: Record<string, number>;
      subtotal: Record<string, number>;
      total: Record<string, number>;
    };
    priceCalculation: Record<string, unknown>;
  };
  surveyId?: string;
}

export interface AgeRange {
  min: number;
  max: number;
  label?: string;
}

export interface EstimateEligibleRespondentsParams {
  locationTarget?: "All" | "Metro" | "City";
  targetMetro?: string[];
  targetCity?: string;
  targetGender?: "male" | "female" | "unisex";
  targetAgeRanges?: AgeRange[];
  targetSkinTypes?: string[];
  targetSkinConcerns?: string[];
  targetHairTypes?: string[];
  targetHairConcerns?: string[];
  questions?: Array<{
    questionTypeId: string;
  }>;
  reward?: number;
  maxResponses?: number;
}

export interface MetroCitiesResponse {
  metroCities: string[];
}

export interface TargetingOptionsResponse {
  skinTypes: string[];
  skinConcerns: string[];
  hairTypes: string[];
  hairConcerns: string[];
}

// API Request/Response Types

export interface EstimatedCompletionTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CreateSurveyQuestion {
  questionText: string;
  type: QuestionType;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabel?: {
    min?: string;
    max?: string;
  };
  isRequired: boolean;
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  type: SurveyType;
  priceMultiplier?: number;
  reward?: number;
  locationTarget: LocationTarget;
  targetMetro?: string[];
  targetCity?: string;
  brandIds?: string[];
  productIds?: string[];
  targetGender?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetAgeRanges?: AgeRange[];
  targetSkinTypes?: string[];
  targetSkinConcerns?: string[];
  targetHairTypes?: string[];
  targetHairConcerns?: string[];
  maxResponses?: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  status?: SurveyStatus;
  estimatedCompletionTime?: EstimatedCompletionTime;
  questions: CreateSurveyQuestion[];
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

export interface PaymentDetails {
  razorpayOrderId: string;
  receipt: string;
  paymentType: string;
  surveyTitle: string;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  couponId: string | null;
}

export interface Payment {
  surveyId: string;
  entityType: string;
  entityId: string;
  createdBy: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  status: PaymentStatus;
  transactionId: string | null;
  providerOrderId: string;
  isCaptured: boolean;
  capturedAt: string | null;
  paidAt: string | null;
  paymentDetails: PaymentDetails;
  refundedAmount: number;
  refundedAt: string | null;
  metadata: Record<string, unknown>;
  paymentType: string;
  description: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface RazorpayOrder {
  id: string;
  amount: number; // Amount in paise
  currency: string;
  status: string;
  key: string;
}

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  total: number;
  couponApplied: string | null;
}

export interface InitiatePaymentResponse {
  payment: Payment;
  razorpayOrder: RazorpayOrder;
  priceBreakdown: PriceBreakdown;
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
