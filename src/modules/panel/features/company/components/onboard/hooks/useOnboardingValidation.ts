// import { useCallback, useMemo } from "react";
// import { useFormContext } from "react-hook-form";
// import { toast } from "sonner";
// import { StepKey } from "../../config/steps.config";
// import { getFieldNamesForStep } from "../../utils/onboard-steps.utils";
// import { MODE } from "@/core/types";
// import type { FullCompanyFormType } from "../../schema/fullCompany.schema";

// export interface ValidationResult {
//   isValid: boolean;
//   errors: string[];
//   warnings: string[];
// }

// export interface UseOnboardingValidationProps {
//   mode: MODE;
//   currentStep: StepKey;
// }

// export interface UseOnboardingValidationReturn {
//   validateCurrentStep: () => Promise<ValidationResult>;
//   validateAllSteps: () => Promise<ValidationResult>;
//   getStepValidationStatus: (step: StepKey) => ValidationResult;
//   clearStepErrors: (step: StepKey) => void;
//   hasStepErrors: (step: StepKey) => boolean;
// }

// export const useOnboardingValidation = ({
//   mode,
//   currentStep,
// }: UseOnboardingValidationProps): UseOnboardingValidationReturn => {
//   const { trigger, getFieldState, getValues, clearErrors, formState } =
//     useFormContext<FullCompanyFormType>();

//   const validateCurrentStep =
//     useCallback(async (): Promise<ValidationResult> => {
//       try {
//         const values = getValues();
//         const fieldNames = getFieldNamesForStep(currentStep, values, mode);

//         const isValid = await trigger(fieldNames);
//         const errors: string[] = [];
//         const warnings: string[] = [];

//         // Collect field-specific errors
//         fieldNames.forEach((fieldName) => {
//           const fieldState = getFieldState(fieldName);
//           if (fieldState.error) {
//             errors.push(`${fieldName}: ${fieldState.error.message}`);
//           }
//         });

//         // Add step-specific validations
//         if (currentStep === StepKey.COMPANY_DETAILS) {
//           const companyName = values.companyName;
//           if (!companyName?.trim()) {
//             errors.push("Company name is required");
//           }
//         }

//         if (currentStep === StepKey.DOCUMENTS_DETAILS) {
//           const documents = values.documents || [];
//           const requiredDocs = ["coi", "pan"];
//           const missingDocs = requiredDocs.filter(
//             (docType) =>
//               !documents.some((doc) => doc.type === docType && doc.url),
//           );

//           if (missingDocs.length > 0) {
//             errors.push(
//               `Missing required documents: ${missingDocs.join(", ")}`,
//             );
//           }
//         }

//         if (currentStep === StepKey.PERSONAL_INFORMATION) {
//           const phoneNumber = values.phoneNumber;
//           const phoneVerified = values.phoneVerified;

//           if (!phoneNumber?.trim()) {
//             errors.push("Phone number is required");
//           } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
//             errors.push("Please enter a valid 10-digit phone number");
//           }

//           if (!phoneVerified) {
//             warnings.push("Phone number verification is recommended");
//           }
//         }

//         return {
//           isValid,
//           errors,
//           warnings,
//         };
//       } catch (error) {
//         console.error("Validation error:", error);
//         return {
//           isValid: false,
//           errors: ["An unexpected error occurred during validation"],
//           warnings: [],
//         };
//       }
//     }, [currentStep, mode, trigger, getFieldState, getValues]);

//   const validateAllSteps = useCallback(async (): Promise<ValidationResult> => {
//     const allSteps: StepKey[] = [
//       StepKey.COMPANY_DETAILS,
//       StepKey.ADDRESS_DETAILS,
//       StepKey.BRAND_DETAILS,
//       StepKey.DOCUMENTS_DETAILS,
//       StepKey.PERSONAL_INFORMATION,
//     ];

//     const allErrors: string[] = [];
//     const allWarnings: string[] = [];
//     let allValid = true;

//     for (const step of allSteps) {
//       const result = await getStepValidationStatus(step);
//       if (!result.isValid) {
//         allValid = false;
//         allErrors.push(...result.errors);
//       }
//       allWarnings.push(...result.warnings);
//     }

//     return {
//       isValid: allValid,
//       errors: allErrors,
//       warnings: allWarnings,
//     };
//   }, []);

//   const getStepValidationStatus = useCallback(
//     (step: StepKey): ValidationResult => {
//       const values = getValues();
//       const fieldNames = getFieldNamesForStep(step, values, mode);
//       const errors: string[] = [];
//       const warnings: string[] = [];

//       // Check field errors
//       fieldNames.forEach((fieldName) => {
//         const fieldState = getFieldState(fieldName);
//         if (fieldState.error) {
//           errors.push(fieldState.error.message || `${fieldName} is invalid`);
//         }
//       });

//       // Step-specific validations
//       switch (step) {
//         case StepKey.COMPANY_DETAILS:
//           if (!values.companyName?.trim()) {
//             errors.push("Company name is required");
//           }
//           break;

//         case StepKey.ADDRESS_DETAILS:
//           if (!values.addresses?.[0]?.address?.trim()) {
//             errors.push("Address is required");
//           }
//           break;

//         case StepKey.BRAND_DETAILS:
//           if (!values.brandName?.trim()) {
//             errors.push("Brand name is required");
//           }
//           break;

//         case StepKey.DOCUMENTS_DETAILS:
//           const documents = values.documents || [];
//           const requiredDocs = ["coi", "pan"];
//           const missingDocs = requiredDocs.filter(
//             (docType) =>
//               !documents.some((doc) => doc.type === docType && doc.url),
//           );

//           if (missingDocs.length > 0) {
//             errors.push(
//               `Missing required documents: ${missingDocs.join(", ")}`,
//             );
//           }
//           break;

//         case StepKey.PERSONAL_INFORMATION:
//           if (!values.phoneNumber?.trim()) {
//             errors.push("Phone number is required");
//           } else if (!/^[6-9]\d{9}$/.test(values.phoneNumber)) {
//             errors.push("Please enter a valid 10-digit phone number");
//           }

//           if (!values.phoneVerified) {
//             warnings.push("Phone number verification is recommended");
//           }

//           if (!values.agreeTermsConditions) {
//             errors.push("You must agree to the terms and conditions");
//           }
//           break;
//       }

//       return {
//         isValid: errors.length === 0,
//         errors,
//         warnings,
//       };
//     },
//     [getValues, mode, getFieldState],
//   );

//   const clearStepErrors = useCallback(
//     (step: StepKey) => {
//       const values = getValues();
//       const fieldNames = getFieldNamesForStep(step, values, mode);
//       clearErrors(fieldNames);
//     },
//     [getValues, mode, clearErrors],
//   );

//   const hasStepErrors = useCallback(
//     (step: StepKey): boolean => {
//       const result = getStepValidationStatus(step);
//       return !result.isValid;
//     },
//     [getStepValidationStatus],
//   );

//   return {
//     validateCurrentStep,
//     validateAllSteps,
//     getStepValidationStatus,
//     clearStepErrors,
//     hasStepErrors,
//   };
// };
