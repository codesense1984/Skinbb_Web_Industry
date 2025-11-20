import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContent } from "@/core/components/ui/structure";
import { Card, CardContent } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { SurveyStepper, type SurveyStep } from "@/modules/survey/components/SurveyStepper";
import { useSurvey, useCreateSurvey, useUpdateSurvey } from "@/modules/survey/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCreateSurvey } from "@/modules/survey/services/survey.service";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import { FullLoader } from "@/core/components/ui/loader";
import { toast } from "sonner";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Step1SurveyBasics from "./steps/Step1SurveyBasics";
import Step2SelectQuestions from "./steps/Step2SelectQuestions";
import Step3TargetAudience from "./steps/Step3TargetAudience";
import Step4ReviewLaunch from "./steps/Step4ReviewLaunch";
import {
  SURVEY_TYPES,
  LOCATION_TARGETS,
  QUESTION_TYPES,
  SURVEY_CONSTRAINTS,
  SURVEY_DEFAULTS,
  QUESTION_TYPE_BASE_PRICES,
} from "@/modules/survey/constants/survey.constants";
import type { Question, CreateSurveyRequest } from "@/modules/survey/types/survey.types";

// Form Schema
const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  type: z.enum(QUESTION_TYPES as [string, ...string[]]),
  basePrice: z.number().optional(),
  isRequired: z.boolean().default(SURVEY_DEFAULTS.isRequired),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  scaleLabel: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional(),
  defaultAnswer: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const surveyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(SURVEY_TYPES as [string, ...string[]]),
  startDate: z.string().optional(),
  priceMultiplier: z
    .number()
    .min(SURVEY_CONSTRAINTS.priceMultiplierMin, "Price multiplier must be at least 0.1")
    .optional(),
  reward: z
    .number()
    .min(SURVEY_CONSTRAINTS.rewardMin, "Reward must be non-negative")
    .optional(),
  locationTarget: z.enum(LOCATION_TARGETS as [string, ...string[]]),
  targetCity: z.string().optional(),
  targetMetro: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"] as [string, ...string[]]).optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
}).refine((data) => {
  if (data.locationTarget === "City" && !data.targetCity) {
    return false;
  }
  if (data.locationTarget === "Metro" && !data.targetMetro) {
    return false;
  }
  return true;
}, {
  message: "Target city/metro is required when location target is City/Metro",
  path: ["targetCity"],
}).refine((data) => {
  if (data.type === "flash" && data.questions.length > SURVEY_CONSTRAINTS.flashSurveyMaxQuestions) {
    return false;
  }
  return true;
}, {
  message: `Flash surveys can have maximum ${SURVEY_CONSTRAINTS.flashSurveyMaxQuestions} questions`,
  path: ["questions"],
});

export type SurveyFormData = z.infer<typeof surveyFormSchema>;

const SurveyFormWizard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  const [currentStep, setCurrentStep] = useState<SurveyStep>(1);
  
  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");
  const listRoute = isSellerRoute ? SELLER_ROUTES.MARKETING.SURVEYS.LIST : SURVEY_ROUTES.LIST;

  const { data: surveyData, isLoading: isLoadingSurvey } = useSurvey(id, isEdit);
  const createMutation = useCreateSurvey();
  const updateMutation = useUpdateSurvey();
  
  // Custom mutation for launch flow that doesn't navigate
  const queryClient = useQueryClient();
  const createMutationForLaunch = useMutation({
    mutationFn: apiCreateSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create survey");
    },
  });

  // Check if survey is paid and prevent editing
  useEffect(() => {
    if (isEdit && surveyData?.data?.data && !isLoadingSurvey) {
      const survey = surveyData.data.data;
      const isPaid = survey.paymentStatus === "paid";
      
      if (isPaid) {
        toast.error("Cannot edit survey after payment is completed. You can only view the survey.");
        const viewRoute = isSellerRoute && id
          ? SELLER_ROUTES.MARKETING.SURVEYS.VIEW(id)
          : id ? SURVEY_ROUTES.DETAIL(id) : listRoute;
        navigate(viewRoute);
      }
    }
  }, [isEdit, surveyData, isLoadingSurvey, isSellerRoute, id, navigate, listRoute]);

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      type: SURVEY_DEFAULTS.surveyType,
      startDate: undefined,
      priceMultiplier: SURVEY_DEFAULTS.priceMultiplier,
      reward: SURVEY_DEFAULTS.reward,
      locationTarget: SURVEY_DEFAULTS.locationTarget,
      status: SURVEY_DEFAULTS.surveyStatus,
      questions: [
        {
          questionText: "",
          type: "MCQ",
          isRequired: SURVEY_DEFAULTS.isRequired,
          options: ["", ""],
        },
      ],
    },
  });

  // Load survey data for edit
  useEffect(() => {
    if (isEdit && surveyData?.data && !isLoadingSurvey) {
      const surveyD = surveyData.data;
      
      // Ensure questions array has at least default values for options if MCQ
      const mappedQuestions = surveyD.questions?.map((q: Question) => {
        const questionData: {
          questionText: string;
          type: string;
          basePrice?: number;
          isRequired: boolean;
          options?: string[];
          scaleMin?: number;
          scaleMax?: number;
          scaleLabel?: { min?: string; max?: string };
          defaultAnswer?: string | number | boolean;
        } = {
          questionText: q.questionText || "",
          type: q.type,
          basePrice: q.basePrice ?? (q.type === "MCQ" ? QUESTION_TYPE_BASE_PRICES.MCQ : 
                                    q.type === "Yes/No" ? QUESTION_TYPE_BASE_PRICES["Yes/No"] :
                                    q.type === "Scaling" ? QUESTION_TYPE_BASE_PRICES.Scaling :
                                    q.type === "Descriptive" ? QUESTION_TYPE_BASE_PRICES.Descriptive : 0),
          isRequired: q.isRequired ?? SURVEY_DEFAULTS.isRequired,
          scaleMin: q.scaleMin ?? SURVEY_DEFAULTS.scaleMin,
          scaleMax: q.scaleMax ?? SURVEY_DEFAULTS.scaleMax,
          scaleLabel: q.scaleLabel || { min: "", max: "" },
          defaultAnswer: q.defaultAnswer,
        };

        // Ensure options array exists for MCQ questions
        if (q.type === "MCQ") {
          questionData.options = q.options && q.options.length > 0 
            ? q.options 
            : ["", ""]; // Default to 2 empty options if none exist
        }

        return questionData;
      }) || [];

      const survey = surveyD.survey;

      form.reset({
        title: survey.title || "",
        description: survey.description || "",
        type: survey.type || SURVEY_DEFAULTS.surveyType,
        startDate: survey.createdAt, // Start date not in backend model, can be added later
        priceMultiplier: survey.priceMultiplier ?? SURVEY_DEFAULTS.priceMultiplier,
        reward: survey.reward ?? SURVEY_DEFAULTS.reward,
        locationTarget: survey.locationTarget || SURVEY_DEFAULTS.locationTarget,
        targetCity: survey.targetCity || "",
        targetMetro: survey.targetMetro || "",
        status: survey.status || SURVEY_DEFAULTS.surveyStatus,
        questions: mappedQuestions.length > 0 ? mappedQuestions : [
          {
            questionText: "",
            type: "MCQ",
            isRequired: SURVEY_DEFAULTS.isRequired,
            options: ["", ""],
            basePrice: QUESTION_TYPE_BASE_PRICES.MCQ,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, surveyData, isLoadingSurvey]);

  const handleNext = async () => {
    if (currentStep === 4) {
      // Step 4 will handle its own confirmation dialog
      return;
    }

    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);

    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as SurveyStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SurveyStep);
    } else {
      navigate(listRoute);
    }
  };

  const handleSubmit = async (): Promise<string | null> => {
    const isValid = await form.trigger();
    if (!isValid) {
        console.log("Form is not valid", form.formState.errors, form.getValues());
      toast.error("Please fix all errors before submitting");
      return null;
    }

    try {
      const data = form.getValues();
      const payload: CreateSurveyRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        priceMultiplier: data.priceMultiplier,
        reward: data.reward,
        locationTarget: data.locationTarget,
        targetCity: data.targetCity,
        targetMetro: data.targetMetro,
        status: data.status || "draft",
        questions: data.questions.map((q, index) => ({
          order: index + 1,
          questionText: q.questionText,
          type: q.type,
          basePrice: q.basePrice,
          isRequired: q.isRequired,
          options: q.type === "MCQ" ? q.options : undefined,
          scaleMin: q.type === "Scaling" ? q.scaleMin : undefined,
          scaleMax: q.type === "Scaling" ? q.scaleMax : undefined,
          scaleLabel: q.type === "Scaling" ? q.scaleLabel : undefined,
          defaultAnswer: q.defaultAnswer,
        })),
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ surveyId: id, data: payload });
        return id;
      } else {
        // Use the launch mutation to avoid auto-navigation
        const response = await createMutationForLaunch.mutateAsync(payload);
        // Response structure from API: { statusCode, success, message, data: { survey: { _id or id, ... } } }
        // The response from mutation is: { statusCode, success, message, data: { survey: {...} } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = (response as any)?.data;
        // Handle nested survey object or direct survey data
        const survey = responseData?.survey || responseData;
        const surveyId = survey?._id || survey?.id;
        if (!surveyId) {
          console.error("Survey ID not found in response:", response);
          throw new Error("Failed to get survey ID from response");
        }
        return surveyId;
      }
    } catch (error) {
      console.error("Error saving survey:", error);
      return null;
    }
  };

  const getFieldsForStep = (step: SurveyStep): (keyof SurveyFormData)[] => {
    switch (step) {
      case 1:
        return ["title", "type", "startDate"];
      case 2:
        return ["questions"];
      case 3:
        return ["reward", "locationTarget", "targetCity", "targetMetro"];
      case 4:
        return [];
      default:
        return [];
    }
  };

  if (isEdit && isLoadingSurvey) {
    return <FullLoader />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1SurveyBasics form={form} />;
      case 2:
        return <Step2SelectQuestions form={form} />;
      case 3:
        return <Step3TargetAudience form={form} />;
      case 4:
        return <Step4ReviewLaunch form={form} onSubmit={handleSubmit} surveyId={id} />;
      default:
        return null;
    }
  };

  return (
    <PageContent
      header={{
        title: (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(listRoute)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Create New Survey</h1>
              <p className="text-sm text-gray-500 mt-1">
                Design your survey, define your audience, and gather insights
              </p>
            </div>
          </div>
        ),
      }}
    >
      <FormProvider {...form}>
        <Card className="w-full">
          <CardContent className="pt-6">
            <SurveyStepper currentStep={currentStep} />
            {renderStepContent()}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outlined"
                onClick={handleBack}
                disabled={createMutation.isPending || createMutationForLaunch.isPending || updateMutation.isPending}
              >
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (currentStep === 4) {
                    // Trigger confirmation dialog in Step4
                    const trigger = (window as any).__triggerLaunchDialog;
                    if (trigger) trigger();
                  } else {
                    handleNext();
                  }
                }}
                disabled={
                  createMutation.isPending ||
                  createMutationForLaunch.isPending ||
                  updateMutation.isPending ||
                  (currentStep === 1 &&
                    (!form.watch("title") || !form.watch("type")))
                }
              >
                {currentStep === 4
                  ? "Launch Survey"
                  : "Submit & Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FormProvider>
    </PageContent>
  );
};

export default SurveyFormWizard;

