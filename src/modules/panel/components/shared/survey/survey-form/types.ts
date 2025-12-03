import { MODE } from "@/core/types";
import type {
  CreateSurveyRequest,
  Survey,
} from "@/modules/panel/types/survey.types";
import type { transformSurveyFormDataToSurvey } from "./survey.utils";

/**
 * Base props shared across survey form components
 */
export interface SurveyFormBaseProps {
  mode: MODE;
  surveyId?: string;
}

/**
 * Survey submit handler - generic type for form submissions
 */
export type SurveySubmitRequest<
  T = ReturnType<typeof transformSurveyFormDataToSurvey>,
> = {
  surveyId?: string;
  data: T;
};

export type SurveySubmitHandler<
  T = ReturnType<typeof transformSurveyFormDataToSurvey>,
> = (params: SurveySubmitRequest<T>) => void;

/**
 * Props for survey form component
 * onSubmit accepts SurveySubmitHandler with transformed Survey data
 */
export interface SurveyFormProps extends SurveyFormBaseProps {
  title: string;
  description: string;
  onSubmit?: SurveySubmitHandler;
  submitting?: boolean;
}

/**
 * @deprecated Use SurveyFormProps instead. Kept for backward compatibility.
 */
export type UnifiedSurveyFormProps = SurveyFormProps;

/**
 * Survey API response type
 */
export interface SurveyApiResponse extends Survey {}
