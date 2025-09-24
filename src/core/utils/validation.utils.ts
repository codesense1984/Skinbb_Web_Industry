import { z } from "zod";

// Constants for validation
export const VALIDATION_CONSTANTS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 20,
    REGEX: /^(?![0-9])(?=.*[0-9])(?=.*[@#$%!*&])([^\s])+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
  },
  POSTAL_CODE: {
    REGEX: /^\d{6}$/,
  },
  URL: {
    // REGEX:
    //   /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/,
    // REGEX:/^(?:https?:\/\/)?(?:www\.)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}(?::\d{1,5})?(?:[?#]\S*)?$/,
    REGEX:
      /^(?:https?:\/\/)?(?:www\.)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}(?::\d{1,5})?(?:\/[^\s?#]*)*(?:[?#]\S*)?$/,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// Reusable validation functions
export const createUrlValidator = (platformName: string) => {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (url) => {
        if (!url || url.trim() === "") return true;
        return VALIDATION_CONSTANTS.URL.REGEX.test(url);
      },
      {
        message: `Please enter a valid ${platformName} URL`,
      },
    );
};

export const createRequiredString = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

export const createOptionalString = () =>
  z.string().optional().or(z.literal(""));

export const createEmailValidator = (fieldName: string = "Email") =>
  z.string().email(`Invalid ${fieldName.toLowerCase()}`);

export const createPhoneValidator = (fieldName: string = "Phone number") =>
  z
    .string()
    .min(
      VALIDATION_CONSTANTS.PHONE.MIN_LENGTH,
      `Invalid ${fieldName.toLowerCase()}`,
    );

export const createPasswordValidator = () =>
  z
    .string()
    .nonempty("Password is required")
    .min(
      VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH,
      `Password must be at least ${VALIDATION_CONSTANTS.PASSWORD.MIN_LENGTH} characters`,
    )
    .max(
      VALIDATION_CONSTANTS.PASSWORD.MAX_LENGTH,
      `Password must be at most ${VALIDATION_CONSTANTS.PASSWORD.MAX_LENGTH} characters`,
    )
    .regex(
      VALIDATION_CONSTANTS.PASSWORD.REGEX,
      "Password must start with a non-digit, include at least one number, one special character (@#$%!*&), and contain no whitespace",
    );

export const createPostalCodeValidator = (fieldName: string = "Postal code") =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .regex(VALIDATION_CONSTANTS.POSTAL_CODE.REGEX, "Must be exactly 6 digits");

// Common validation schemas
export const commonValidators = {
  requiredString: createRequiredString,
  optionalString: createOptionalString,
  email: createEmailValidator,
  phone: createPhoneValidator,
  password: createPasswordValidator,
  postalCode: createPostalCodeValidator,
  url: createUrlValidator,
} as const;
