import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { PageContent } from "@/core/components/ui/structure";
import { MASTER_DATA } from "@/core/config/constants";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import ResearchStepper from "./ResearchStepper";
import ReviewLaunch from "./ReviewLaunch";
import SurveyBasics from "./SurveyBasics";
import SurveyQuestions from "./SurveyQuestions";
import TargetAudience from "./TargetAudience";
import {
  STEP_VALIDATION_FIELDS,
  surveySchema,
  SurveyStep,
  TOTAL_STEPS,
  type SurveySchema,
} from "./survey.data";

import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { toast } from "sonner";
import { ROUTES } from "@/core/routes/routes.constant";

const MarketResearchCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<SurveyStep>(SurveyStep.BASICS);

  const form = useForm<SurveySchema>({
    resolver: zodResolver(surveySchema),
    // defaultValues: {
    //   title: "Dermatology Product Feedback Survey",
    //   description:
    //     "We want to understand your experience and preferences regarding our dermatology products. Your feedback will help us improve our offerings and better meet your needs.",
    //   category: "Product Feedback",
    //   questions: [
    //     {
    //       text: "How effective was the dermatology product in addressing your skin concerns?",
    //       type: SurveyQuestionType.multiple_choice,
    //       description: "Please rate how well the product worked for you.",
    //       options: ["Very Effective", "Effective", "Neutral"],
    //     },
    //     {
    //       text: "What skin concerns do you usually have?",
    //       type: SurveyQuestionType.single_choice,
    //       description: "Select all that apply to your skin’s condition.",
    //       options: ["Very Effective", "Effective", "Neutral"],
    //     },
    //     {
    //       text: "Would you like us to improve our products?",
    //       type: SurveyQuestionType.yes_no,
    //       description: "",
    //       options: [],
    //     },
    //   ],
    //   startDate: "1 May 25",
    //   audience: {
    //     location: [...MASTER_DATA.location],
    //     gender: [...MASTER_DATA.gender],
    //     age: [...MASTER_DATA.ageGroup],
    //     respondents: 200,
    //   },
    // },
    defaultValues: {
      title: "",
      description: "",
      category: "",
      questions: [
        {
          text: "",
          type: undefined,
          description: "",
          options: [""],
        },
      ],
      startDate: undefined,
      audience: {
        location: [...MASTER_DATA.location],
        gender: [],
        respondents: "",
        skin: [],
        concern: [],
        skinType: [],
      },
    },
    mode: "onChange",
  });

  const { control, handleSubmit, trigger } = form;

  const onNext = async (e: MouseEvent<HTMLButtonElement>) => {
    // e.stopPropagation();
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

  const onSubmit = (data: unknown) => {
    console.log("Final Submit:", data);
    setConfirmation((val) => !val);
  };

  const onConfirm = () => {
    setConfirmation(false);
    toast.success("Brand is saved successfully!");
    setTimeout(() => {
      navigate(ROUTES.SURVEY);
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case SurveyStep.BASICS:
        return <SurveyBasics control={control} />;
      case SurveyStep.QUESTIONS:
        return <SurveyQuestions control={control} />;
      case SurveyStep.AUDIENCE:
        return <TargetAudience control={control} />;
      case SurveyStep.REVIEW:
        return (
          <ReviewLaunch control={control} setCurrentStep={setCurrentStep} />
        );
      default:
        return null;
    }
  };

  return (
    <PageContent
      header={{
        title: id ? "Edit Survey" : "Create New Survey",
        description:
          "Design your survey, define your audience, and gather insights",
        actions: (
          <ResearchStepper
            currentStep={currentStep}
            onStepChange={onStepClick}
          />
        ),
      }}
    >
      <hr className="my-2" />
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
                color="primary"
                type="button"
                endIcon={<ArrowRightIcon />}
                onClick={onNext}
              >
                Next
              </Button>
            ) : (
              <Button
                color="primary"
                type="submit"
                startIcon={<DocumentIcon />}
              >
                Submit
              </Button>
            )}
          </div>

          <ConfirmationDialog
            isOpen={confirmation}
            onClose={() => setConfirmation(false)}
            title="Confirm Action"
            description="Are you sure you want to perform this action?"
            actionButtons={[
              {
                label: "Confirm",
                onClick: onConfirm,
                color: "primary",
              },
            ]}
            showCancel={true}
            cancelText="Back"
          />
        </form>
      </Form>
    </PageContent>
  );
};

export default MarketResearchCreate;
