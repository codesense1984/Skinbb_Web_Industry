import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/core/components/ui/stepper";
import { MODE } from "@/core/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiOnboardingSubmit } from "../../../../../services/http/company.service";
import { STEP_ORDER } from "../../../config/steps.config";
import {
  fullCompanyZodSchema,
  type FullCompanyFormType,
} from "../../../schema/fullCompany.schema";
import {
  areAllStepsCompleted as areAllStepsCompletedUtil,
  computeFirstIncompleteStep,
  getFieldNamesForStep,
} from "../../../utils/onboard-steps.utils";
import {
  transformApiResponseToFormData,
  transformFormDataToApiRequest,
} from "../../../utils/onboarding.utils";
const CompanyDetails = lazy(() => import("./CompanyDetails"));
const BrandDetails = lazy(() => import("./BrandDetails"));
const PersonalDetails = lazy(() => import("./PersonalDetails"));
const Thankyou = lazy(() => import("./Thankyou"));
const AddressDetails = lazy(() =>
  import("./AddressDetails").then((m) => ({ default: m.AddressDetails })),
);
const DocumentDetails = lazy(() =>
  import("./DocumentDetails").then((m) => ({ default: m.DocumentDetails })),
);

import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import type { AxiosError } from "axios";
import { StepKey } from "../../../config/steps.config";

const StepCount = {
  // [StepKey.START]: 1,
  [StepKey.COMPANY_DETAILS]: 1,
  [StepKey.ADDRESS_DETAILS]: 2,
  [StepKey.BRAND_DETAILS]: 3,
  [StepKey.DOCUMENTS_DETAILS]: 4,
  [StepKey.PERSONAL_INFORMATION]: 5,
  // [StepKey.CONFIRMATION]: 5,
  [StepKey.THANK_YOU]: 6,
};

interface StepItem {
  step: number;
  stepTitle: string;
  value: StepKey;
  title: string;
  description: string;
  Component: ComponentType<{ mode: MODE }>;
}

const STEPS: StepItem[] = [
  // {
  //   step: StepCount[StepKey.START],
  //   stepTitle: "Start",
  //   value: StepKey.START,
  //   title: "👋 Welcome to Your Company Onboarding",
  //   description:
  //     "Your journey with SkinBB starts here. We're excited to have you on board!",
  //   Component: memo(Start),
  // },
  {
    step: StepCount[StepKey.COMPANY_DETAILS],
    stepTitle: "Company information",
    value: StepKey.COMPANY_DETAILS,
    title: "Build Your Business Identity",
    description: "Lay the foundation with your core company details.",
    Component: CompanyDetails,
  },
  {
    step: StepCount[StepKey.ADDRESS_DETAILS],
    stepTitle: "Address information",
    value: StepKey.ADDRESS_DETAILS,
    title: "Tell Us Your Address",
    description:
      "We need your registered address to keep our records accurate and compliant.",
    Component: AddressDetails,
  },
  {
    step: StepCount[StepKey.BRAND_DETAILS],
    stepTitle: "Brand details",
    value: StepKey.BRAND_DETAILS,
    title: "Brand Identity",
    description: "Define your brand identity and logo.",
    Component: BrandDetails,
  },
  {
    step: StepCount[StepKey.DOCUMENTS_DETAILS],
    stepTitle: "Documents information",
    value: StepKey.DOCUMENTS_DETAILS,
    title: "Prove Your Legitimacy",
    description: "Upload your legal documents for verification.",
    Component: DocumentDetails,
  },
  {
    step: StepCount[StepKey.PERSONAL_INFORMATION],
    stepTitle: "Personal",
    value: StepKey.PERSONAL_INFORMATION,
    title: "Build your personal space",
    description:
      "Your journey with SkinBB starts here. We're excited to have you on board!",
    Component: PersonalDetails,
  },
  // {
  //   step: StepCount[StepKey.CONFIRMATION],
  //   stepTitle: "Confirm",
  //   value: StepKey.CONFIRMATION,
  //   title: "Submit Profile?",
  //   description: "Are you sure you want to submit your profile for review?",
  //   Component: () => null,
  // },
  {
    step: StepCount[StepKey.THANK_YOU],
    stepTitle: "Thank You",
    value: StepKey.THANK_YOU,
    title: "Thank You for Submitting Your Company Profile!",
    description:
      "Your details have been successfully submitted for review. We'll be in touch soon.",
    Component: Thankyou,
  },
];

const formStep = [
  StepCount[StepKey.COMPANY_DETAILS],
  StepCount[StepKey.ADDRESS_DETAILS],
  StepCount[StepKey.BRAND_DETAILS],
  StepCount[StepKey.DOCUMENTS_DETAILS],
  StepCount[StepKey.PERSONAL_INFORMATION],
];
const lastStep = StepCount[StepKey.PERSONAL_INFORMATION];

interface OnBoardContextType {
  mode: MODE;
  goNext: () => void;
  goBack: () => void;
  currentIndex: number;
}

const OnBoardContext = createContext<OnBoardContextType | undefined>(undefined);

export const useOnBoardContext = () => {
  const ctx = useContext(OnBoardContext);
  if (!ctx) throw new Error("useOnBoardContext must be inside OnBoardProvider");
  return ctx;
};

const OnBoardForm = ({ mode = MODE.ADD }: { mode?: MODE }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [currentValue, setCurrentValue] = useState<StepKey>(
    StepKey.COMPANY_DETAILS,
  );

  const [confirmation, setConfirmation] = useState<
    [boolean, FullCompanyFormType | undefined]
  >([false, undefined]);

  const methods = useForm<FullCompanyFormType>({
    defaultValues: transformApiResponseToFormData(),
    resolver: zodResolver(fullCompanyZodSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, watch, reset } = methods;

  console.log(watch(), "formdata");

  // Function to find the first incomplete step (synchronous for UI)
  const getFirstIncompleteStep = useCallback((): StepKey => {
    const values = watch();
    return computeFirstIncompleteStep(values);
  }, [watch]);

  // Function to check if all form steps are completed (synchronous for UI)
  const areAllStepsCompleted = useCallback((): boolean => {
    const values = watch();
    return areAllStepsCompletedUtil(values);
  }, [watch]);

  const currentItem = useMemo(
    () => STEPS.find((s) => s.value === currentValue) ?? STEPS[0],
    [currentValue],
  );

  const currentIndex = useMemo(
    () => STEPS.findIndex((s) => s.value === currentValue),
    [currentValue],
  );

  const isFirst = currentIndex === 0;
  // const isStart = currentIndex === 0;

  const isFormStep = formStep.includes(currentItem?.step);

  // const isConfirmation = currentItem.step === StepCount[StepKey.CONFIRMATION];
  const isThankYou = currentItem.step === StepCount[StepKey.THANK_YOU];

  const navigateTo = useCallback(
    (idx: number) => setCurrentValue(STEPS[idx].value),
    [],
  );

  const goNext = useCallback(() => {
    if (currentIndex < STEPS.length - 1) navigateTo(currentIndex + 1);
  }, [currentIndex, navigateTo]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) navigateTo(currentIndex - 1);
  }, [currentIndex, navigateTo]);

  const agreeTermsConditions = useWatch({
    control: methods.control,
    name: "agreeTermsConditions",
    defaultValue: false,
  });

  // Onboarding submission mutation
  const onboardingMutation = useMutation({
    mutationFn: (data: FullCompanyFormType) => {
      const apiData = transformFormDataToApiRequest(data);
      console.log("🚀 ~ OnBoardForm ~ apiData:", data, apiData);
      return apiOnboardingSubmit<{ success: boolean; message: string }>(
        apiData,
      );
    },
    onSuccess: (response: { success: boolean; message: string }) => {
      toast.success(response.message || "Profile submitted successfully!");
      setConfirmation([false, undefined]);
      reset(transformApiResponseToFormData());
      qc.invalidateQueries({ queryKey: [ENDPOINTS.SELLER.GET_COMPANY_LIST] });
      goNext();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      console.error("Onboarding submission error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit profile. Please try again.",
      );
    },
  });

  // Validate current form slice before advancing
  const onNext = useCallback(async () => {
    if (!isFormStep) {
      goNext();
      return;
    }
    const sliceKey = currentItem.value as StepKey;
    const values = watch();
    const names = getFieldNamesForStep(sliceKey, values, mode);

    if (!(await trigger(names))) {
      toast.error(`Please fill all required fields in ${sliceKey}`);
      return;
    }

    goNext();
  }, [isFormStep, currentItem.value, watch, trigger, goNext, mode]);

  // Submit entire form then advance to thank-you
  const onFinish = handleSubmit(
    (data) => {
      console.log("🚀 ~ OnBoardForm ~ data:", data);
      setConfirmation([true, data]);
    },
    (error) => {
      console.error("Error in form submission:", error);

      // Extract field-specific error messages
      if (error && typeof error === "object") {
        const errorMessages: string[] = [];

        // Check for specific field errors
        Object.keys(error).forEach((fieldName) => {
          const fieldError = (error as Record<string, unknown>)[fieldName];
          if (
            fieldError &&
            typeof fieldError === "object" &&
            "message" in fieldError &&
            typeof (fieldError as Record<string, unknown>).message === "string"
          ) {
            errorMessages.push(
              `${fieldName}: ${(fieldError as Record<string, unknown>).message}`,
            );
          }
        });

        if (errorMessages.length > 0) {
          // Show first few error messages
          const displayMessage = errorMessages.slice(0, 3).join(", ");
          toast.error(
            `Form errors: ${displayMessage}${errorMessages.length > 3 ? "..." : ""}`,
          );
        } else {
          toast.error("Please fix the form errors before proceeding");
        }
      } else {
        toast.error("Please fix the form errors before proceeding");
      }
    },
  );

  const onConfirm = () => {
    if (!confirmation[1]) return;
    onboardingMutation.mutate(confirmation[1]);
  };

  const handleBack = () => {
    navigate(PANEL_ROUTES.ONBOARD.COMPANY);
  };

  // Pick page-specific component
  const { title, description, Component } = currentItem;

  return (
    <OnBoardContext.Provider
      value={{
        mode,
        goNext: onNext,
        goBack,
        currentIndex,
      }}
    >
      <FormProvider {...methods}>
        {isFormStep && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentItem.step === lastStep) {
                onFinish();
              } else {
                onNext();
              }
            }}
            className="flex-1 space-y-10"
          >
            <div className="flex w-full gap-3">
              <Button
                className="border-muted-foreground"
                variant="ghost"
                color="default"
                size="icon"
                onClick={handleBack}
                aria-label="Go back"
                type="button"
              >
                <ArrowLeftIcon />
              </Button>
              <div className="w-full">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{currentItem?.stepTitle}</p>
                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground text-sm">
                      {STEPS[currentIndex].step} / {formStep.length}
                    </p>
                  </div>
                </div>
                <Stepper
                  value={STEPS[currentIndex].step}
                  onValueChange={(v) => {
                    if (onboardingMutation.isPending) return;

                    const targetIndex = STEPS.findIndex(
                      (s) => s.step === Number(v),
                    );
                    const targetStep = STEPS[targetIndex]?.value;

                    if (targetStep) {
                      const targetStepIndex = STEP_ORDER.indexOf(targetStep);
                      const currentStepIndex = STEP_ORDER.indexOf(currentValue);
                      const firstIncompleteStep = getFirstIncompleteStep();
                      const firstIncompleteIndex =
                        STEP_ORDER.indexOf(firstIncompleteStep);

                      // Always allow navigating backward or staying within completed range
                      if (targetStepIndex <= currentStepIndex) {
                        navigateTo(targetIndex);
                        return;
                      }

                      // Thank you page guard
                      if (
                        targetStep === StepKey.THANK_YOU &&
                        !areAllStepsCompleted()
                      ) {
                        toast.error(
                          "Please complete all steps before accessing the thank you page",
                        );
                        return;
                      }

                      // Allow moving forward only up to the first incomplete step
                      if (targetStepIndex <= firstIncompleteIndex) {
                        navigateTo(targetIndex);
                      } else {
                        const stepTitle =
                          STEPS.find((s) => s.value === firstIncompleteStep)
                            ?.stepTitle || "target step";
                        toast.error(
                          `Please complete ${stepTitle} first before proceeding to the next step.`,
                        );
                      }
                    }
                  }}
                  className="gap-1"
                >
                  {formStep.map((n) => {
                    const stepIndex = n - 1;
                    const stepKey = [
                      StepKey.COMPANY_DETAILS,
                      StepKey.ADDRESS_DETAILS,
                      StepKey.BRAND_DETAILS,
                      StepKey.DOCUMENTS_DETAILS,
                      StepKey.PERSONAL_INFORMATION,
                    ][stepIndex];

                    if (!stepKey) return null;

                    return (
                      <StepperItem key={n} step={n} className="flex-1">
                        <StepperTrigger
                          className="w-full flex-col items-start gap-2"
                          asChild
                        >
                          <StepperIndicator
                            asChild
                            className={"h-2 w-full transition-colors"}
                          >
                            <span className="sr-only">{n}</span>
                          </StepperIndicator>
                        </StepperTrigger>
                      </StepperItem>
                    );
                  })}
                </Stepper>
              </div>
            </div>

            <div>
              <h4 className="pb-1 font-bold">{title}</h4>
              <p className="text-muted-foreground">{description}</p>
            </div>

            <Suspense
              fallback={
                <div className="space-y-6 bg-white">
                  <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
                    <div className="h-10 rounded bg-gray-200"></div>
                    <div className="h-10 rounded bg-gray-200"></div>
                  </div>

                  <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
                    <div className="h-10 rounded bg-gray-200"></div>
                    <div className="h-10 rounded bg-gray-200"></div>
                  </div>

                  <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
                    <div className="h-10 rounded bg-gray-200"></div>
                    <div className="h-10 rounded bg-gray-200"></div>
                  </div>

                  <div className="animate-pulse">
                    <div className="h-20 rounded bg-gray-200"></div>
                  </div>
                </div>
              }
            >
              <Component mode={mode} />
            </Suspense>

            <div className="bg-background sticky bottom-0 mt-auto flex justify-between border-t py-4">
              {!isFirst && (
                <Button
                  size={"lg"}
                  type="button"
                  color={"secondary"}
                  onClick={goBack}
                  disabled={isFirst || onboardingMutation.isPending}
                  className={"button-outline"}
                  startIcon={<ArrowLeftIcon />}
                >
                  Back
                </Button>
              )}
              <Button
                size={"lg"}
                type="submit"
                variant={"contained"}
                color={"secondary"}
                endIcon={
                  currentItem.step === lastStep ? (
                    <DocumentIcon />
                  ) : (
                    <ArrowRightIcon />
                  )
                }
                disabled={
                  (currentItem.step === lastStep && !agreeTermsConditions) ||
                  onboardingMutation.isPending
                }
                className="ml-auto"
              >
                {currentItem.step === lastStep
                  ? onboardingMutation.isPending
                    ? "Submitting..."
                    : "Submit"
                  : "Next"}
              </Button>
            </div>
          </form>
        )}

        {/* {isConfirmation && <>COnfirm</>} */}

        <ConfirmationDialog
          isOpen={confirmation[0]}
          onClose={() => setConfirmation([false, undefined])}
          title="Submit Profile?"
          description="Are you sure you want to submit your company profile for review? Once submitted, your information will be sent to the admin for approval. You’ll be notified after your profile is reviewed."
          actionButtons={[
            {
              label: onboardingMutation.isPending ? "Submitting..." : "Confirm",
              onClick: onConfirm,
              color: "primary",
              disabled: onboardingMutation.isPending,
            },
          ]}
          showCancel={true}
          cancelText="Close"
        />

        {isThankYou && (
          <Suspense fallback={<div className="py-10">Loading...</div>}>
            <Component mode={mode} />
          </Suspense>
        )}
      </FormProvider>
    </OnBoardContext.Provider>
  );
};

export default OnBoardForm;
