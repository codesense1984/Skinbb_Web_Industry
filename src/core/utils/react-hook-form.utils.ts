import { toast } from "sonner";

export const handleFormErrors = (error: unknown) => {
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
