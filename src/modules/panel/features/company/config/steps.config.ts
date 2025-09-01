export enum StepKey {
  PERSONAL_INFORMATION = "personal_information",
  COMPANY_DETAILS = "company_information",
  ADDRESS_DETAILS = "address_information",
  DOCUMENTS_DETAILS = "documents_information",
  BRAND_DETAILS = "brand_information",
  THANK_YOU = "thank_you",
}

export const STEP_ORDER: StepKey[] = [
  StepKey.COMPANY_DETAILS,
  StepKey.ADDRESS_DETAILS,
  StepKey.BRAND_DETAILS,
  StepKey.DOCUMENTS_DETAILS,
  StepKey.PERSONAL_INFORMATION,
];
