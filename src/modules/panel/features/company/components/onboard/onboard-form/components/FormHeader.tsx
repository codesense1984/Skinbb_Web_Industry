import { Button } from "@/core/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperTrigger,
} from "@/core/components/ui/stepper";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FormSteps } from "../constants";
import { StepKey } from "../../../../config/steps.config";

interface FormHeaderProps {
  currentItem: {
    step: number;
    stepTitle: string;
  };
  onBack: () => void;
  onStepChange: (value: number) => void;
}

export const FormHeader = ({
  currentItem,
  onBack,
  onStepChange,
}: FormHeaderProps) => {
  return (
    <div className="flex w-full gap-3">
      <Button
        className="border-muted-foreground"
        variant="ghost"
        color="default"
        size="icon"
        onClick={onBack}
        aria-label="Go back"
        type="button"
      >
        <ArrowLeftIcon />
      </Button>
      <div className="w-full">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{currentItem?.stepTitle}</p>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground text-sm">
              {currentItem.step} / {FormSteps.length}
            </p>
          </div>
        </div>
        <Stepper
          value={currentItem.step}
          onValueChange={onStepChange}
          className="gap-1"
        >
          {FormSteps.map((n) => {
            const stepIndex = n - 1;
            const stepKey = [
              StepKey.COMPANY_DETAILS,
              StepKey.ADDRESS_DETAILS,
              StepKey.BRAND_DETAILS,
              StepKey.DOCUMENTS_DETAILS,
              StepKey.PERSONAL_INFORMATION,
            ][stepIndex];

            if (!stepKey) return null;

            return (
              <StepperItem key={n} step={n} className="flex-1">
                <StepperTrigger
                  className="w-full flex-col items-start gap-2"
                  asChild
                >
                  <StepperIndicator
                    asChild
                    className={"h-2 w-full transition-colors"}
                  >
                    <span className="sr-only">{n}</span>
                  </StepperIndicator>
                </StepperTrigger>
              </StepperItem>
            );
          })}
        </Stepper>
      </div>
    </div>
  );
};
