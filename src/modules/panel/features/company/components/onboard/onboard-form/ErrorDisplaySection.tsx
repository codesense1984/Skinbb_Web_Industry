import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { Alert } from "@/core/components/ui/alert";
import { Badge } from "@/core/components/ui/badge";
import { CardTitle } from "@/core/components/ui/card";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import type { FullCompanyFormType } from "../../../schema/fullCompany.schema";
import { cn } from "@/core/utils";

interface ErrorDisplaySectionProps {
  className?: string;
  onFieldClick?: (fieldName: string) => void;
}

interface FormError {
  field: string;
  message: string;
  type: string;
}

const ErrorDisplaySection: React.FC<ErrorDisplaySectionProps> = ({
  className,
  onFieldClick,
}) => {
  const {
    formState: { errors },
  } = useFormContext<FullCompanyFormType>();

  // Function to extract all errors from the form state
  const extractErrors = (errorObj: any, prefix = ""): FormError[] => {
    const errorList: FormError[] = [];

    if (!errorObj || typeof errorObj !== "object") {
      return errorList;
    }

    Object.keys(errorObj).forEach((key) => {
      const error = errorObj[key];
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (error && typeof error === "object") {
        // Check if it's a field error with message
        if ("message" in error && typeof error.message === "string") {
          errorList.push({
            field: fieldPath,
            message: error.message,
            type: error.type || "validation",
          });
        }
        // Check if it's a root error (like address array validation)
        else if (
          "root" in error &&
          error.root &&
          typeof error.root === "object"
        ) {
          if (
            "message" in error.root &&
            typeof error.root.message === "string"
          ) {
            errorList.push({
              field: fieldPath,
              message: error.root.message,
              type: error.root.type || "validation",
            });
          }
        }
        // Recursively check nested objects (like array items)
        else {
          errorList.push(...extractErrors(error, fieldPath));
        }
      }
    });

    return errorList;
  };

  const allErrors = extractErrors(errors);
  const errorCount = allErrors.length;

  // Don't render if there are no errors
  if (errorCount === 0) {
    return null;
  }

  // Group errors by field type for better organization
  const groupedErrors = allErrors.reduce(
    (acc, error) => {
      const category = error.field.split(".")[0] || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(error);
      return acc;
    },
    {} as Record<string, FormError[]>,
  );

  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      designation: "Personal Information",
      address: "Address Information",
      companyName: "Company Details",
      brandName: "Brand Information",
      documents: "Document Information",
      phoneNumber: "Contact Information",
      email: "Contact Information",
      password: "Security Information",
      general: "General",
    };
    return (
      titles[category] || category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  return (
    <Accordion
      type="single"
      className={cn("border-destructive rounded-lg border", className)}
      collapsible
      defaultValue="errors"
    >
      <AccordionItem value="errors" className="p-5">
        <AccordionTrigger className="py-0 hover:no-underline">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="text-destructive h-5 w-5" />
              <CardTitle className="text-destructive text-base">
                Form Validation Errors
              </CardTitle>
            </div>
            <Badge variant="destructive" className="text-xs">
              {errorCount} {errorCount === 1 ? "Error" : "Errors"}
            </Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pt-5">
          <Alert
            variant="destructive"
            className="mb-4"
            title={"Please fix the following errors"}
            description={
              "Complete all required fields and ensure all information is valid before proceeding."
            }
          />

          <div className="space-y-4">
            {Object.entries(groupedErrors).map(([category, categoryErrors]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium">
                  Step: {getCategoryTitle(category)}
                </h4>
                <div className="space-y-2">
                  {categoryErrors.map((error, index) => (
                    <div
                      key={`${error.field}-${index}`}
                      className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-md border p-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {onFieldClick ? (
                            <button
                              type="button"
                              onClick={() => onFieldClick?.(error.field)}
                              className="text-destructive hover:text-destructive/80 cursor-pointer text-sm font-medium hover:underline"
                            >
                              {error.field}
                            </button>
                          ) : (
                            <div className="text-destructive hover:text-destructive/80 cursor-pointer text-sm font-medium hover:underline">
                              {error.field}
                            </div>
                          )}
                        </div>
                        <p className="text-destructive/80 text-sm">
                          {error.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {onFieldClick && (
            <div className="border-destructive/20 mt-4 border-t pt-4">
              <p className="text-muted-foreground text-xs">
                💡 Tip: Click on the field names above to navigate to the
                specific sections and fix the errors.
              </p>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ErrorDisplaySection;
