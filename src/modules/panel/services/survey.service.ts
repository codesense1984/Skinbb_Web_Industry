import { api } from "@/core/services/http";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import type {
  AvailableSurveysParams,
  AvailableSurveysResponse,
  CreateSurveyRequest,
  CreateSurveyResponse,
  EligibleRespondentsResponse,
  EstimateEligibleRespondentsParams,
  InitiatePaymentResponse,
  MetroCitiesResponse,
  PaymentStatusResponse,
  RespondentActionRequest,
  RespondentActionResponse,
  Survey,
  SurveyAttempt,
  SurveyAttemptsParams,
  SurveyAttemptsResponse,
  SurveyDetailResponse,
  SurveyListParams,
  SurveyListResponse,
  SurveyStats,
  TargetingOptionsResponse,
  UpdateSurveyRequest,
  UpdateSurveyResponse,
  VerifyPaymentRequest,
} from "../types/survey.types";
import type { ApiResponse } from "@/core/types";

const SURVEY_BASE = ENDPOINTS.SURVEY.MAIN;
const SURVEY_TYPES_BASE = ENDPOINTS.SURVEY.TYPES;

// Survey Types API
export interface SurveyType {
  _id: string;
  name: string;
  displayName: string;
  maxQuestions: number;
  isActive: boolean;
  isDeleted: boolean;
  pricePerExtraQuestion: number | null;
  extraQuestionDiscountTiers?: Array<{
    extraQuestions: number;
    discountPercent: number;
    _id: string;
  }>;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function apiGetSurveyTypes(signal?: AbortSignal): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: SurveyType[];
}> {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: SurveyType[];
  }>(SURVEY_TYPES_BASE, {
    signal,
  });
}

// Panel APIs (Seller/Manufacturer/Admin)

export async function apiCreateSurvey(
  data: CreateSurveyRequest,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: CreateSurveyResponse;
}> {
  return api.post(`${SURVEY_BASE}/create`, data, { signal });
}

export async function apiGetSurveys(
  params?: SurveyListParams,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: SurveyListResponse;
}> {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: SurveyListResponse;
  }>(`${ENDPOINTS.SURVEY.MAIN}/list`, {
    params,
    signal,
  });
}

export async function apiGetSurveyById(
  surveyId: string,
  signal?: AbortSignal,
): Promise<ApiResponse<SurveyDetailResponse>> {
  return api.get<ApiResponse<SurveyDetailResponse>>(
    `${SURVEY_BASE}/${surveyId}`,
    { signal },
  );
}

export async function apiUpdateSurvey(
  surveyId: string,
  data: UpdateSurveyRequest,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: UpdateSurveyResponse;
}> {
  return api.put(`${SURVEY_BASE}/${surveyId}`, data, { signal });
}

export async function apiDeleteSurvey(
  surveyId: string,
  signal?: AbortSignal,
): Promise<{ statusCode: number; success: boolean; message: string }> {
  return api.delete(`${SURVEY_BASE}/${surveyId}`, { signal });
}

export async function apiGetSurveyStats(
  surveyId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: SurveyStats;
}> {
  return api.get(`${SURVEY_BASE}/${surveyId}/stats`, { signal });
}

export async function apiGetEligibleRespondents(
  surveyId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: EligibleRespondentsResponse;
}> {
  return api.get(`${SURVEY_BASE}/${surveyId}/eligible-respondents`, { signal });
}

export async function apiEstimateEligibleRespondents(
  params: EstimateEligibleRespondentsParams,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: EligibleRespondentsResponse;
}> {
  // POST /api/v1/surveys/estimate-eligible-respondents
  // Returns estimated count of eligible respondents based on location targeting criteria
  return api.post(`${SURVEY_BASE}/estimate-eligible-respondents`, params, {
    signal,
  });
}

export async function apiGetMetroCities(signal?: AbortSignal): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: MetroCitiesResponse;
}> {
  return api.get(`${SURVEY_BASE}/metro-cities`, { signal });
}

export async function apiGetTargetingOptions(signal?: AbortSignal): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: TargetingOptionsResponse;
}> {
  return api.get(`${SURVEY_BASE}/targeting-options`, { signal });
}

// Payment APIs

export async function apiInitiateSurveyPayment(
  surveyId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: InitiatePaymentResponse;
}> {
  return api.post(
    `${SURVEY_BASE}/${surveyId}/payment/initiate`,
    {},
    { signal },
  );
}

export async function apiVerifySurveyPayment(
  surveyId: string,
  data: VerifyPaymentRequest,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: { paymentStatus: string; survey: Survey };
}> {
  return api.post(`${SURVEY_BASE}/${surveyId}/payment/verify`, data, {
    signal,
  });
}

export async function apiGetSurveyPaymentStatus(
  surveyId: string,
  entityId?: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: PaymentStatusResponse & { survey?: Survey };
}> {
  const params = entityId ? { entityId } : undefined;
  return api.get(`${SURVEY_BASE}/${surveyId}/payment/status`, {
    params,
    signal,
  });
}

// Respondent/App APIs

export async function apiGetAvailableSurveys(
  params?: AvailableSurveysParams,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: AvailableSurveysResponse;
}> {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: AvailableSurveysResponse;
  }>(`${SURVEY_BASE}/available`, { params, signal });
}

export async function apiRespondentAction(
  data: RespondentActionRequest,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: RespondentActionResponse;
}> {
  return api.post(`${SURVEY_BASE}/respondent-action`, data, { signal });
}

export async function apiGetSurveyAttempt(
  attemptId: string,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: SurveyAttempt;
}> {
  return api.get(`${SURVEY_BASE}/attempts/${attemptId}`, { signal });
}

export async function apiGetMySurveyAttempts(
  params?: SurveyAttemptsParams,
  signal?: AbortSignal,
): Promise<{
  statusCode: number;
  success: boolean;
  message: string;
  data: SurveyAttemptsResponse;
}> {
  return api.get<{
    statusCode: number;
    success: boolean;
    message: string;
    data: SurveyAttemptsResponse;
  }>(`${SURVEY_BASE}/attempts`, { params, signal });
}
