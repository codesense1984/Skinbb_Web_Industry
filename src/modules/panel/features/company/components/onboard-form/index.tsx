import onBoarding from "@/core/assets/images/onboard-company.jpg";
import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/core/components/ui/stepper";
import { HorizontalLogo } from "@/core/config/svg";
import { MODE } from "@/core/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { apiOnboardingSubmit } from "../../../../services/http/company.service";
import {
  fullCompanyDefaultValues,
  fullCompanyDetailsSchema,
  fullCompanyZodSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
import { transformFormDataToApiRequest } from "../../utils/onboarding.utils";
import { AddressDetails } from "./AddressDetails";
import BrandDetails from "./BrandDetails";
import CompanyDetails from "./CompanyDetails";
import { DocumentDetails } from "./DocumentDetails";
import PersonalDetails from "./PersonalDetails";
import Thankyou from "./Thankyou";
import { cn } from "@/core/utils";

export enum StepKey {
  // START = "start",
  PERSONAL_INFORMATION = "personal_information",
  COMPANY_DETAILS = "company_information",
  ADDRESS_DETAILS = "address_information",
  DOCUMENTS_DETAILS = "documents_information",
  BRAND_DETAILS = "brand_information",
  // CONFIRMATION = "confirmation",
  THANK_YOU = "thank_you",
}

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
  Component: FC<{ mode: MODE }>;
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
    Component: memo(CompanyDetails),
  },
  {
    step: StepCount[StepKey.ADDRESS_DETAILS],
    stepTitle: "Address information",
    value: StepKey.ADDRESS_DETAILS,
    title: "Tell Us Your Address",
    description:
      "We need your registered address to keep our records accurate and compliant.",
    Component: memo(AddressDetails),
  },
  {
    step: StepCount[StepKey.BRAND_DETAILS],
    stepTitle: "Brand details",
    value: StepKey.BRAND_DETAILS,
    title: "Brand Identity",
    description: "Define your brand identity and logo.",
    Component: memo(BrandDetails),
  },
  {
    step: StepCount[StepKey.DOCUMENTS_DETAILS],
    stepTitle: "Documents information",
    value: StepKey.DOCUMENTS_DETAILS,
    title: "Prove Your Legitimacy",
    description: "Upload your legal documents for verification.",
    Component: memo(DocumentDetails),
  },
  {
    step: StepCount[StepKey.PERSONAL_INFORMATION],
    stepTitle: "Personal",
    value: StepKey.PERSONAL_INFORMATION,
    title: "Build your personal space",
    description:
      "Your journey with SkinBB starts here. We're excited to have you on board!",
    Component: memo(PersonalDetails),
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
    Component: memo(Thankyou),
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
  const [searchParams, setSearchParams] = useSearchParams();

  const currentValue =
    (searchParams.get("step") as StepKey) || StepKey.COMPANY_DETAILS;

  const [confirmation, setConfirmation] = useState<
    [boolean, FullCompanyFormType | undefined]
  >([false, undefined]);

  const methods = useForm<FullCompanyFormType>({
    defaultValues: fullCompanyDefaultValues(),
    resolver: zodResolver(fullCompanyZodSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, watch, formState, setError } = methods;

  // Function to find the first incomplete step (synchronous for UI)
  const getFirstIncompleteStep = useCallback((): StepKey => {
    const stepOrder = [
      StepKey.COMPANY_DETAILS,
      StepKey.ADDRESS_DETAILS,
      StepKey.BRAND_DETAILS,
      StepKey.DOCUMENTS_DETAILS,
      StepKey.PERSONAL_INFORMATION,
    ];

    const values = watch();
    for (const step of stepOrder) {
      let isStepCompleted = false;

      switch (step) {
        case StepKey.COMPANY_DETAILS:
          isStepCompleted = !!(
            values.companyName?.trim() &&
            values.category?.trim() &&
            values.businessType?.trim() &&
            values.establishedIn
          );
          break;

        case StepKey.ADDRESS_DETAILS:
          isStepCompleted =
            values.address?.every(
              (addr) =>
                addr.address?.trim() &&
                addr.landmark?.trim() &&
                addr.phoneNumber?.trim() &&
                addr.country?.trim() &&
                addr.state?.trim() &&
                addr.city?.trim() &&
                addr.postalCode?.trim(),
            ) || false;
          break;

        case StepKey.BRAND_DETAILS:
          isStepCompleted = !!(
            values.brandName?.trim() &&
            values.totalSkus?.trim() &&
            values.productCategory?.trim() &&
            values.averageSellingPrice?.trim() &&
            values.marketingBudget?.trim()
          );
          break;

        case StepKey.DOCUMENTS_DETAILS:
          isStepCompleted =
            values.documents?.every((doc) =>
              doc.type === "coi"
                ? doc.number?.trim() && doc.url?.trim()
                : doc.type === "pan"
                  ? doc.number?.trim() && doc.url?.trim()
                  : doc.type === "gstLicense"
                    ? doc.url?.trim()
                    : doc.type === "msme"
                      ? doc.url?.trim()
                      : doc.type === "brandAuthorisation"
                        ? doc.url?.trim()
                        : true,
            ) || false;
          break;

        case StepKey.PERSONAL_INFORMATION:
          isStepCompleted = !!(
            values.name?.trim() &&
            values.email?.trim() &&
            values.designation?.trim() &&
            values.phoneNumber?.trim() &&
            values.password?.trim() &&
            values.phoneVerified
          );
          break;

        default:
          isStepCompleted = false;
      }

      if (!isStepCompleted) {
        return step;
      }
    }
    return StepKey.THANK_YOU;
  }, [watch]);

  // Function to check if all form steps are completed (synchronous for UI)
  const areAllStepsCompleted = useCallback((): boolean => {
    const stepOrder = [
      StepKey.COMPANY_DETAILS,
      StepKey.ADDRESS_DETAILS,
      StepKey.BRAND_DETAILS,
      StepKey.DOCUMENTS_DETAILS,
      StepKey.PERSONAL_INFORMATION,
    ];

    const values = watch();
    return stepOrder.every((step) => {
      switch (step) {
        case StepKey.COMPANY_DETAILS:
          return !!(
            values.companyName?.trim() &&
            values.category?.trim() &&
            values.businessType?.trim() &&
            values.establishedIn &&
            values.logo_files?.length
          );

        case StepKey.ADDRESS_DETAILS:
          return (
            values.address?.every(
              (addr) =>
                addr.address?.trim() &&
                addr.landmark?.trim() &&
                addr.phoneNumber?.trim() &&
                addr.country?.trim() &&
                addr.state?.trim() &&
                addr.city?.trim() &&
                addr.postalCode?.trim(),
            ) || false
          );

        case StepKey.BRAND_DETAILS:
          return !!(
            values.brandName?.trim() &&
            values.totalSkus?.trim() &&
            values.productCategory?.trim() &&
            values.averageSellingPrice?.trim() &&
            values.marketingBudget?.trim()
          );

        case StepKey.DOCUMENTS_DETAILS:
          return (
            values.documents?.every((doc) =>
              doc.type === "coi"
                ? doc.number?.trim() && doc.url?.trim()
                : doc.type === "pan"
                  ? doc.number?.trim() && doc.url?.trim()
                  : doc.type === "gstLicense"
                    ? doc.url?.trim()
                    : doc.type === "msme"
                      ? doc.url?.trim()
                      : doc.type === "brandAuthorisation"
                        ? doc.url?.trim()
                        : true,
            ) || false
          );

        case StepKey.PERSONAL_INFORMATION:
          return !!(
            values.name?.trim() &&
            values.email?.trim() &&
            values.designation?.trim() &&
            values.phoneNumber?.trim() &&
            values.password?.trim() &&
            values.phoneVerified
          );

        default:
          return false;
      }
    });
  }, [watch]);

  // Function to check if a step can be accessed (synchronous for UI)
  const canAccessStep = useCallback(
    (stepKey: StepKey): boolean => {
      const stepOrder = [
        StepKey.COMPANY_DETAILS,
        StepKey.ADDRESS_DETAILS,
        StepKey.BRAND_DETAILS,
        StepKey.DOCUMENTS_DETAILS,
        StepKey.PERSONAL_INFORMATION,
      ];

      const stepIndex = stepOrder.indexOf(stepKey);

      // First step is always accessible
      if (stepIndex === 0) return true;

      // Check if all previous steps are completed using synchronous logic
      const values = watch();
      for (let i = 0; i < stepIndex; i++) {
        const prevStep = stepOrder[i];
        let isPrevStepCompleted = false;

        switch (prevStep) {
          case StepKey.COMPANY_DETAILS:
            isPrevStepCompleted = !!(
              values.companyName?.trim() &&
              values.category?.trim() &&
              values.businessType?.trim() &&
              values.establishedIn &&
              values.logo_files?.length
            );
            break;

          case StepKey.ADDRESS_DETAILS:
            isPrevStepCompleted =
              values.address?.every(
                (addr) =>
                  addr.address?.trim() &&
                  addr.landmark?.trim() &&
                  addr.phoneNumber?.trim() &&
                  addr.country?.trim() &&
                  addr.state?.trim() &&
                  addr.city?.trim() &&
                  addr.postalCode?.trim(),
              ) || false;
            break;

          case StepKey.BRAND_DETAILS:
            isPrevStepCompleted = !!(
              values.brandName?.trim() &&
              values.totalSkus?.trim() &&
              values.productCategory?.trim() &&
              values.averageSellingPrice?.trim() &&
              values.marketingBudget?.trim()
            );
            break;

          case StepKey.DOCUMENTS_DETAILS:
            isPrevStepCompleted =
              values.documents?.every((doc) =>
                doc.type === "coi"
                  ? doc.number?.trim() && doc.url?.trim()
                  : doc.type === "pan"
                    ? doc.number?.trim() && doc.url?.trim()
                    : doc.type === "gstLicense"
                      ? doc.url?.trim()
                      : doc.type === "msme"
                        ? doc.url?.trim()
                        : doc.type === "brandAuthorisation"
                          ? doc.url?.trim()
                          : true,
              ) || false;
            break;

          case StepKey.PERSONAL_INFORMATION:
            isPrevStepCompleted = !!(
              values.name?.trim() &&
              values.email?.trim() &&
              values.designation?.trim() &&
              values.phoneNumber?.trim() &&
              values.password?.trim() &&
              values.phoneVerified
            );
            break;

          default:
            isPrevStepCompleted = false;
        }

        if (!isPrevStepCompleted) {
          return false;
        }
      }

      return true;
    },
    [watch],
  );

  // Validate step navigation when URL changes
  useEffect(() => {
    const currentStep = currentValue;

    // Check if trying to access thank you page without completing all steps
    if (currentStep === StepKey.THANK_YOU && !areAllStepsCompleted()) {
      const firstIncompleteStep = getFirstIncompleteStep();
      toast.error(
        "Please complete all steps before accessing the thank you page",
      );
      setSearchParams({ step: firstIncompleteStep });
      return;
    }

    // Skip validation for thank you page if all steps are completed
    if (currentStep === StepKey.THANK_YOU) {
      return;
    }

    // Check if current step is accessible
    if (!canAccessStep(currentStep)) {
      // Redirect to first incomplete step
      const firstIncompleteStep = getFirstIncompleteStep();
      if (firstIncompleteStep !== currentStep) {
        const stepTitle =
          STEPS.find((s) => s.value === firstIncompleteStep)?.stepTitle ||
          "previous step";
        toast.error(
          `Please complete ${stepTitle} first before proceeding to the next step.`,
        );
        setSearchParams({ step: firstIncompleteStep });
        return;
      }
    }
  }, [
    currentValue,
    canAccessStep,
    getFirstIncompleteStep,
    setSearchParams,
    areAllStepsCompleted,
  ]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const currentStep = searchParams.get("step") as StepKey;

      // Check if trying to access thank you page without completing all steps
      if (currentStep === StepKey.THANK_YOU && !areAllStepsCompleted()) {
        const firstIncompleteStep = getFirstIncompleteStep();
        toast.error(
          "Please complete all steps before accessing the thank you page",
        );
        setSearchParams({ step: firstIncompleteStep });
        return;
      }

      if (currentStep && !canAccessStep(currentStep)) {
        const firstIncompleteStep = getFirstIncompleteStep();
        if (firstIncompleteStep !== currentStep) {
          const stepTitle =
            STEPS.find((s) => s.value === firstIncompleteStep)?.stepTitle ||
            "previous step";
          toast.error(
            `Please complete ${stepTitle} first before proceeding to the next step.`,
          );
          setSearchParams({ step: firstIncompleteStep });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    canAccessStep,
    getFirstIncompleteStep,
    setSearchParams,
    searchParams,
    areAllStepsCompleted,
  ]);

  const currentItem = useMemo(
    () => STEPS.find((s) => s.value === currentValue) ?? STEPS[0],
    [currentValue],
  );
  console.log("🚀 ~ OnBoardForm ~ currentItem:", currentItem);

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
    (idx: number) => setSearchParams({ step: STEPS[idx].value }),
    [setSearchParams],
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
      const apiRequestData = transformFormDataToApiRequest(data);
      console.log("🚀 ~ OnBoardForm ~ apiRequestData:", apiRequestData);
      return apiOnboardingSubmit<{ success: boolean; message: string }>(
        apiRequestData,
      );
    },
    onSuccess: (response: { success: boolean; message: string }) => {
      console.log("🚀 ~ OnBoardForm ~ response:", response);
      toast.success(response.message || "Profile submitted successfully!");
      setConfirmation([false, undefined]);
      goNext();
    },
    onError: (error: any) => {
      console.error("Onboarding submission error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit profile. Please try again.",
      );
    },
  });

  console.log(watch(), formState.errors, "watch");
  // Validate current form slice before advancing
  const onNext = useCallback(async () => {
    if (!isFormStep) {
      goNext();
      return;
    }
    const sliceKey = currentItem.value as StepKey;
    let names: (keyof FullCompanyFormType)[] = [];
    const values = watch();

    switch (sliceKey) {
      case StepKey.PERSONAL_INFORMATION: {
        names = fullCompanyDetailsSchema
          .personal_information({ mode })
          .map((f) => f.name) as (keyof FullCompanyFormType)[];
        // add check phoneNumber and for password
        if (!values.phoneNumber) {
          names.push("phoneNumber");
        }
        if (!values.password) {
          names.push("password");
        }
        if (!values.phoneVerified) {
          names.push("phoneVerified");
        }

        break;
      }

      case StepKey.COMPANY_DETAILS:
        names = fullCompanyDetailsSchema
          .company_information({ mode })
          .map((f) => f.name) as (keyof FullCompanyFormType)[];

        // Manual cross-field check to ensure HQ location when subsidiary is yes
        try {
          const isSubsidiarySelected = JSON.parse(
            String(values.isSubsidiary || "false"),
          );
          const isHeadquarterMissing = !String(
            values.headquarterLocation || "",
          ).trim();
          if (isSubsidiarySelected && isHeadquarterMissing) {
            setError("headquarterLocation", {
              type: "manual",
              message: "Headquarter location is required for subsidiaries.",
            });
            return;
          }
        } catch {}
        break;

      case StepKey.ADDRESS_DETAILS:
        values.address.forEach((_, index) => {
          const dName = fullCompanyDetailsSchema
            .address_information({
              mode,
              index,
              disabled: false,
              disabledAddressType: false,
            })
            .map((f) => f.name) as (keyof FullCompanyFormType)[];
          names = [...names, ...dName];
        });
        break;

      case StepKey.BRAND_DETAILS:
        // Add brand information fields
        const brandInfoNames = fullCompanyDetailsSchema
          .brand_information({ mode })
          .map((f) => f.name) as (keyof FullCompanyFormType)[];
        names = [...names, ...brandInfoNames];

        // Add selling platforms fields
        values.sellingOn?.forEach((_, index) => {
          const platformNames = fullCompanyDetailsSchema
            .selling_platforms({ mode, index })
            .map((f) => f.name) as (keyof FullCompanyFormType)[];
          names = [...names, ...platformNames];
        });
        break;

      case StepKey.DOCUMENTS_DETAILS: {
        values.documents.forEach((_, index) => {
          const dName = fullCompanyDetailsSchema
            .documents_information({ mode, index })
            .map((f) => f.name) as (keyof FullCompanyFormType)[];
          names = [...names, ...dName];
        });
        break;
      }

      default:
        goNext();
        return;
    }

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
            typeof fieldError.message === "string"
          ) {
            errorMessages.push(`${fieldName}: ${fieldError.message}`);
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

  // Pick page-specific component
  const { title, description, Component } = currentItem;

  return (
    <OnBoardContext.Provider
      value={{ mode, goNext: onNext, goBack, currentIndex }}
    >
      <FormProvider {...methods}>
        <div className="w-full gap-4 md:h-[100vh]">
          <div className="relative grid grid-cols-1 md:grid-cols-12">
            <div
              className="relative p-4 py-10 before:absolute before:inset-0 before:bg-linear-to-b before:from-black/90 before:to-black/10 before:content-['*'] md:sticky md:top-0 md:col-span-5 md:h-[100dvh] md:px-8 md:py-12 md:before:z-[-1]"
              style={{
                backgroundImage: `url(${onBoarding})`,
                backgroundSize: "cover",
              }}
            >
              <div className="dark relative z-[1] space-y-6 text-center">
                <HorizontalLogo className="" />
                <h1 className="text-foreground h3">Corporate Compliance </h1>
                <p className="font-normal">
                  To ensure regulatory alignment and maintain accurate company
                  records, please complete this form with your organization’s
                  official details. The information provided will be used solely
                  for compliance, verification, and onboarding purposes.
                </p>
              </div>
            </div>
            <div className="col-span-7 mx-auto w-full max-w-2xl space-y-10 p-4 py-6 md:px-6 md:pt-12 md:pb-0">
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
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{currentItem?.stepTitle}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {/* <div className="h-2 w-24 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500 transition-all duration-300"
                              style={{
                                width: `${getFormCompletionPercentage()}%`,
                              }}
                            ></div>
                          </div> */}
                          {/* <span className="text-muted-foreground text-xs">
                            {getFormCompletionPercentage()}% Complete
                          </span> */}
                        </div>
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
                          // Allow going back to previous steps
                          const stepOrder = [
                            StepKey.COMPANY_DETAILS,
                            StepKey.ADDRESS_DETAILS,
                            StepKey.BRAND_DETAILS,
                            StepKey.DOCUMENTS_DETAILS,
                            StepKey.PERSONAL_INFORMATION,
                          ];

                          const targetStepIndex = stepOrder.indexOf(targetStep);
                          const currentStepIndex =
                            stepOrder.indexOf(currentValue);

                          if (targetStepIndex < currentStepIndex) {
                            navigateTo(targetIndex);
                            return;
                          }

                          // Check if target step is accessible
                          if (
                            targetStep === StepKey.THANK_YOU &&
                            !areAllStepsCompleted()
                          ) {
                            toast.error(
                              "Please complete all steps before accessing the thank you page",
                            );
                            return;
                          }

                          if (canAccessStep(targetStep)) {
                            navigateTo(targetIndex);
                          } else {
                            const stepTitle =
                              STEPS.find((s) => s.value === targetStep)
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
                                className={`h-2 w-full transition-colors`}
                              >
                                <span className="sr-only">{n}</span>
                              </StepperIndicator>
                            </StepperTrigger>
                          </StepperItem>
                        );
                      })}
                    </Stepper>
                  </div>

                  <div>
                    <h4 className="pb-1 font-bold">{title}</h4>
                    <p className="text-muted-foreground">{description}</p>
                  </div>

                  <Component mode={mode} />

                  <div className="bg-background sticky bottom-0 mt-auto flex justify-between border-t py-4">
                    {!isFirst && (
                      <Button
                        type="button"
                        onClick={goBack}
                        disabled={isFirst || onboardingMutation.isPending}
                        className={"button-outline"}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant={"contained"}
                      color="primary"
                      disabled={
                        (currentItem.step === lastStep &&
                          !agreeTermsConditions) ||
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
                    label: onboardingMutation.isPending
                      ? "Submitting..."
                      : "Confirm",
                    onClick: onConfirm,
                    color: "primary",
                    disabled: onboardingMutation.isPending,
                  },
                ]}
                showCancel={true}
                cancelText="Close"
              />

              {isThankYou && <Component mode={mode} />}
            </div>
          </div>
        </div>
      </FormProvider>
    </OnBoardContext.Provider>
  );
};

export default OnBoardForm;
