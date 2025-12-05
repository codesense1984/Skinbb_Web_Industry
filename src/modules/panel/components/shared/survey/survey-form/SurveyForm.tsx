import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { FullLoader } from "@/core/components/ui/loader";
import { PageContent } from "@/core/components/ui/structure";
import { MODE } from "@/core/types/base.type";
import { handleFormErrors } from "@/core/utils/react-hook-form.utils";
import ResearchStepper from "@/modules/panel/components/shared/survey/survey-form/ResearchStepper";
import ReviewLaunch from "@/modules/panel/components/shared/survey/survey-form/ReviewLaunch";
import SurveyBasics from "@/modules/panel/components/shared/survey/survey-form/SurveyBasics";
import SurveyQuestions from "@/modules/panel/components/shared/survey/survey-form/SurveyQuestions";
import TargetAudience from "@/modules/panel/components/shared/survey/survey-form/TargetAudience";
import { apiGetSurveyById } from "@/modules/panel/services/survey.service";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import {
  STEP_VALIDATION_FIELDS,
  surveySchema,
  SurveyStep,
  TOTAL_STEPS,
  type SurveyFormData,
} from "./survey.schema";
import {
  transformSurveyFormDataToSurvey,
  transformSurveyToFormData,
} from "./survey.utils";
import type { SurveyFormProps } from "./types";
import { useSurveyPayment } from "./useSurveyPayment";

const SurveyForm: React.FC<SurveyFormProps> = ({
  mode,
  title,
  description,
  surveyId,
  onSubmit,
  submitting = false,
  enablePayment = false,
  onPaymentSuccess,
  disableStatusInEdit = false,
}) => {
  const [currentStep, setCurrentStep] = useState<SurveyStep>(SurveyStep.BASICS);
  const [confirmation, setConfirmation] = useState<[boolean, any]>([
    false,
    undefined,
  ]);

  // Payment hook - only initialize if payment is enabled
  const {
    initiatePayment,
    isProcessing: isPaymentProcessing,
    isRazorpayReady,
  } = useSurveyPayment({
    onPaymentSuccess: (survey) => {
      onPaymentSuccess?.(survey);
    },
    onPaymentError: () => {
      // Error handling is done via callback
    },
  });

  const zodSchema = useMemo(() => surveySchema, []);

  const defaultValues: SurveyFormData = {
    title: "",
    description: "",
    type: "",
    maxQuestions: undefined,
    questions: [
      {
        text: "",
        type: "TEXT",
        description: "",
        options: [],
        isRequired: true,
        scaleMin: undefined,
        scaleMax: undefined,
        scaleLabel: undefined,
      },
    ],
    startDate: new Date(),
    endDate: new Date(),
    estimatedCompletionTime: {
      hours: 0,
      minutes: 1,
      seconds: 0,
    },
    audience: {
      locationTarget: "All",
      targetGender: undefined,
      age: [],
      respondents: 0,
      totalPrice: undefined,
      selectedCategories: [],
      targetSkinTypes: [],
      targetSkinConcerns: [],
      targetHairTypes: [],
      targetHairConcerns: [],
    },
  };

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onChange",
  });

  const { control, handleSubmit, trigger, reset } = form;

  console.log(form.watch(), form.formState.errors, "watch");

  // Fetch survey data for edit and view modes
  const {
    data: surveyData,
    isLoading: isLoadingSurvey,
    error: surveyError,
  } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => {
      return await apiGetSurveyById(surveyId!);
    },
    enabled: !!surveyId && (mode === MODE.EDIT || mode === MODE.VIEW),
  });

  // Get survey status from API response
  const surveyStatus = useMemo(() => {
    if (!surveyData) return null;
    return surveyData.data.survey.status;
  }, [surveyData]);

  // Transform survey data to form data
  const transformedData = useMemo(() => {
    if (!surveyData) return null;
    const data = surveyData.data;
    return transformSurveyToFormData(data);
  }, [surveyData]);

  // Calculate disabled states
  const isViewMode = mode === MODE.VIEW;
  const isEditModeWithActiveStatus =
    mode === MODE.EDIT && surveyStatus === "active";
  const isQuestionsDisabled = isViewMode || isEditModeWithActiveStatus;
  const isTargetAudienceDisabled = isViewMode || isEditModeWithActiveStatus;

  // Populate form with existing data when in edit or view mode
  useEffect(() => {
    if (!transformedData || (mode !== MODE.EDIT && mode !== MODE.VIEW)) {
      return;
    }
    reset(transformedData);
  }, [transformedData, mode, reset]);

  const onNext = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fieldsToValidate = STEP_VALIDATION_FIELDS[currentStep];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const onStepClick = async (count: number) => {
    if (currentStep > count) {
      setCurrentStep(count);
      return;
    }

    const fieldsToValidate = STEP_VALIDATION_FIELDS[currentStep];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      return;
    }
    setCurrentStep(count);
  };

  const onBack = () =>
    setCurrentStep((prev) => Math.max(prev - 1, SurveyStep.BASICS));

  const onSubmitForm = useCallback(
    async (data: any) => {
      if (!onSubmit) {
        return;
      }

      // Transform to CreateSurveyRequest format
      const convertedData = transformSurveyFormDataToSurvey(
        data as SurveyFormData,
      );

      // Call onSubmit with transformed data
      const result = await onSubmit({
        surveyId,
        data: convertedData,
      });
      debugger;

      // Handle payment flow after survey creation (only for CREATE mode) or EDIT mode with draft status
      if (
        (enablePayment && result?.surveyId && mode === MODE.ADD) ||
        (enablePayment &&
          mode === MODE.EDIT &&
          result?.survey?.status === "draft")
      ) {
        const newSurveyId = result.surveyId;

        // Wait for Razorpay to be ready if it's not already
        if (!isRazorpayReady) {
          // Wait for Razorpay script to load (check window.Razorpay directly)
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds max wait
          while (!window.Razorpay && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
          }
        }

        // Initiate payment directly after survey creation
        if ((isRazorpayReady || window.Razorpay) && newSurveyId) {
          try {
            await initiatePayment(newSurveyId);
          } catch (error) {
            // Error is already handled in the hook, just log here
            console.error("Payment initiation failed:", error);
          }
        } else {
          console.error("Razorpay is not ready. Please try again.");
        }
      }
    },
    [onSubmit, surveyId, enablePayment, mode, isRazorpayReady, initiatePayment],
  );

  const onError = useCallback((errors: FieldErrors<SurveyFormData>) => {
    handleFormErrors(errors as FieldErrors<SurveyFormData>);
  }, []);

  // Handle form submission with confirmation
  const handleFormSubmit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      // Trigger validation first
      const isValid = await trigger();
      if (isValid) {
        setConfirmation([true, undefined]);
      }
    },
    [trigger],
  );

  // Confirm submission - actually submit the form
  const onConfirm = useCallback(() => {
    const submitHandler = handleSubmit(onSubmitForm, onError);
    submitHandler();
    setConfirmation([false, undefined]);
  }, [handleSubmit, onSubmitForm, onError]);

  const isLoading =
    isLoadingSurvey && (mode === MODE.EDIT || mode === MODE.VIEW);
  const hasError = surveyError && (mode === MODE.EDIT || mode === MODE.VIEW);
  const isSubmitting = submitting || isPaymentProcessing;

  if (hasError) {
    return (
      <PageContent
        header={{
          title: "Error",
          description: "Failed to load survey data",
        }}
      >
        <div className="w-full">
          <div className="bg-background rounded-xl border p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="mb-4 text-red-600">Error loading survey data</p>
                <p className="text-sm text-gray-600">Survey ID: {surveyId}</p>
                <p className="text-sm text-gray-600">
                  Error: {surveyError?.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case SurveyStep.BASICS:
        return (
          <SurveyBasics
            control={control as any}
            disabled={isViewMode}
            mode={
              mode === MODE.ADD
                ? "create"
                : mode === MODE.VIEW
                  ? "view"
                  : "edit"
            }
            disableStatusInEdit={disableStatusInEdit}
          />
        );
      case SurveyStep.QUESTIONS:
        return (
          <SurveyQuestions
            control={control as any}
            disabled={isQuestionsDisabled}
          />
        );
      case SurveyStep.AUDIENCE:
        return (
          <TargetAudience
            control={control as any}
            disabled={isTargetAudienceDisabled}
            mode={
              mode === MODE.ADD
                ? "create"
                : mode === MODE.VIEW
                  ? "view"
                  : "edit"
            }
          />
        );
      case SurveyStep.REVIEW:
        return (
          <ReviewLaunch
            control={control as any}
            setCurrentStep={setCurrentStep}
            disabled={isViewMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      {isLoading && <FullLoader />}
      <PageContent
        header={{
          title,
          description,
          actions: (
            <ResearchStepper
              currentStep={currentStep}
              onStepChange={onStepClick}
            />
          ),
        }}
      >
        <hr className="my-2" />
        <form onSubmit={handleSubmit(onSubmitForm, onError)}>
          {renderStepContent()}
          <div className="mt-2 flex justify-end gap-2 md:mt-5 md:gap-3">
            {currentStep > SurveyStep.BASICS && (
              <Button
                variant="outlined"
                className="bg-background"
                type="button"
                onClick={onBack}
                startIcon={<ArrowLeftIcon />}
              >
                Back
              </Button>
            )}
            {currentStep < SurveyStep.REVIEW ? (
              <Button
                color="secondary"
                type="button"
                endIcon={<ArrowRightIcon />}
                onClick={onNext}
              >
                Next
              </Button>
            ) : (
              mode !== MODE.VIEW && (
                <Button
                  color="secondary"
                  type="button"
                  startIcon={<DocumentIcon />}
                  disabled={isSubmitting}
                  onClick={handleFormSubmit}
                >
                  {isSubmitting
                    ? isPaymentProcessing
                      ? "Processing Payment..."
                      : "Saving..."
                    : "Submit"}
                </Button>
              )
            )}
          </div>
        </form>
        <ConfirmationDialog
          isOpen={confirmation[0]}
          onClose={() => setConfirmation([false, undefined])}
          title="Confirm Submission?"
          description="Are you sure you want to submit this survey? Once submitted, the survey will be created and you'll be able to manage it from the surveys list."
          actionButtons={[
            {
              label: isSubmitting
                ? isPaymentProcessing
                  ? "Processing Payment..."
                  : "Submitting..."
                : "Confirm",
              onClick: onConfirm,
              color: "primary",
              disabled: isSubmitting,
            },
          ]}
          showCancel={true}
          cancelText="Cancel"
        />
      </PageContent>
    </Form>
  );
};

export default SurveyForm;
