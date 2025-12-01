import { z } from "zod";
import { SurveyQuestionType } from "@/core/types/research.type";

// Sub-schemas
export const questionSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters"),
  type: z.nativeEnum(SurveyQuestionType),
  description: z.string().optional(),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
});

export const audienceSchema = z.object({
  location: z.array(z.string()).min(1, "Select at least one location"),
  gender: z.array(z.string()).min(1, "Select at least one gender"),
  age: z
    .array(z.string({ required_error: "Select at least one age group" }))
    .min(1, "Select at least one age group"),
  interests: z.array(z.string()).optional(),
  respondents: z.string(),
  skin: z.array(z.string()).min(1, "Select at least one skin category"),
  concern: z.array(z.string()).min(1, "Select at least one concern"),
  skinType: z.array(z.string()).optional(),
});

// Main survey schema
export const surveySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
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
  audience: audienceSchema,
});

// Infer the TypeScript type from the Zod schema
export type SurveySchema = z.infer<typeof surveySchema>;

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
  (keyof SurveySchema)[]
> = {
  [SurveyStep.BASICS]: ["title", "description", "category", "startDate"],
  [SurveyStep.QUESTIONS]: ["questions"],
  [SurveyStep.AUDIENCE]: ["audience"],
  [SurveyStep.REVIEW]: [],
};
