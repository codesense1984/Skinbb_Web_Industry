import { MODE } from "@/core/types";
import { STEP_ORDER, StepKey } from "../config/steps.config";
import {
  fullCompanyDetailsSchema,
  type FullCompanyFormType,
} from "../schema/fullCompany.schema";

// STEP_ORDER moved to config to avoid circular imports

export function isStepCompleted(
  values: FullCompanyFormType,
  step: StepKey,
  opts: { strict?: boolean } = {},
): boolean {
  const { strict = false } = opts;

  switch (step) {
    case StepKey.COMPANY_DETAILS:
      return !!(
        values.companyName?.trim() &&
        values.category?.trim() &&
        values.businessType?.trim() &&
        values.establishedIn &&
        (!strict || !!values.logo_files?.length)
      );

    case StepKey.ADDRESS_DETAILS:
      return (
        values.address?.every(
          (addr) =>
            addr.address?.trim() &&
            addr.landmark?.trim() &&
            addr.landlineNumber?.trim() &&
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
        values.brandType?.some((cat) => cat?.trim()) &&
        values.averageSellingPrice?.trim() &&
        values.marketingBudget
      );

    case StepKey.DOCUMENTS_DETAILS:
      return (
        values.documents?.every((doc) => {
          // Skip CIN validation for proprietor business type
          if (doc.type === "coi" && values.businessType === "proprietor") {
            return true;
          }

          return doc.type === "coi"
            ? doc.number?.trim() && doc.url?.trim()
            : doc.type === "pan"
              ? doc.number?.trim() && doc.url?.trim()
              : doc.type === "brandAuthorisation"
                ? doc.url?.trim()
                : true;
        }) || false
      );

    case StepKey.PERSONAL_INFORMATION:
      return !!(
        values.name?.trim() &&
        values.email?.trim() &&
        values.designation?.trim() &&
        values.phoneNumber?.trim() &&
        values.password?.trim() &&
        values.phoneVerified &&
        values.emailVerified
      );

    default:
      return false;
  }
}

export function computeFirstIncompleteStep(
  values: FullCompanyFormType,
): StepKey {
  for (const step of STEP_ORDER) {
    if (!isStepCompleted(values, step, { strict: false })) {
      return step;
    }
  }
  return StepKey.THANK_YOU;
}

export function areAllStepsCompleted(values: FullCompanyFormType): boolean {
  return STEP_ORDER.every((step) =>
    isStepCompleted(values, step, { strict: true }),
  );
}

export function canAccessStep(
  values: FullCompanyFormType,
  targetStep: StepKey,
): boolean {
  const targetIndex = STEP_ORDER.indexOf(targetStep);
  if (targetIndex <= 0) return true;

  for (let i = 0; i < targetIndex; i++) {
    const prevStep = STEP_ORDER[i];
    if (!isStepCompleted(values, prevStep, { strict: true })) {
      return false;
    }
  }

  return true;
}

export function getFieldNamesForStep(
  step: StepKey,
  values: FullCompanyFormType,
  mode: MODE,
): Array<keyof FullCompanyFormType> {
  let names: Array<keyof FullCompanyFormType> = [];

  switch (step) {
    case StepKey.PERSONAL_INFORMATION: {
      names = fullCompanyDetailsSchema
        .personal_information({ mode })
        .map((f) => f.name) as Array<keyof FullCompanyFormType>;

      if (!values.phoneNumber) names.push("phoneNumber");
      if (!values.password) names.push("password");
      if (!values.phoneVerified) names.push("phoneVerified");
      if (!values.emailVerified) names.push("emailVerified");

      return names;
    }

    case StepKey.COMPANY_DETAILS: {
      // Combine both company_information and company_name field names
      const nameNames = fullCompanyDetailsSchema
        .company_name({ mode })
        .map((f) => f.name) as Array<keyof FullCompanyFormType>;
      const infoNames = fullCompanyDetailsSchema
        .company_information({ mode })
        .map((f) => f.name) as Array<keyof FullCompanyFormType>;
      names = [...infoNames, ...nameNames];
      return names;
    }

    case StepKey.ADDRESS_DETAILS: {
      values.address.forEach((_, index) => {
        const dName = fullCompanyDetailsSchema
          .address_information({
            mode,
            index,
            disabled: false,
            disabledAddressType: false,
          })
          .map((f) => f.name) as Array<keyof FullCompanyFormType>;
        names = [...names, ...dName];
      });
      return names;
    }

    case StepKey.BRAND_DETAILS: {
      const brandInfoNames = fullCompanyDetailsSchema
        .brand_information({ mode })
        .map((f) => f.name) as Array<keyof FullCompanyFormType>;
      names = [...names, ...brandInfoNames];

      values.sellingOn?.forEach((_, index) => {
        const platformNames = fullCompanyDetailsSchema
          .selling_platforms({ mode, index })
          .map((f) => f.name) as Array<keyof FullCompanyFormType>;
        names = [...names, ...platformNames];
      });
      return names;
    }

    case StepKey.DOCUMENTS_DETAILS: {
      values.documents.forEach((_, index) => {
        const dName = fullCompanyDetailsSchema
          .documents_information({ mode, index })
          .map((f) => f.name) as Array<keyof FullCompanyFormType>;
        names = [...names, ...dName];
      });

      if (!values.companyName) names.push("companyName");
      if (!values.establishedIn) names.push("establishedIn");
      return names;
    }

    default:
      return names;
  }
}
