import { Button } from "@/core/components/ui/button";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

interface FormFooterProps {
  isFirst: boolean;
  isLast: boolean;
  agreeTermsConditions: boolean;
  isPending: boolean;
  isVerifyingDocuments?: boolean;
  onBack: () => void;
}

export const FormFooter = ({
  isFirst,
  isLast,
  agreeTermsConditions,
  isPending,
  isVerifyingDocuments = false,
  onBack,
}: FormFooterProps) => {
  return (
    <div className="bg-background sticky bottom-0 mt-auto flex justify-between border-t py-4">
      {!isFirst && (
        <Button
          size={"lg"}
          type="button"
          color={"secondary"}
          onClick={onBack}
          disabled={isFirst || isPending}
          className={"button-outline"}
          startIcon={<ArrowLeftIcon />}
        >
          Back
        </Button>
      )}
      <Button
        size={"lg"}
        type="submit"
        variant={"contained"}
        color={"secondary"}
        endIcon={isLast ? <DocumentIcon /> : <ArrowRightIcon />}
        disabled={(isLast && !agreeTermsConditions) || isPending}
        className="ml-auto"
      >
        {isLast
          ? isPending
            ? "Submitting..."
            : "Submit"
          : isVerifyingDocuments
            ? "Verifying..."
            : "Next"}
      </Button>
    </div>
  );
};
