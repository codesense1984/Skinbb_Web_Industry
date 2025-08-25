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
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FC,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  fullCompanyDefaultValues,
  fullCompanyDetailsSchema,
  fullCompanyZodSchema,
  type FullCompanyFormType,
} from "../../schema/fullCompany.schema";
import { AddressDetails } from "./AddressDetails";
import CompanyDetails from "./CompanyDetails";
import { DocumentDetails } from "./DocumentDetails";
import Start from "./Start";
import Thankyou from "./Thankyou";
import PersonalDetails from "./PersonalDetails";

export enum StepKey {
  START = "start",
  PERSONAL_INFORMATION = "personal_information",
  COMPANY_DETAILS = "company_information",
  ADDRESS_DETAILS = "address_information",
  DOCUMENTS_DETAILS = "documents_information",
  // CONFIRMATION = "confirmation",
  THANK_YOU = "thank_you",
}

const StepCount = {
  [StepKey.START]: 1,
  [StepKey.PERSONAL_INFORMATION]: 2,
  [StepKey.COMPANY_DETAILS]: 3,
  [StepKey.ADDRESS_DETAILS]: 4,
  [StepKey.DOCUMENTS_DETAILS]: 5,
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
  {
    step: StepCount[StepKey.START],
    stepTitle: "Start",
    value: StepKey.START,
    title: "👋 Welcome to Your Company Onboarding",
    description:
      "Your journey with SkinBB starts here. We’re excited to have you on board!",
    Component: memo(Start),
  },
  {
    step: StepCount[StepKey.PERSONAL_INFORMATION],
    stepTitle: "Personal",
    value: StepKey.PERSONAL_INFORMATION,
    title: "Build your personal space",
    description:
      "Your journey with SkinBB starts here. We’re excited to have you on board!",
    Component: memo(PersonalDetails),
  },
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
    step: StepCount[StepKey.DOCUMENTS_DETAILS],
    stepTitle: "Documents information",
    value: StepKey.DOCUMENTS_DETAILS,
    title: "Prove Your Legitimacy",
    description: "Upload your legal documents for verification.",
    Component: memo(DocumentDetails),
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
      "Your details have been successfully submitted for review. We’ll be in touch soon.",
    Component: memo(Thankyou),
  },
];

const formStep = [
  StepCount[StepKey.PERSONAL_INFORMATION],
  StepCount[StepKey.COMPANY_DETAILS],
  StepCount[StepKey.ADDRESS_DETAILS],
  StepCount[StepKey.DOCUMENTS_DETAILS],
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

const OnBoardForm = ({ mode = MODE.ADD }: { mode?: MODE }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentValue =
    (searchParams.get("step") as StepKey) || StepKey.PERSONAL_INFORMATION;

  const [confirmation, setConfirmation] = useState<boolean>(false);

  const currentItem = useMemo(
    () => STEPS.find((s) => s.value === currentValue) ?? STEPS[0],
    [currentValue],
  );

  const currentIndex = useMemo(
    () => STEPS.findIndex((s) => s.value === currentValue),
    [currentValue],
  );

  const isFirst = currentIndex === 0;
  const isStart = currentIndex === 0;

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

  const methods = useForm<FullCompanyFormType>({
    defaultValues: fullCompanyDefaultValues(),
    resolver: zodResolver(fullCompanyZodSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, watch, formState } = methods;

  const agreeTermsConditions = useWatch({
    control: methods.control,
    name: "agreeTermsConditions",
    defaultValue: false,
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
        break;

      case StepKey.ADDRESS_DETAILS:
        values.address.forEach((_, index) => {
          const dName = fullCompanyDetailsSchema
            .address_information({ mode, index })
            .map((f) => f.name) as (keyof FullCompanyFormType)[];
          names = [...names, ...dName];
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
      toast.success("Profile submitted for review!");
      setConfirmation(true);
      console.log("🔍 Final payload:", data);
    },
    (...rest) => {
      console.log("Error in form submission", rest);
    },
  );

  const onConfirm = () => {
    toast.success("Profile submitted for review!");
    goNext();
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
              {isStart && (
                <>
                  <Component mode={mode} />
                  <Button
                    variant={"contained"}
                    color="primary"
                    onClick={goNext}
                  >
                    Next
                  </Button>
                </>
              )}

              {isFormStep && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      currentItem.step === StepCount[StepKey.DOCUMENTS_DETAILS]
                    ) {
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
                      <p className="text-muted-foreground text-sm">
                        {STEPS[currentIndex].step - 1} / 3
                      </p>
                    </div>
                    <Stepper
                      value={STEPS[currentIndex].step}
                      onValueChange={(v) =>
                        navigateTo(STEPS.findIndex((s) => s.step === Number(v)))
                      }
                      className="gap-1"
                    >
                      {formStep.map((n) => (
                        <StepperItem key={n} step={n} className="flex-1">
                          <StepperTrigger
                            className="w-full flex-col items-start gap-2"
                            asChild
                          >
                            <StepperIndicator
                              asChild
                              className="bg-border h-2 w-full"
                            >
                              <span className="sr-only">{n}</span>
                            </StepperIndicator>
                          </StepperTrigger>
                        </StepperItem>
                      ))}
                    </Stepper>
                  </div>

                  <div>
                    <h4 className="pb-1 font-bold">{title}</h4>
                    <p className="text-muted-foreground">{description}</p>
                  </div>

                  <Component mode={mode} />

                  <div className="bg-background sticky bottom-0 mt-auto flex justify-between border-t py-4">
                    <Button
                      type="button"
                      onClick={goBack}
                      disabled={isFirst}
                      className="button-outline"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant={"contained"}
                      color="primary"
                      disabled={
                        currentItem.step ===
                          StepCount[StepKey.DOCUMENTS_DETAILS] &&
                        !agreeTermsConditions
                      }
                    >
                      {currentItem.step === StepCount[StepKey.DOCUMENTS_DETAILS]
                        ? "Submit"
                        : "Next"}
                    </Button>
                  </div>
                </form>
              )}

              {/* {isConfirmation && <>COnfirm</>} */}

              <ConfirmationDialog
                isOpen={confirmation}
                onClose={() => setConfirmation(false)}
                title="Submit Profile?"
                description="Are you sure you want to submit your company profile for review? Once submitted, your information will be sent to the admin for approval. You’ll be notified after your profile is reviewed."
                actionButtons={[
                  {
                    label: "Confirm",
                    onClick: onConfirm,
                    color: "primary",
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
