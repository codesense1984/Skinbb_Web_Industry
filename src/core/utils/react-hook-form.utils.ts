import { toast } from "sonner";

export const handleFormErrors = (error: unknown) => {
  if (error && typeof error === "object") {
    const errorMessages: string[] = [];
    const fieldNames: Record<string, string> = {
      name: "Brand Name",
      brandType: "Brand Type",
      marketingBudget: "Marketing Budget",
      totalSKU: "Total SKU",
      authorizationLetter: "Authorization Letter",
      websiteUrl: "Website URL",
    };

    Object.keys(error).forEach((fieldName) => {
      const fieldError = (error as Record<string, unknown>)[fieldName];
      if (
        fieldError &&
        typeof fieldError === "object" &&
        "message" in fieldError &&
        typeof (fieldError as Record<string, unknown>).message === "string"
      ) {
        const displayName = fieldNames[fieldName] || fieldName;
        const message = (fieldError as Record<string, unknown>).message as string;
        errorMessages.push(`${displayName}: ${message}`);
      }
    });

    if (errorMessages.length > 0) {
      // Show all errors, not just first 3
      errorMessages.forEach((msg) => {
        toast.error(msg, { duration: 5000 });
      });
    } else {
      toast.error("Please fix the form errors before proceeding");
    }
  } else {
    toast.error("Please fix the form errors before proceeding");
  }
};
