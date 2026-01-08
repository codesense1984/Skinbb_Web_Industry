// Error utilities need to handle unknown error shapes, so 'any' is appropriate here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { AxiosError } from "axios";
import { baseApiUrl, basePythonApiUrl } from "@/core/config/baseUrls";

/**
 * Type guard to check if an error is an Axios error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAxiosError(error: any): error is AxiosError {
  return error && typeof error === "object" && "isAxiosError" in error;
}

/**
 * Type guard to check if an error is a native Fetch error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isFetchError(error: any): error is Error {
  return error instanceof Error && !("isAxiosError" in error);
}

/**
 * Determines which API service the error originated from
 * by checking the baseURL in the error config or response URL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getApiSource(error: any): "python" | "node" | "unknown" {
  if (!error || typeof error !== "object") {
    return "unknown";
  }

  // For Axios errors, check config.baseURL or response.config.baseURL
  if (isAxiosError(error)) {
    const baseURL =
      error.config?.baseURL ||
      error.response?.config?.baseURL ||
      error.request?.responseURL;

    if (baseURL && typeof baseURL === "string") {
      // Check if baseURL contains the Python API URL
      if (basePythonApiUrl && typeof basePythonApiUrl === "string") {
        try {
          const pythonUrl = new URL(basePythonApiUrl);
          const errorUrl = baseURL.startsWith("http")
            ? new URL(baseURL)
            : new URL(
                baseURL,
                typeof window !== "undefined"
                  ? window.location.origin
                  : "http://localhost",
              );
          if (errorUrl.origin === pythonUrl.origin) {
            return "python";
          }
        } catch {
          // Fallback to string includes if URL parsing fails
          if (baseURL.includes(basePythonApiUrl)) {
            return "python";
          }
        }
      }

      // Check if baseURL contains the Node API URL
      if (baseApiUrl && typeof baseApiUrl === "string") {
        try {
          const nodeUrl = new URL(baseApiUrl);
          const errorUrl = baseURL.startsWith("http")
            ? new URL(baseURL)
            : new URL(
                baseURL,
                typeof window !== "undefined"
                  ? window.location.origin
                  : "http://localhost",
              );
          if (errorUrl.origin === nodeUrl.origin) {
            return "node";
          }
        } catch {
          // Fallback to string includes if URL parsing fails
          if (baseURL.includes(baseApiUrl)) {
            return "node";
          }
        }
      }
    }

    // Fallback: check response URL or request URL
    const responseURL =
      error.response?.config?.url ||
      error.config?.url ||
      error.request?.responseURL;

    if (responseURL && typeof responseURL === "string") {
      try {
        const url = new URL(
          responseURL,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost",
        );
        if (basePythonApiUrl && typeof basePythonApiUrl === "string") {
          const pythonUrl = new URL(basePythonApiUrl);
          if (url.origin === pythonUrl.origin) {
            return "python";
          }
        }
        if (baseApiUrl && typeof baseApiUrl === "string") {
          const nodeUrl = new URL(baseApiUrl);
          if (url.origin === nodeUrl.origin) {
            return "node";
          }
        }
      } catch {
        // Invalid URL, continue to fallback
      }
    }
  }

  // For Fetch errors, try to infer from error message or structure
  if (isFetchError(error)) {
    // Could check error.stack or other properties if needed
    // For now, default to unknown
  }

  return "unknown";
}

/**
 * Helper function to extract all messages from an errors array
 * Handles various formats: {msg}, {message}, {detail}, string arrays, etc.
 */
function extractMessagesFromArray(
  errors: any[],
  options: { maxMessages?: number; separator?: string } = {},
): string | null {
  if (!Array.isArray(errors) || errors.length === 0) {
    return null;
  }

  const { maxMessages = 5, separator = "; " } = options;
  const messages: string[] = [];

  for (const errorItem of errors.slice(0, maxMessages)) {
    if (!errorItem) continue;

    // Handle string errors directly
    if (typeof errorItem === "string") {
      const trimmed = errorItem.trim();
      if (trimmed) messages.push(trimmed);
      continue;
    }

    // Handle object errors with various properties
    if (typeof errorItem === "object") {
      const message =
        errorItem.msg ||
        errorItem.message ||
        errorItem.detail ||
        errorItem.error ||
        errorItem.description;

      if (message && typeof message === "string") {
        const trimmed = message.trim();
        if (trimmed) messages.push(trimmed);
      }
    }
  }

  if (messages.length === 0) {
    return null;
  }

  // If there are more errors than maxMessages, append a note
  if (errors.length > maxMessages) {
    messages.push(`and ${errors.length - maxMessages} more error(s)`);
  }

  return messages.join(separator);
}

/**
 * Extractor functions for different error message formats
 * Each extractor returns the message if found, or null/undefined if not
 */
type MessageExtractor = (error: any) => string | null | undefined;

const extractors = {
  /**
   * Python API extractors (priority order: message, detail, error, array of errors)
   */
  python: [
    // { success, message, trace }
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      return data?.message;
    },
    // { error, detail, path }
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      return data?.detail;
    },
    // { error }
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      return data?.error;
    },
    // Handle array of errors: { errors: [...] } or data itself is an array
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;

      // Check if data itself is an array
      if (Array.isArray(data)) {
        return extractMessagesFromArray(data);
      }

      // Check for errors array property
      if (data?.errors && Array.isArray(data.errors)) {
        return extractMessagesFromArray(data.errors);
      }

      // Check for detail array (common in FastAPI validation errors)
      if (data?.detail && Array.isArray(data.detail)) {
        return extractMessagesFromArray(data.detail);
      }

      return null;
    },
  ] as MessageExtractor[],

  /**
   * Node/Vite API extractors (priority order: errors array first, then message, then code)
   * Priority: errors array > message > code
   */
  node: [
    // { errors: [{msg, param}]} - Extract ALL errors from array (HIGHEST PRIORITY)
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;

      // Check if data itself is an array
      if (Array.isArray(data)) {
        return extractMessagesFromArray(data);
      }

      // Check for errors array property with items
      const errors = data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return extractMessagesFromArray(errors);
      }

      return null;
    },
    // { status, statusCode, message, errors: [] } - Use message when errors array is empty or missing
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      return data?.message;
    },
    // Fallback: single error from array (for backward compatibility)
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      const errors = data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        return errors[0]?.msg || errors[0]?.message;
      }
      return null;
    },
    // { ok, code, message }
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;
      return data?.code;
    },
  ] as MessageExtractor[],

  /**
   * Fallback extractors for unknown sources or generic errors
   */
  unknown: [
    // Try common patterns from both APIs
    (error: any): string | null | undefined => {
      const data = error?.response?.data || error?.data;

      // Check if data is an array
      if (Array.isArray(data)) {
        return extractMessagesFromArray(data);
      }

      // Check for errors array
      if (data?.errors && Array.isArray(data.errors)) {
        return extractMessagesFromArray(data.errors);
      }

      return data?.message || data?.detail || data?.error;
    },
    // Standard Error.message
    (error: any): string | null | undefined => {
      if (error?.message && typeof error.message === "string") {
        return error.message;
      }
      return null;
    },
  ] as MessageExtractor[],
};

/**
 * Extracts error message using the appropriate extractors based on API source
 */
function extractMessage(
  error: any,
  source: "python" | "node" | "unknown",
): string | null {
  const extractorList = extractors[source];

  for (const extractor of extractorList) {
    try {
      const message = extractor(error);
      if (message && typeof message === "string" && message.trim().length > 0) {
        return message.trim();
      }
    } catch {
      // Continue to next extractor if one fails
      continue;
    }
  }

  return null;
}

/**
 * Normalizes error messages from different backend services (VITE_API_URL and VITE_PYTHON_API_URL).
 * Handles single errors, arrays of errors, and various error formats from both APIs.
 *
 * @param error - An Axios error, native Fetch error, or any error object
 * @returns A user-friendly error message string. For arrays of errors, combines them with "; " separator.
 *
 * @example
 * ```typescript
 * // With Axios interceptor
 * axios.interceptors.response.use(
 *   (response) => response,
 *   (error) => {
 *     const message = getErrorMessage(error);
 *     toast.error(message);
 *     return Promise.reject(error);
 *   }
 * );
 *
 * // With try/catch
 * try {
 *   await api.post('/endpoint', data);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   toast.error(message);
 * }
 *
 * // Handles arrays automatically:
 * // { errors: [{msg: "Error 1"}, {msg: "Error 2"}] }
 * // Returns: "Error 1; Error 2"
 * ```
 */
export function getErrorMessage(error: any): string {
  // Handle null/undefined
  if (!error) {
    return "An unexpected error occurred.";
  }

  // Handle string errors
  if (typeof error === "string") {
    return error.trim() || "An unexpected error occurred.";
  }

  // Determine API source
  const source = getApiSource(error);

  // Try to extract message using source-specific extractors
  const message = extractMessage(error, source);

  if (message) {
    return message;
  }

  // Fallback: try standard error properties
  if (error?.message && typeof error.message === "string") {
    return error.message.trim() || "An unexpected error occurred.";
  }

  // Final fallback
  return "An unexpected error occurred.";
}

/**
 * Type-safe version that accepts only Error-like objects
 * Useful when you know the error type
 */
export function getErrorMessageSafe(
  error: Error | AxiosError | unknown,
): string {
  return getErrorMessage(error);
}

/**
 * Extracts all error messages from an error object as an array.
 * Useful when you need to display errors separately (e.g., in a list or multiple toasts).
 *
 * @param error - An Axios error, native Fetch error, or any error object
 * @returns An array of error message strings. Returns empty array if no messages found.
 *
 * @example
 * ```typescript
 * try {
 *   await api.post('/endpoint', data);
 * } catch (error) {
 *   const messages = getAllErrorMessages(error);
 *   // Display each error separately
 *   messages.forEach(msg => toast.error(msg));
 *   // Or combine them
 *   if (messages.length > 0) {
 *     toast.error(messages.join('\n'));
 *   }
 * }
 * ```
 */
export function getAllErrorMessages(error: any): string[] {
  if (!error) {
    return [];
  }

  if (typeof error === "string") {
    return error.trim() ? [error.trim()] : [];
  }

  const data = error?.response?.data || error?.data;

  // If data itself is an array
  if (Array.isArray(data)) {
    const messages: string[] = [];
    for (const item of data) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) messages.push(trimmed);
      } else if (item && typeof item === "object") {
        const msg =
          item.msg ||
          item.message ||
          item.detail ||
          item.error ||
          item.description;
        if (msg && typeof msg === "string") {
          const trimmed = msg.trim();
          if (trimmed) messages.push(trimmed);
        }
      }
    }
    return messages;
  }

  // Check for errors array property
  if (data?.errors && Array.isArray(data.errors)) {
    const messages: string[] = [];
    for (const errorItem of data.errors) {
      if (typeof errorItem === "string") {
        const trimmed = errorItem.trim();
        if (trimmed) messages.push(trimmed);
      } else if (errorItem && typeof errorItem === "object") {
        const msg =
          errorItem.msg ||
          errorItem.message ||
          errorItem.detail ||
          errorItem.error ||
          errorItem.description;
        if (msg && typeof msg === "string") {
          const trimmed = msg.trim();
          if (trimmed) messages.push(trimmed);
        }
      }
    }
    if (messages.length > 0) return messages;
  }

  // Check for detail array (FastAPI validation errors)
  if (data?.detail && Array.isArray(data.detail)) {
    const messages: string[] = [];
    for (const item of data.detail) {
      if (typeof item === "string") {
        const trimmed = item.trim();
        if (trimmed) messages.push(trimmed);
      } else if (item && typeof item === "object") {
        const msg = item.msg || item.message || item.loc?.join(": ") || "";
        if (msg && typeof msg === "string") {
          const trimmed = msg.trim();
          if (trimmed) messages.push(trimmed);
        }
      }
    }
    if (messages.length > 0) return messages;
  }

  // Try single message properties
  const singleMessage =
    data?.message || data?.detail || data?.error || error?.message;

  if (singleMessage && typeof singleMessage === "string") {
    const trimmed = singleMessage.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}
