import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { FullLoader } from "@/core/components/ui/loader";
import { PageContent } from "@/core/components/ui/structure";
import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { MODE } from "@/core/types/base.type";
import { handleFormErrors } from "@/core/utils/react-hook-form.utils";
import ResearchStepper from "@/modules/panel/features/survey/market-research-create/ResearchStepper";
import ReviewLaunch from "@/modules/panel/features/survey/market-research-create/ReviewLaunch";
import SurveyBasics from "@/modules/panel/features/survey/market-research-create/SurveyBasics";
import SurveyQuestions from "@/modules/panel/features/survey/market-research-create/SurveyQuestions";
import TargetAudience from "@/modules/panel/features/survey/market-research-create/TargetAudience";
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
import type { SurveyApiResponse, SurveyFormProps } from "./types";

const SurveyForm: React.FC<SurveyFormProps> = ({
  mode,
  title,
  description,
  surveyId,
  onSubmit,
  submitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState<SurveyStep>(SurveyStep.BASICS);
  const [confirmation, setConfirmation] = useState<[boolean, any]>([
    false,
    undefined,
  ]);

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
      respondents: "",
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

  // Transform survey data to form data
  const transformedData = useMemo(() => {
    if (!surveyData) return null;
    const data = surveyData.data;
    return transformSurveyToFormData(data);
  }, [surveyData]);

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
      onSubmit({
        surveyId,
        data: convertedData,
      });
    },
    [onSubmit, surveyId],
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
        return <SurveyBasics control={control as any} />;
      case SurveyStep.QUESTIONS:
        return <SurveyQuestions control={control as any} />;
      case SurveyStep.AUDIENCE:
        return <TargetAudience control={control as any} />;
      case SurveyStep.REVIEW:
        return (
          <ReviewLaunch
            control={control as any}
            setCurrentStep={setCurrentStep}
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
            {currentStep > SurveyStep.BASICS && mode !== MODE.VIEW && (
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
            {mode !== MODE.VIEW && (
              <>
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
                  <Button
                    color="secondary"
                    type="button"
                    startIcon={<DocumentIcon />}
                    disabled={submitting}
                    onClick={handleFormSubmit}
                  >
                    {submitting ? "Saving..." : "Submit"}
                  </Button>
                )}
              </>
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
              label: submitting ? "Submitting..." : "Confirm",
              onClick: onConfirm,
              color: "primary",
              disabled: submitting,
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
