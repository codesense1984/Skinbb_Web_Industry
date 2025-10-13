import { ConfirmationDialog } from "@/core/components/ui/alert-dialog";
import { MODE } from "@/core/types";
import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { CompanyOnboading } from "@/modules/panel/types";
import { StepKey } from "../../../config/steps.config";
import { FullLoader } from "@/core/components/ui/loader";
import ErrorDisplaySection from "./ErrorDisplaySection";
import { useOnboardingForm } from "./hooks/useOnboardingForm";
import { useStepNavigation } from "./hooks/useStepNavigation";
import { FormHeader } from "./components/FormHeader";
import { FormFooter } from "./components/FormFooter";
import { LoadingSection } from "./components/LoadingSection";
import { FormSteps } from "./constants";
import { transformApiResponseToFormData } from "../../../utils/onboarding.utils";

// Lazy load step components
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

// Create STEPS array with components
export const STEPS_WITH_COMPONENTS = [
  {
    step: 1,
    stepTitle: "Company information",
    value: StepKey.COMPANY_DETAILS,
    title: "Build Your Business Identity",
    description: "Lay the foundation with your core company details.",
    Component: CompanyDetails,
  },
  {
    step: 2,
    stepTitle: "Address information",
    value: StepKey.ADDRESS_DETAILS,
    title: "Tell Us Your Address",
    description:
      "We need your registered address to keep our records accurate and compliant.",
    Component: AddressDetails,
  },
  {
    step: 3,
    stepTitle: "Brand details",
    value: StepKey.BRAND_DETAILS,
    title: "Brand Identity",
    description: "Define your brand identity and logo.",
    Component: BrandDetails,
  },
  {
    step: 4,
    stepTitle: "Documents information",
    value: StepKey.DOCUMENTS_DETAILS,
    title: "Prove Your Legitimacy",
    description: "Upload your legal documents for verification.",
    Component: DocumentDetails,
  },
  {
    step: 5,
    stepTitle: "Personal",
    value: StepKey.PERSONAL_INFORMATION,
    title: "Build your personal space",
    description:
      "Your journey with SkinBB starts here. We're excited to have you on board!",
    Component: PersonalDetails,
  },
  {
    step: 6,
    stepTitle: "Thank You",
    value: StepKey.THANK_YOU,
    title: "Thank You for Submitting Your Company Profile!",
    description:
      "Your details have been successfully submitted for review. We'll be in touch soon.",
    Component: Thankyou,
  },
];

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

const OnBoardForm = ({
  mode = MODE.ADD,
  initialData,
  isLocationEdit = false,
}: {
  mode?: MODE;
  initialData?: CompanyOnboading;
  isLocationEdit?: boolean;
}) => {
  const navigate = useNavigate();

  // Use custom hooks for form logic and navigation
  const {
    methods,
    currentValue,
    setCurrentValue,
    confirmation,
    setConfirmation,
    hasAttemptedSubmit,
    agreeTermsConditions,
    isLoadingCompanyDropdown,
    onboardingMutation,
    getFirstIncompleteStep,
    areAllStepsCompleted,
    onFinish,
    onConfirm,
  } = useOnboardingForm({ mode, initialData, isLocationEdit });

  const currentItem = useMemo(
    () =>
      STEPS_WITH_COMPONENTS.find((s) => s.value === currentValue) ??
      STEPS_WITH_COMPONENTS[0],
    [currentValue],
  );

  const isFormStep = FormSteps.includes(currentItem?.step as any);
  const isThankYou = currentItem.step === 6; // Thank you step

  const {
    goBack,
    onNext,
    handleStepChange,
    currentIndex,
    isFirst,
    isLast,
    isVerifyingDocuments,
  } = useStepNavigation({
    currentValue,
    setCurrentValue,
    getFirstIncompleteStep,
    areAllStepsCompleted,
    isFormStep,
    currentItem,
    methods,
    mode,
    steps: STEPS_WITH_COMPONENTS,
  });

  const handleBack = () => {
    navigate(PANEL_ROUTES.ONBOARD.COMPANY);
  };

  const handleStepChangeWrapper = (value: number) => {
    handleStepChange(value, STEPS_WITH_COMPONENTS);
  };

  const handleNext = () => {
    onNext(STEPS_WITH_COMPONENTS);
  };

  const handleGoBack = () => {
    goBack(STEPS_WITH_COMPONENTS);
  };

  useEffect(() => {
    if (onboardingMutation.isSuccess) {
      onNext(STEPS_WITH_COMPONENTS);
      methods.reset(transformApiResponseToFormData());
    }
  }, [onboardingMutation.isSuccess, onNext, methods.reset]);

  // Pick page-specific component
  const { title, description, Component } = currentItem;

  return (
    <OnBoardContext.Provider
      value={{
        mode,
        goNext: handleNext,
        goBack: handleGoBack,
        currentIndex,
      }}
    >
      <FormProvider {...methods}>
        {isLoadingCompanyDropdown && <FullLoader />}
        {isFormStep && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isLast) {
                onFinish();
              } else {
                handleNext();
              }
            }}
            className="flex-1 space-y-10"
          >
            <FormHeader
              currentItem={currentItem}
              onBack={handleBack}
              onStepChange={handleStepChangeWrapper}
            />

            <div>
              <h4 className="pb-1 font-bold">{title}</h4>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {/* Error Display Section - Only show on Personal Details step after user attempts to submit */}
            {currentValue === StepKey.PERSONAL_INFORMATION &&
              hasAttemptedSubmit && <ErrorDisplaySection />}

            <Suspense fallback={<LoadingSection />}>
              <Component mode={mode} />
            </Suspense>

            <FormFooter
              isFirst={isFirst}
              isLast={isLast}
              agreeTermsConditions={agreeTermsConditions}
              isPending={onboardingMutation.isPending || isVerifyingDocuments}
              isVerifyingDocuments={isVerifyingDocuments}
              onBack={handleGoBack}
            />
          </form>
        )}

        <ConfirmationDialog
          isOpen={confirmation[0]}
          onClose={() => setConfirmation([false, undefined])}
          title="Submit Profile?"
          description="Are you sure you want to submit your company profile for review? Once submitted, your information will be sent to the admin for approval. You'll be notified after your profile is reviewed."
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
          <Suspense fallback={<LoadingSection />}>
            <Component mode={mode} />
          </Suspense>
        )}
      </FormProvider>
    </OnBoardContext.Provider>
  );
};

export default OnBoardForm;
