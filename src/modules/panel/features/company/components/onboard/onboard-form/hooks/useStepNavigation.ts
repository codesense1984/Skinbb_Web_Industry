import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { LastStep } from "../constants";
import { STEP_ORDER, StepKey } from "../../../../config/steps.config";
import { getFieldNamesForStep } from "../../../../utils/onboard-steps.utils";
import type { MODE } from "@/core/types";
import type { UseFormReturn } from "react-hook-form";
import type { FullCompanyFormType } from "../../../../schema/fullCompany.schema";
import {
  apiVerifyPan,
  apiVerifyGst,
  apiVerifyCin,
} from "@/modules/panel/services/http/verification.service";
import { format } from "date-fns";
import { formatDateForApi } from "@/core/utils";

interface UseStepNavigationProps {
  currentValue: StepKey;
  setCurrentValue: (value: StepKey) => void;
  getFirstIncompleteStep: () => StepKey;
  areAllStepsCompleted: () => boolean;
  isFormStep: boolean;
  currentItem: { value: StepKey; step: number };
  methods: UseFormReturn<FullCompanyFormType>;
  mode: string;
  steps: any[];
}

// Helper function to validate documents in parallel
const validateDocuments = async (
  documents: any[],
  { name, establishedIn }: { name: string; establishedIn: string | Date },
  setError: UseFormReturn<FullCompanyFormType>["setError"],
  setValue: UseFormReturn<FullCompanyFormType>["setValue"],
): Promise<{ isValid: boolean }> => {
  try {
    const validationPromises = documents
      // .filter((doc) => doc.number?.trim() && !doc.verified) // Only validate documents with numbers that aren't already verified
      .map(async (doc, index) => {
        const fieldName = `documents.${index}.number` as const;

        if (doc.number?.trim() && doc.verified) {
          return true;
        }

        try {
          switch (doc.type) {
            case "pan":
              const panResponse = await apiVerifyPan({
                panData: {
                  pan: doc.number,
                  nameAsPerPan: name,
                  dateOfBirth: format(establishedIn, "MM/dd/yyyy"),
                },
              });

              if (panResponse.data.data.status !== "valid") {
                setError(fieldName, {
                  message: `PAN verification failed: ${panResponse.data.data.remarks || "Invalid PAN number"}`,
                });
                return false;
              }
              break;

            case "gstLicense":
              const gstResponse = await apiVerifyGst({
                gstin: doc.number,
              });

              if (gstResponse.data.data.data.sts !== "Active") {
                setError(fieldName, {
                  message: "GST verification failed: GST number is not active",
                });
                return false;
              }
              break;

            case "coi":
              const cinResponse = await apiVerifyCin({
                cinData: {
                  cin: doc.number,
                },
              });

              if (
                cinResponse.data.data.company_master_data[
                  "company_status(for_efiling)"
                ] !== "Active"
              ) {
                setError(fieldName, {
                  message:
                    "CIN verification failed: Company status is not active",
                });
                return false;
              }
              break;

            default:
              // Skip validation for other document types
              break;
          }

          // Mark document as verified after successful validation
          setValue(`documents.${index}.verified`, true);
          return true;
        } catch (error) {
          const errorMessage =
            doc.type === "pan"
              ? "PAN verification failed. Please check your PAN number."
              : doc.type === "gstLicense"
                ? "GST verification failed. Please check your GST number."
                : doc.type === "coi"
                  ? "CIN verification failed. Please check your CIN number."
                  : "Document verification failed. Please try again.";

          setError(fieldName, { message: errorMessage });
          return false;
        }
      });

    const results = await Promise.all(validationPromises);
    const isValid = results.every((result) => result === true);

    return { isValid };
  } catch (error) {
    // Set a general error if something goes wrong
    setError("documents", {
      message: "Document verification failed. Please try again.",
    });
    return { isValid: false };
  }
};

export const useStepNavigation = ({
  currentValue,
  setCurrentValue,
  getFirstIncompleteStep,
  areAllStepsCompleted,
  isFormStep,
  currentItem,
  methods,
  mode,
  steps,
}: UseStepNavigationProps) => {
  const { trigger, getValues, setError, setValue } = methods;
  const [isVerifyingDocuments, setIsVerifyingDocuments] = useState(false);
  const navigateTo = useCallback(
    (idx: number, steps: any[]) => setCurrentValue(steps[idx].value),
    [setCurrentValue],
  );

  const goNext = useCallback(
    (steps: any[]) => {
      const currentIndex = steps.findIndex((s) => s.value === currentValue);
      if (currentIndex < steps.length - 1) navigateTo(currentIndex + 1, steps);
    },
    [currentValue, navigateTo],
  );

  const goBack = useCallback(
    (steps: any[]) => {
      const currentIndex = steps.findIndex((s) => s.value === currentValue);
      if (currentIndex > 0) navigateTo(currentIndex - 1, steps);
    },
    [currentValue, navigateTo],
  );

  // Validate current form slice before advancing
  const onNext = useCallback(
    async (steps: any[]) => {
      if (!isFormStep) {
        goNext(steps);
        return;
      }

      const sliceKey = currentItem.value as StepKey;
      const values = getValues();
      const names = getFieldNamesForStep(sliceKey, values, mode as MODE);

      if (!(await trigger(names))) {
        toast.error(`Please fill all required fields in ${sliceKey}`);
        return;
      }

      // Validate documents if we're on the documents step
      if (sliceKey === StepKey.DOCUMENTS_DETAILS && values.documents) {
        // Check if all documents are already verified
        const unverifiedDocuments = values.documents.filter(
          (doc) => doc.number?.trim() && !doc.verified,
        );

        if (unverifiedDocuments.length === 0) {
          // All documents are already verified, proceed to next step
          goNext(steps);
          return;
        }

        setIsVerifyingDocuments(true);
        toast.loading("Verifying documents...", {
          id: "document-verification",
        });

        try {
          const validationResult = await validateDocuments(
            values.documents,
            { name: values.companyName, establishedIn: values.establishedIn },
            setError,
            setValue,
          );

          if (!validationResult.isValid) {
            toast.dismiss("document-verification");
            return;
          }

          toast.success("All documents verified successfully!", {
            id: "document-verification",
          });
        } finally {
          setIsVerifyingDocuments(false);
        }
      }

      goNext(steps);
    },
    [
      isFormStep,
      currentItem.value,
      getValues,
      trigger,
      mode,
      goNext,
      setError,
      setValue,
    ],
  );

  const handleStepChange = useCallback(
    (value: number, steps: any[]) => {
      const targetIndex = steps.findIndex((s) => s.step === Number(value));
      const targetStep = steps[targetIndex]?.value;

      if (targetStep) {
        const targetStepIndex = STEP_ORDER.indexOf(targetStep);
        const currentStepIndex = STEP_ORDER.indexOf(currentValue);
        const firstIncompleteStep = getFirstIncompleteStep();
        const firstIncompleteIndex = STEP_ORDER.indexOf(firstIncompleteStep);

        // Always allow navigating backward or staying within completed range
        if (targetStepIndex <= currentStepIndex) {
          navigateTo(targetIndex, steps);
          return;
        }

        // Thank you page guard
        if (targetStep === StepKey.THANK_YOU && !areAllStepsCompleted()) {
          toast.error(
            "Please complete all steps before accessing the thank you page",
          );
          return;
        }

        // Allow moving forward only up to the first incomplete step
        if (targetStepIndex <= firstIncompleteIndex) {
          navigateTo(targetIndex, steps);
        } else {
          const stepTitle =
            steps.find((s) => s.value === firstIncompleteStep)?.stepTitle ||
            "target step";
          toast.error(
            `Please complete ${stepTitle} first before proceeding to the next step.`,
          );
        }
      }
    },
    [currentValue, getFirstIncompleteStep, areAllStepsCompleted, navigateTo],
  );

  const currentIndex = useMemo(
    () => steps.findIndex((s) => s.value === currentValue),
    [currentValue, steps],
  );

  const isFirst = currentIndex === 0;
  const isLast = currentItem.step === LastStep;

  return {
    navigateTo,
    goNext,
    goBack,
    onNext,
    handleStepChange,
    currentIndex,
    isFirst,
    isLast,
    isVerifyingDocuments,
  };
};

// Note: getFieldNamesForStep is now imported from the utils file
