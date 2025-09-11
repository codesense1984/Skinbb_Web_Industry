// import { useCallback, useMemo, useState } from "react";
// import { StepKey } from "../../config/steps.config";
// import {
//   areAllStepsCompleted as areAllStepsCompletedUtil,
//   computeFirstIncompleteStep,
//   getFieldNamesForStep,
// } from "../../utils/onboard-steps.utils";
// import { MODE } from "@/core/types";
// import type { FullCompanyFormType } from "../../schema/fullCompany.schema";

// export interface OnboardingStep {
//   key: StepKey;
//   title: string;
//   description: string;
//   stepTitle: string;
//   stepNumber: number;
//   isCompleted: boolean;
//   isAccessible: boolean;
//   isFormStep: boolean;
// }

// export interface UseOnboardingStepsProps {
//   currentStep: StepKey;
//   formValues: FullCompanyFormType;
//   mode: MODE;
//   onStepChange: (step: StepKey) => void;
// }

// export interface UseOnboardingStepsReturn {
//   steps: OnboardingStep[];
//   currentStepIndex: number;
//   currentStepData: OnboardingStep | null;
//   canNavigateToStep: (step: StepKey) => boolean;
//   navigateToStep: (step: StepKey) => void;
//   goToNextStep: () => void;
//   goToPreviousStep: () => void;
//   isFirstStep: boolean;
//   isLastStep: boolean;
//   progressPercentage: number;
//   completedStepsCount: number;
//   totalStepsCount: number;
// }

// const STEP_CONFIG = [
//   {
//     key: StepKey.COMPANY_DETAILS,
//     title: "Build Your Business Identity",
//     description: "Lay the foundation with your core company details.",
//     stepTitle: "Company information",
//     stepNumber: 1,
//     isFormStep: true,
//   },
//   {
//     key: StepKey.ADDRESS_DETAILS,
//     title: "Tell Us Your Address",
//     description:
//       "We need your registered address to keep our records accurate and compliant.",
//     stepTitle: "Address information",
//     stepNumber: 2,
//     isFormStep: true,
//   },
//   {
//     key: StepKey.BRAND_DETAILS,
//     title: "Brand Identity",
//     description: "Define your brand identity and logo.",
//     stepTitle: "Brand details",
//     stepNumber: 3,
//     isFormStep: true,
//   },
//   {
//     key: StepKey.DOCUMENTS_DETAILS,
//     title: "Prove Your Legitimacy",
//     description: "Upload your legal documents for verification.",
//     stepTitle: "Documents information",
//     stepNumber: 4,
//     isFormStep: true,
//   },
//   {
//     key: StepKey.PERSONAL_INFORMATION,
//     title: "Build your personal space",
//     description:
//       "Your journey with SkinBB starts here. We're excited to have you on board!",
//     stepTitle: "Personal",
//     stepNumber: 5,
//     isFormStep: true,
//   },
//   {
//     key: StepKey.THANK_YOU,
//     title: "Thank You for Submitting Your Company Profile!",
//     description:
//       "Your details have been successfully submitted for review. We'll be in touch soon.",
//     stepTitle: "Thank You",
//     stepNumber: 6,
//     isFormStep: false,
//   },
// ] as const;

// export const useOnboardingSteps = ({
//   currentStep,
//   formValues,
//   mode,
//   onStepChange,
// }: UseOnboardingStepsProps): UseOnboardingStepsReturn => {
//   const [stepHistory, setStepHistory] = useState<StepKey[]>([currentStep]);

//   // Memoized step calculations
//   const steps = useMemo((): OnboardingStep[] => {
//     const firstIncompleteStep = computeFirstIncompleteStep(formValues);
//     const allStepsCompleted = areAllStepsCompletedUtil(formValues);

//     return STEP_CONFIG.map((step) => {
//       const isCompleted =
//         step.key === StepKey.THANK_YOU
//           ? allStepsCompleted
//           : step.key !== firstIncompleteStep &&
//             STEP_CONFIG.findIndex((s) => s.key === firstIncompleteStep) >
//               STEP_CONFIG.findIndex((s) => s.key === step.key);

//       const isAccessible =
//         step.key === StepKey.THANK_YOU
//           ? allStepsCompleted
//           : step.key === firstIncompleteStep || isCompleted;

//       return {
//         ...step,
//         isCompleted,
//         isAccessible,
//       };
//     });
//   }, [formValues]);

//   const currentStepIndex = useMemo(
//     () => steps.findIndex((step) => step.key === currentStep),
//     [steps, currentStep],
//   );

//   const currentStepData = useMemo(
//     () => steps.find((step) => step.key === currentStep) || null,
//     [steps, currentStep],
//   );

//   const canNavigateToStep = useCallback(
//     (step: StepKey): boolean => {
//       const targetStep = steps.find((s) => s.key === step);
//       return targetStep?.isAccessible ?? false;
//     },
//     [steps],
//   );

//   const navigateToStep = useCallback(
//     (step: StepKey) => {
//       if (canNavigateToStep(step)) {
//         setStepHistory((prev) => [...prev, step]);
//         onStepChange(step);
//       }
//     },
//     [canNavigateToStep, onStepChange],
//   );

//   const goToNextStep = useCallback(() => {
//     const nextIndex = currentStepIndex + 1;
//     if (nextIndex < steps.length) {
//       const nextStep = steps[nextIndex];
//       if (nextStep.isAccessible) {
//         navigateToStep(nextStep.key);
//       }
//     }
//   }, [currentStepIndex, steps, navigateToStep]);

//   const goToPreviousStep = useCallback(() => {
//     const prevIndex = currentStepIndex - 1;
//     if (prevIndex >= 0) {
//       const prevStep = steps[prevIndex];
//       navigateToStep(prevStep.key);
//     }
//   }, [currentStepIndex, steps, navigateToStep]);

//   const isFirstStep = currentStepIndex === 0;
//   const isLastStep = currentStepIndex === steps.length - 1;

//   const completedStepsCount = steps.filter((step) => step.isCompleted).length;
//   const totalStepsCount = steps.length;
//   const progressPercentage = Math.round(
//     (completedStepsCount / totalStepsCount) * 100,
//   );

//   return {
//     steps,
//     currentStepIndex,
//     currentStepData,
//     canNavigateToStep,
//     navigateToStep,
//     goToNextStep,
//     goToPreviousStep,
//     isFirstStep,
//     isLastStep,
//     progressPercentage,
//     completedStepsCount,
//     totalStepsCount,
//   };
// };

