import { z } from "zod";
import type { EligibleRespondentsResponse } from "@/modules/panel/types/survey.types";

// Sub-schemas
export const questionSchema = z
  .object({
    text: z.string().min(5, "Question must be at least 5 characters"),
    type: z.enum([
      "SINGLE_CHOICE",
      "YES/NO",
      "RATING",
      "TEXT",
      "MULTIPLE_CHOICE",
    ] as const),
    description: z.string().optional(),
    options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
    scaleMin: z.number().optional(),
    scaleMax: z.number().optional(),
    scaleLabel: z
      .object({
        min: z.string().optional(),
        max: z.string().optional(),
      })
      .optional(),
    isRequired: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Validate options for SINGLE_CHOICE and MULTIPLE_CHOICE
    if (
      (data.type === "SINGLE_CHOICE" || data.type === "MULTIPLE_CHOICE") &&
      (!data.options || data.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one option is required for this question type",
        path: ["options"],
      });
    }
    // Validate scaleMin and scaleMax for RATING
    if (data.type === "RATING") {
      if (data.scaleMin === undefined || data.scaleMax === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Min and Max values are required for RATING type",
          path: ["scaleMin"],
        });
      }
      if (
        data.scaleMin !== undefined &&
        data.scaleMax !== undefined &&
        data.scaleMin >= data.scaleMax
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Max value must be greater than Min value",
          path: ["scaleMax"],
        });
      }
    }
  });

export const audienceSchema = z
  .object({
    locationTarget: z.enum(["All", "Metro", "City"]).optional(),
    targetMetro: z.array(z.string()).optional(),
    targetCity: z.string().optional(),
    targetGender: z.enum(["male", "female", "unisex"]).optional(),
    interests: z.array(z.string()).optional(),
    age: z.array(z.string()).optional(),
    respondents: z.number().optional(),
    totalPrice: z.number().optional(), // Total price from estimate or survey (for edit/view mode)
    selectedCategories: z.array(z.enum(["Skin", "Hair"])).optional(),
    targetSkinTypes: z.array(z.string()).optional(),
    targetSkinConcerns: z.array(z.string()).optional(),
    targetHairTypes: z.array(z.string()).optional(),
    targetHairConcerns: z.array(z.string()).optional(),
    estimateResponse: z.custom<EligibleRespondentsResponse>().optional(),
    isOptionChanged: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // If locationTarget is Metro, targetMetro must be provided
    if (
      data.locationTarget === "Metro" &&
      (!data.targetMetro || data.targetMetro.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one metro city",
        path: ["targetMetro"],
      });
    }
    // If locationTarget is City, targetCity must be provided
    if (data.locationTarget === "City" && !data.targetCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a city name",
        path: ["targetCity"],
      });
    }
    // Number of Respondents must be greater than 0 and not exceed estimateResponse.count
    if (data.respondents) {
      const respondentsNum = data.respondents;
      if (isNaN(respondentsNum) || respondentsNum === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Number of Respondents must be greater than 0",
          path: ["respondents"],
        });
      } else if (
        data.estimateResponse?.count &&
        respondentsNum > data.estimateResponse?.count
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Number of Respondents cannot exceed ${data.estimateResponse?.count.toLocaleString()} available respondents`,
          path: ["respondents"],
        });
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Number of Respondents is required",
        path: ["respondents"],
      });
    }

    // Validate if options were changed but estimate was not recalculated
    if (data.isOptionChanged === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please calculate the estimate cost",
        path: ["isOptionChanged"],
      });
    }
    // // At least one of skin or hair concerns/types must be selected
    // const hasSkinSelection =
    //   (data.targetSkinTypes && data.targetSkinTypes.length > 0) ||
    //   (data.targetSkinConcerns && data.targetSkinConcerns.length > 0);
    // const hasHairSelection =
    //   (data.targetHairTypes && data.targetHairTypes.length > 0) ||
    //   (data.targetHairConcerns && data.targetHairConcerns.length > 0);
    // if (!hasSkinSelection && !hasHairSelection) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: "Select at least one skin or hair concern or type",
    //     path: ["targetSkinConcerns"],
    //   });
    // }
  });

// Main survey schema
export const surveySchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    status: z.enum(["draft", "active", "available", "completed"]).optional(),
    maxQuestions: z.number().optional(),
    questions: z
      .array(questionSchema)
      .min(1, "At least one question is required"),
    startDate: z.union([
      z.date({
        required_error: "Date is required",
        invalid_type_error: "Must be a valid date",
      }),
      z.string().datetime(),
    ]),
    endDate: z.union([
      z.date({
        required_error: "End date is required",
        invalid_type_error: "Must be a valid date",
      }),
      z.string().datetime(),
    ]),
    estimatedCompletionTime: z
      .object({
        hours: z.number().min(0).max(24).default(0),
        minutes: z.number().min(0).max(60).default(1),
        seconds: z.number().min(0).max(60).default(0),
      })
      .superRefine((data, ctx) => {
        // At least one field must be greater than 0
        if (data.hours === 0 && data.minutes === 0 && data.seconds === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "At least one field (hours, minutes, or seconds) must be greater than 0",
            path: ["minutes"], // Show error on minutes field
          });
        }
      })
      .optional(),
    audience: audienceSchema,
  })
  .superRefine((data, ctx) => {
    // Validate that questions count doesn't exceed maxQuestions
    if (data.maxQuestions && data.questions.length > data.maxQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum ${data.maxQuestions} questions allowed for this survey type`,
        path: ["questions"],
      });
    }
    // Validate that endDate is after startDate
    if (data.endDate && data.startDate) {
      const start =
        data.startDate instanceof Date
          ? data.startDate
          : new Date(data.startDate);
      const end =
        data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["endDate"],
        });
      }
    }
  });

// Infer the TypeScript type from the Zod schema
export type SurveyFormData = z.infer<typeof surveySchema>;

export enum SurveyStep {
  BASICS = 1,
  QUESTIONS = 2,
  AUDIENCE = 3,
  REVIEW = 4,
}

export const TOTAL_STEPS = Object.keys(SurveyStep).length / 2;

// Validation fields mapped to each step
export const STEP_VALIDATION_FIELDS: Record<
  SurveyStep,
  (keyof SurveyFormData)[]
> = {
  [SurveyStep.BASICS]: ["title", "description", "type", "startDate", "endDate"],
  [SurveyStep.QUESTIONS]: ["questions"],
  [SurveyStep.AUDIENCE]: ["audience"],
  [SurveyStep.REVIEW]: [],
};
