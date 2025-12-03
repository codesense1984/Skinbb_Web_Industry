import { MASTER_DATA } from "@/core/config/constants";
import type {
  QuestionType,
  SurveyDetailResponse,
} from "@/modules/panel/types/survey.types";
import type { SurveyFormData } from "./survey.schema";

/**
 * Transforms SurveyFormData to API request format
 * @param data - The survey form data
 * @returns API request object with transformed data
 */
export const transformSurveyFormDataToSurvey = (data: SurveyFormData): any => {
  const audience = data.audience || {};

  // Convert selected age groups to targetAgeRanges format
  let targetAgeRanges: Array<{ min: number; max: number }> | undefined;
  if (audience.age && Array.isArray(audience.age) && audience.age.length > 0) {
    const ageGroups = MASTER_DATA.ageGroup.filter((ag) =>
      (audience.age as string[]).includes(ag.label),
    );
    if (ageGroups.length > 0) {
      targetAgeRanges = ageGroups.map((ag) => ({
        min: ag.min,
        max: ag.max,
      }));
    }
  }

  // Convert dates to ISO strings
  const startDate =
    data.startDate instanceof Date
      ? data.startDate.toISOString()
      : typeof data.startDate === "string"
        ? new Date(data.startDate).toISOString()
        : new Date().toISOString();

  const endDate =
    data.endDate instanceof Date
      ? data.endDate.toISOString()
      : typeof data.endDate === "string"
        ? new Date(data.endDate).toISOString()
        : new Date().toISOString();

  // Convert respondents string to number
  const maxResponses = audience.respondents;

  // Map questions to API format
  const questions = data.questions.map((q) => {
    const apiType = q.type;
    const questionData: any = {
      questionText: q.text,
      type: q.type,
      isRequired: q.isRequired ?? true,
    };

    // Add options for MCQ
    if (
      ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(apiType) &&
      q.options &&
      q.options.length > 0
    ) {
      questionData.options = q.options;
    }

    // Add scale fields for Scaling type
    if (apiType === "RATING") {
      if (q.scaleMin !== undefined) {
        questionData.scaleMin = parseInt(q.scaleMin, 10);
      }
      if (q.scaleMax !== undefined) {
        questionData.scaleMax = parseInt(q.scaleMax, 10);
      }
      if (q.scaleLabel) {
        questionData.scaleLabel = {
          min: q.scaleLabel.min || "",
          max: q.scaleLabel.max || "",
        };
      }
    }

    return questionData;
  });

  // Build the API request object
  const request: any = {
    title: data.title,
    description: data.description,
    surveyType: data.type,
    locationTarget: audience.locationTarget || "All",
    startDate: startDate,
    endDate: endDate,
    status: "draft",
    questions: questions,
  };

  if (maxResponses && !isNaN(maxResponses) && maxResponses > 0) {
    request.maxResponses = maxResponses;
  }

  // Location targeting
  if (audience.locationTarget === "Metro" && audience.targetMetro) {
    request.targetMetro = audience.targetMetro;
  } else if (audience.locationTarget === "City" && audience.targetCity) {
    request.targetCity = audience.targetCity;
  }

  // Gender targeting
  if (audience.targetGender) {
    request.targetGender = audience.targetGender;
  }

  // Age targeting
  if (targetAgeRanges && targetAgeRanges.length > 0) {
    request.targetAgeRanges = targetAgeRanges;
  }

  // Skin targeting
  if (audience.targetSkinTypes && audience.targetSkinTypes.length > 0) {
    request.targetSkinTypes = audience.targetSkinTypes;
  }
  if (audience.targetSkinConcerns && audience.targetSkinConcerns.length > 0) {
    request.targetSkinConcerns = audience.targetSkinConcerns;
  }

  // Hair targeting
  if (audience.targetHairTypes && audience.targetHairTypes.length > 0) {
    request.targetHairTypes = audience.targetHairTypes;
  }
  if (audience.targetHairConcerns && audience.targetHairConcerns.length > 0) {
    request.targetHairConcerns = audience.targetHairConcerns;
  }

  // Estimated completion time
  if (data.estimatedCompletionTime) {
    request.estimatedCompletionTime = {
      hours: data.estimatedCompletionTime.hours || 0,
      minutes: data.estimatedCompletionTime.minutes || 1,
      seconds: data.estimatedCompletionTime.seconds || 0,
    };
  } else {
    // Default to 1 minute if not provided
    request.estimatedCompletionTime = {
      hours: 0,
      minutes: 1,
      seconds: 0,
    };
  }

  // Optional fields that might not be in form
  // These can be added later or set to defaults
  // request.reward = 100; // Default reward, can be made configurable

  // brandIds and productIds are not in the form, so they're not included
  // They can be added separately if needed

  return request;
};

/**
 * Transforms Survey API response to SurveyFormData
 * @param data - The survey detail response from API
 * @returns SurveyFormData object
 */
export const transformSurveyToFormData = (
  data: SurveyDetailResponse,
): SurveyFormData => {
  const survey = data.survey;
  const questions = data.questions || [];

  return {
    title: survey.title,
    description: survey.description || "",
    type: survey.surveyTypeId?._id || survey.type || "STANDARD",
    maxQuestions: survey.maxQuestions || 0,
    questions: questions.map((q) => {
      const apiType = q.questionTypeId?.name || "";

      return {
        text: q.questionText,
        type: apiType as QuestionType,
        description: "",
        options: q.options || [],
        scaleMin: q.scaleMin?.toString(),
        scaleMax: q.scaleMax?.toString(),
        scaleLabel: q.scaleLabel,
        isRequired: q.isRequired ?? true,
      };
    }),
    startDate: survey.startDate ? new Date(survey.startDate) : new Date(),
    endDate: survey.endDate ? new Date(survey.endDate) : new Date(),
    estimatedCompletionTime: survey.estimatedCompletionTime
      ? typeof survey.estimatedCompletionTime === "object"
        ? {
            hours: (survey.estimatedCompletionTime as any).hours || 0,
            minutes: (survey.estimatedCompletionTime as any).minutes || 1,
            seconds: (survey.estimatedCompletionTime as any).seconds || 0,
          }
        : {
            hours: 0,
            minutes: 1,
            seconds: 0,
          }
      : {
          hours: 0,
          minutes: 1,
          seconds: 0,
        },
    audience: {
      locationTarget:
        survey.locationTarget === "All" ? "All" : survey.locationTarget,
      targetMetro: survey.targetMetro || [],
      targetCity: survey.targetCity || "",
      targetGender: Array.isArray(survey.targetGender)
        ? (survey.targetGender[0] as
            | "male"
            | "female"
            | "unisex"
            | undefined) || undefined
        : (survey.targetGender as "male" | "female" | "unisex" | undefined) ||
          undefined,
      age:
        survey.targetAgeRanges?.map((ar) => {
          // Find the age group label from MASTER_DATA
          const ageGroup = MASTER_DATA.ageGroup.find(
            (ag) => ag.min === ar.min && ag.max === ar.max,
          );
          return ageGroup?.label || `${ar.min}-${ar.max}`;
        }) || [],
      respondents: survey.maxResponses ?? 0,
      selectedCategories: (() => {
        const categories: ("Skin" | "Hair")[] = [];
        if (
          (survey.targetSkinTypes && survey.targetSkinTypes.length > 0) ||
          (survey.targetSkinConcerns && survey.targetSkinConcerns.length > 0)
        ) {
          categories.push("Skin");
        }
        if (
          (survey.targetHairTypes && survey.targetHairTypes.length > 0) ||
          (survey.targetHairConcerns && survey.targetHairConcerns.length > 0)
        ) {
          categories.push("Hair");
        }
        return categories;
      })(),
      targetSkinTypes: survey.targetSkinTypes || [],
      targetSkinConcerns: survey.targetSkinConcerns || [],
      targetHairTypes: survey.targetHairTypes || [],
      targetHairConcerns: survey.targetHairConcerns || [],
    },
  };
};

/**
 * Common query keys for survey-related queries
 */
export const SURVEY_QUERY_KEYS = {
  SURVEY_DETAIL: (surveyId: string) => ["survey", surveyId],
  SURVEYS_LIST: () => ["surveys"],
} as const;

/**
 * Common success messages for survey operations
 */
export const SURVEY_MESSAGES = {
  CREATE_SUCCESS: "Survey created successfully!",
  UPDATE_SUCCESS: "Survey updated successfully!",
  LOAD_ERROR: "Failed to load survey data",
  CREATE_ERROR: "Failed to create survey",
  UPDATE_ERROR: "Failed to update survey",
} as const;

/**
 * Common error messages for validation
 */
export const SURVEY_ERROR_MESSAGES = {
  MISSING_SURVEY_ID: "Missing survey ID",
} as const;
