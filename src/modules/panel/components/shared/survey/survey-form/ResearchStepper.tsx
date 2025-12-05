import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/core/components/ui/stepper";

const steps = [
  {
    step: 1,
    title: "Survey Basics",
  },
  {
    step: 2,
    title: "Select Questions",
  },
  {
    step: 3,
    title: "Target Audience",
  },
  {
    step: 4,
    title: "Review & Launch",
  },
];

type ResearchStepperProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
};

export default function ResearchStepper({
  currentStep,
  onStepChange,
}: ResearchStepperProps) {
  return (
    <div className="text-center">
      <Stepper value={currentStep} onValueChange={onStepChange}>
        {steps.map(({ step, title }) => (
          <StepperItem
            key={step}
            step={step}
            className="relative flex-1 flex-col!"
          >
            <StepperTrigger className="flex-col gap-3 rounded">
              <StepperIndicator className="border" />
              <div className="space-y-0.5 px-2">
                <StepperTitle className="text-muted-foreground text-xs font-normal whitespace-nowrap">
                  {title}
                </StepperTitle>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none bg-border" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
