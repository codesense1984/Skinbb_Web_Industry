import onBoarding from "@/core/assets/images/onboard-company.jpg";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/core/components/ui/stepper";
import { HorizontalLogo } from "@/core/config/svg";
import { MODE, type CompanyBrand } from "@/core/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSearchParams } from "react-router";
import type { FullCompanyFormType } from "../../schema/fullCompany.schema";

export enum Step {
  company_details = "company_details",
  brand_details = "brand_details",
  users_details = "users_details",
  review = "review",
}

interface StepItem {
  step: number;
  stepTitle: string;
  value: string;
  title: string;
  description: string;
}

type OnBoardFormData = {
  [Step.company_details]?: FullCompanyFormType;
  [Step.brand_details]?: CompanyBrand;
  [Step.users_details]?: unknown;
};

const steps: StepItem[] = [
  {
    step: 1,
    stepTitle: "Company details",
    value: Step.company_details,
    title: "Build Your Business Identity",
    description:
      "Tell us who you are — lay the foundation with your core company details.",
  },
  {
    step: 2,
    stepTitle: "Brand details",
    value: Step.brand_details,
    title: "Tell Us Your Address",
    description:
      "We need your registered address to keep our records accurate and compliant.",
  },
  {
    step: 3,
    stepTitle: "Users details",
    value: Step.users_details,
    title: "Prove Your Legitimacy",
    description:
      "Provide your registered and operational address details for accurate records and compliance.",
  },
  // {
  //   step: 4,
  //   title: "Review",
  //   value: Step.review,
  // },
];

type OnBoardContextType = {
  currentTab: string;
  setCurrentTab: (step: number) => void;
  steps: StepItem[];
  currentItem: StepItem | undefined;
  mode: MODE;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setForm: Dispatch<SetStateAction<OnBoardFormData>>;
  form: OnBoardFormData;
};

const OnBoardContext = createContext<OnBoardContextType | undefined>(undefined);

export const useOnBoardContext = () => {
  const context = useContext(OnBoardContext);
  if (!context) {
    throw new Error("useOnBoardContext must be used within OnBoardProvider");
  }
  return context;
};

const OnBoardForm = ({ mode = MODE.ADD }: { mode?: MODE }) => {
  const [searchParam, setSearchParam] = useSearchParams();

  const [form, setForm] = useState<OnBoardFormData>({
    [Step.company_details]: undefined,
    // [Step.users_details]: undefined,
    // [Step.brand_details]: undefined,
  });

  const currentTab = searchParam.get("currentTab") ?? steps[0].value;
  const currentItem = steps.find((item) => item.value === currentTab);

  const setCurrentTab = useCallback(
    (step: number) => {
      const data = steps.find((item) => item.step === step);
      setSearchParam({ currentTab: data?.value ?? "" });
    },
    [setSearchParam],
  );

  const goToNextStep = useCallback(() => {
    if (currentItem && currentItem.step < steps.length) {
      setCurrentTab(currentItem.step + 1);
    }
  }, [currentItem, setCurrentTab]);

  const goToPreviousStep = useCallback(() => {
    if (currentItem && currentItem.step > 1) {
      setCurrentTab(currentItem.step - 1);
    }
  }, [currentItem, setCurrentTab]);

  const currentComponent = useMemo(() => {
    switch (currentTab) {
      // case Step.company_details:
      //   return <CompanyDetails />;
      // case Step.brand_details:
      //   return <Brands />;
      default:
        // return <CompanyDetails />;
        return <>Div</>;
    }
  }, [currentTab]);

  const contextValue = useMemo(
    () => ({
      currentTab,
      currentItem,
      steps,
      mode,
      form,
      setForm,
      setCurrentTab,
      goToNextStep,
      goToPreviousStep,
    }),
    [
      form,
      currentTab,
      currentItem,
      mode,
      setCurrentTab,
      goToNextStep,
      goToPreviousStep,
    ],
  );
  return (
    <OnBoardContext.Provider value={contextValue}>
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
          <div className="col-span-7 mx-auto w-full max-w-xl space-y-10 p-4 py-6 md:py-12">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{currentItem?.stepTitle}</p>
                <p>
                  {currentItem?.step}/{steps.length}
                </p>
              </div>
              <Stepper
                defaultValue={currentItem?.step}
                onValueChange={setCurrentTab}
                className="gap-1"
              >
                {steps.map(({ step }) => (
                  <StepperItem key={step} step={step} className="flex-1">
                    <StepperTrigger
                      className="w-full flex-col items-start gap-2"
                      asChild
                    >
                      <StepperIndicator
                        asChild
                        className="bg-border h-2 w-full"
                      >
                        <span className="sr-only">{step}</span>
                      </StepperIndicator>
                    </StepperTrigger>
                  </StepperItem>
                ))}
              </Stepper>
            </div>

            <div>
              <h3>{currentItem?.title}</h3>
              <p>{currentItem?.description}</p>
            </div>

            {currentComponent}
          </div>
        </div>
      </div>
    </OnBoardContext.Provider>
  );
};

export default OnBoardForm;
