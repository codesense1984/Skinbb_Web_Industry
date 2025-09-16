import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { MODE } from "@/core/types";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import {
  apiGetCompanyDropdownList,
  apiOnboardingSubmit,
  apiUpdateOnboardById,
} from "@/modules/panel/services/http/company.service";
import type { CompanyOnboading } from "@/modules/panel/types";

import { StepKey } from "../../../../config/steps.config";
import type { FullCompanyFormType } from "../../../../schema/fullCompany.schema";
import {
  areAllStepsCompleted as areAllStepsCompletedUtil,
  computeFirstIncompleteStep,
} from "../../../../utils/onboard-steps.utils";
import {
  getCompanySchema,
  transformApiResponseToFormData,
  transformFormDataToApiRequest,
} from "../../../../utils/onboarding.utils";

interface UseOnboardingFormProps {
  mode?: MODE;
  initialData?: CompanyOnboading;
}

export const useOnboardingForm = ({
  mode = MODE.ADD,
  initialData,
}: UseOnboardingFormProps) => {
  const qc = useQueryClient();
  const [currentValue, setCurrentValue] = useState<StepKey>(
    StepKey.COMPANY_DETAILS,
  );
  const [confirmation, setConfirmation] = useState<
    [boolean, FullCompanyFormType | undefined]
  >([false, undefined]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const { data: companyDropdownResponse, isLoading: isLoadingCompanyDropdown } =
    useQuery({
      queryKey: [ENDPOINTS.SELLER.GET_COMPANY_LIST],
      queryFn: () => apiGetCompanyDropdownList(),
    });

  const methods = useForm<FullCompanyFormType>({
    defaultValues: transformApiResponseToFormData(),
    resolver: zodResolver(
      getCompanySchema(mode, companyDropdownResponse?.data || []),
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { handleSubmit, trigger, watch, getValues, reset } = methods;

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      const isPrimary = initialData.addresses.some((item) => item.isPrimary);
      const formData = transformApiResponseToFormData(initialData, {
        disabledCompanyDetails: !isPrimary,
        isCreatingNewCompany: isPrimary,
        disabledCompanyName: !isPrimary,
        mode: MODE.EDIT,
      });
      reset(formData);
    }
  }, [initialData, reset]);

  // Watch form data for debugging
  useEffect(() => {
    console.log(watch(), "watch formdata");
  }, [watch()]);

  // Form validation helpers
  const getFirstIncompleteStep = useCallback((): StepKey => {
    const values = getValues();
    return computeFirstIncompleteStep(values);
  }, [getValues]);

  const areAllStepsCompleted = useCallback((): boolean => {
    const values = getValues();
    return areAllStepsCompletedUtil(values);
  }, [getValues]);

  // Onboarding submission mutation
  const onboardingMutation = useMutation({
    mutationFn: (data: FullCompanyFormType) => {
      const apiData = transformFormDataToApiRequest(data);
      console.log("🚀 ~ OnBoardForm ~ apiData:", apiData);
      if (mode === MODE.EDIT) {
        const locationId = initialData?.addresses[0]?.addressId;
        if (!apiData?.companyId || !locationId) {
          throw new Error("Missing required data for update");
        }
        return apiUpdateOnboardById(apiData.companyId, locationId, apiData);
      }
      return apiOnboardingSubmit(apiData);
    },
    onSuccess: (response) => {
      toast.success(
        (response as { response: { message: string } })?.response?.message ||
          "Profile submitted successfully!",
      );
      setConfirmation([false, undefined]);
      qc.invalidateQueries({ queryKey: [ENDPOINTS.SELLER.GET_COMPANY_LIST] });
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

  // Form submission handlers
  const onFinish = handleSubmit(
    (data) => {
      console.log("🚀 ~ OnBoardForm ~ data:", data);
      console.log("🔍 Product Category in form data:", {
        brandType: data.brandType,
        type: typeof data.brandType,
        isArray: Array.isArray(data.brandType),
        length: data.brandType?.length
      });
      setConfirmation([true, data]);
    },
    (error) => {
      console.error("Error in form submission:", error);
      setHasAttemptedSubmit(true);
      handleFormErrors(error);
    },
  );

  const onConfirm = () => {
    if (!confirmation[1]) return;
    onboardingMutation.mutate(confirmation[1]);
  };

  const agreeTermsConditions = useWatch({
    control: methods.control,
    name: "agreeTermsConditions",
    defaultValue: false,
  });

  return {
    // Form methods
    methods,
    handleSubmit,
    trigger,
    watch,
    reset,

    // State
    currentValue,
    setCurrentValue,
    confirmation,
    setConfirmation,
    hasAttemptedSubmit,
    setHasAttemptedSubmit,
    agreeTermsConditions,

    // Data
    companyDropdownResponse,
    isLoadingCompanyDropdown,

    // Mutations
    onboardingMutation,

    // Validation helpers
    getFirstIncompleteStep,
    areAllStepsCompleted,

    // Handlers
    onFinish,
    onConfirm,
  };
};

// Helper function to handle form errors
const handleFormErrors = (error: unknown) => {
  if (error && typeof error === "object") {
    const errorMessages: string[] = [];

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
};
