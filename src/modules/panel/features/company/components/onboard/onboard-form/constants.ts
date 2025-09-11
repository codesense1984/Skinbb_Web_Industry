import { StepKey } from "../../../config/steps.config";
import type { ComponentType } from "react";
import { MODE } from "@/core/types";

export const StepCount = {
  [StepKey.COMPANY_DETAILS]: 1,
  [StepKey.ADDRESS_DETAILS]: 2,
  [StepKey.BRAND_DETAILS]: 3,
  [StepKey.DOCUMENTS_DETAILS]: 4,
  [StepKey.PERSONAL_INFORMATION]: 5,
  [StepKey.THANK_YOU]: 6,
} as const;

export const FormSteps = [
  StepCount[StepKey.COMPANY_DETAILS],
  StepCount[StepKey.ADDRESS_DETAILS],
  StepCount[StepKey.BRAND_DETAILS],
  StepCount[StepKey.DOCUMENTS_DETAILS],
  StepCount[StepKey.PERSONAL_INFORMATION],
] as const;

export const LastStep = StepCount[StepKey.PERSONAL_INFORMATION];

export interface StepItem {
  step: number;
  stepTitle: string;
  value: StepKey;
  title: string;
  description: string;
  Component: ComponentType<{ mode: MODE }>;
}

export const STEP_DESCRIPTIONS = {
  [StepKey.COMPANY_DETAILS]: {
    stepTitle: "Company information",
    title: "Build Your Business Identity",
    description: "Lay the foundation with your core company details.",
  },
  [StepKey.ADDRESS_DETAILS]: {
    stepTitle: "Address information",
    title: "Tell Us Your Address",
    description:
      "We need your registered address to keep our records accurate and compliant.",
  },
  [StepKey.BRAND_DETAILS]: {
    stepTitle: "Brand details",
    title: "Brand Identity",
    description: "Define your brand identity and logo.",
  },
  [StepKey.DOCUMENTS_DETAILS]: {
    stepTitle: "Documents information",
    title: "Prove Your Legitimacy",
    description: "Upload your legal documents for verification.",
  },
  [StepKey.PERSONAL_INFORMATION]: {
    stepTitle: "Personal",
    title: "Build your personal space",
    description:
      "Your journey with SkinBB starts here. We're excited to have you on board!",
  },
  [StepKey.THANK_YOU]: {
    stepTitle: "Thank You",
    title: "Thank You for Submitting Your Company Profile!",
    description:
      "Your details have been successfully submitted for review. We'll be in touch soon.",
  },
} as const;
