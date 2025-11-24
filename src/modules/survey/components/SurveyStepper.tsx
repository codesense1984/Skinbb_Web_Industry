import { CheckIcon } from "@heroicons/react/24/solid";
import { cn } from "@/core/utils";

export type SurveyStep = 1 | 2 | 3 | 4;

interface SurveyStepperProps {
  currentStep: SurveyStep;
  onStepClick?: (step: SurveyStep) => void;
}

const steps = [
  { number: 1, label: "Survey Basics" },
  { number: 2, label: "Select Questions" },
  { number: 3, label: "Target Audience" },
  { number: 4, label: "Review & Launch" },
] as const;

export const SurveyStepper = ({ currentStep, onStepClick }: SurveyStepperProps) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const stepNumber = step.number as SurveyStep;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => onStepClick?.(stepNumber)}
                disabled={!onStepClick || isUpcoming}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                  isCompleted &&
                    "bg-primary text-white border-2 border-primary",
                  isCurrent &&
                    "bg-primary text-white border-2 border-primary ring-4 ring-primary/20",
                  isUpcoming &&
                    "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed",
                  !isUpcoming && onStepClick && "cursor-pointer hover:ring-4 hover:ring-primary/20",
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </button>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  isCurrent && "text-primary font-semibold",
                  isCompleted && "text-gray-600",
                  isUpcoming && "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 -mt-5",
                  isCompleted ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};




