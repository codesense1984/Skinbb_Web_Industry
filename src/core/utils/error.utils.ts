import { toast } from "sonner";

/**
 * Error response types from different API formats
 */
export type ValidationError = {
  type?: string;
  field?: string;
  value?: unknown;
  msg?: string;
  message?: string;
  path?: string;
  location?: string;
};

export type ErrorResponse = {
  status?: string;
  success?: boolean;
  message?: string;
  error?: string;
  detail?: string;
  statusCode?: number;
  errors?: ValidationError[];
} & Record<string, unknown>;

export type NormalizedError = {
  message: string;
  statusCode?: number;
  errors?: ValidationError[];
  raw?: unknown;
};

/**
 * Handles all types of error responses from API requests
 * Supports multiple error formats:
 * - Validation errors with errors array
 * - Mongoose/populate errors
 * - Python-style errors with detail
 * - Generic errors with error/message fields
 *
 * @param error - The error object (can be AxiosError, Error, or unknown)
 * @param options - Configuration options
 * @param options.showToast - Whether to show toast notification (default: false)
 * @param options.toastMessage - Custom toast message (overrides extracted message)
 * @returns Normalized error object with message, statusCode, and errors array
 *
 * @example
 * ```ts
 * try {
 *   await api.post('/endpoint', data);
 * } catch (error) {
 *   const normalized = handleErrorRequest(error, { showToast: true });
 *   // normalized.message contains the error message
 *   // normalized.errors contains validation errors if any
 * }
 * ```
 */
export function handleErrorRequest(
  error: unknown,
  options?: {
    showToast?: boolean;
    toastMessage?: string;
  },
): NormalizedError {
  const { showToast = false, toastMessage } = options || {};

  let normalized: NormalizedError = {
    message: "An unexpected error occurred",
    raw: error,
  };

  // Handle AxiosError (from axios requests)
  if (isAxiosError(error)) {
    const responseData = error.response?.data as ErrorResponse | undefined;
    const statusCode = error.response?.status || error.status;

    if (responseData) {
      normalized = extractErrorFromResponse(responseData, statusCode);
    } else {
      normalized = {
        message: error.message || "Request failed",
        statusCode,
        raw: error,
      };
    }
  }
  // Handle Error objects
  else if (error instanceof Error) {
    // Try to parse error message as JSON (in case it's a stringified error response)
    try {
      const parsed = JSON.parse(error.message) as ErrorResponse;
      normalized = extractErrorFromResponse(parsed);
    } catch {
      // If not JSON, use the error message directly
      normalized = {
        message: error.message || "An error occurred",
        raw: error,
      };
    }
  }
  // Handle plain objects (error responses)
  else if (error && typeof error === "object") {
    normalized = extractErrorFromResponse(error as ErrorResponse);
  }
  // Handle string errors
  else if (typeof error === "string") {
    normalized = {
      message: error,
      raw: error,
    };
  }

  // Show toast notification if requested
  if (showToast) {
    const messageToShow = toastMessage || normalized.message;
    toast.error(messageToShow);

    // If there are validation errors, show additional info
    if (normalized.errors && normalized.errors.length > 0) {
      const firstError = normalized.errors[0];
      const fieldError = firstError.msg || firstError.message;
      if (fieldError && fieldError !== normalized.message) {
        toast.error(fieldError);
      }
    }
  }

  return normalized;
}

/**
 * Extracts error information from various API response formats
 */
function extractErrorFromResponse(
  response: ErrorResponse,
  statusCode?: number,
): NormalizedError {
  const normalized: NormalizedError = {
    message: "An error occurred",
    statusCode: response.statusCode || statusCode,
    raw: response,
  };

  // Handle validation errors with errors array
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    normalized.errors = response.errors;

    // Extract message from first error if no main message exists
    const firstError = response.errors[0];
    const errorMessage = firstError.msg || firstError.message;

    if (errorMessage) {
      normalized.message = errorMessage;
    } else if (response.message) {
      normalized.message = response.message;
    } else {
      normalized.message = "Validation failed";
    }
  }
  // Handle Python-style errors with detail field
  else if (response.detail) {
    normalized.message = String(response.detail);
  }
  // Handle generic error field
  else if (response.error) {
    normalized.message = String(response.error);
  }
  // Handle message field
  else if (response.message) {
    normalized.message = String(response.message);
  }
  // Handle Mongoose/populate errors (usually in message field)
  else if (response.status === "error" && response.message) {
    normalized.message = String(response.message);
  }

  return normalized;
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is {
  isAxiosError: boolean;
  response?: { status?: number; data?: unknown };
  status?: number;
  message: string;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

/**
 * Extracts validation errors for form field mapping
 * Useful for react-hook-form setError
 *
 * @param error - The error object
 * @returns Array of field errors with field name and message
 *
 * @example
 * ```ts
 * const fieldErrors = getValidationErrors(error);
 * fieldErrors.forEach(({ field, message }) => {
 *   setError(field, { type: "manual", message });
 * });
 * ```
 */
export function getValidationErrors(error: unknown): Array<{
  field: string;
  message: string;
}> {
  const normalized = handleErrorRequest(error);

  if (!normalized.errors || normalized.errors.length === 0) {
    return [];
  }

  return normalized.errors
    .map((err) => {
      const field = err.path || err.field || "";
      const message = err.msg || err.message || normalized.message;

      if (!field) return null;

      return {
        field,
        message,
      };
    })
    .filter((err): err is { field: string; message: string } => err !== null);
}

/**
 * Gets a single error message from an error object
 * Useful for simple error display
 *
 * @param error - The error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  return handleErrorRequest(error).message;
}

