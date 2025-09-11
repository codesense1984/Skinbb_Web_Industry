// import { memo, useCallback } from "react";
// import {
//   Stepper,
//   StepperIndicator,
//   StepperItem,
//   StepperTrigger,
// } from "@/core/components/ui/stepper";
// import { CheckIcon } from "@heroicons/react/24/solid";
// import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
// import type { OnboardingStep } from "../../hooks/useOnboardingSteps";
// import { cn } from "@/core/lib/utils";

// interface ProgressStepperProps {
//   steps: OnboardingStep[];
//   currentStepIndex: number;
//   onStepClick: (stepIndex: number) => void;
//   className?: string;
//   disabled?: boolean;
// }

// export const ProgressStepper = memo(
//   ({
//     steps,
//     currentStepIndex,
//     onStepClick,
//     className,
//     disabled = false,
//   }: ProgressStepperProps) => {
//     const handleStepClick = useCallback(
//       (stepIndex: number) => {
//         if (!disabled && steps[stepIndex]?.isAccessible) {
//           onStepClick(stepIndex);
//         }
//       },
//       [disabled, steps, onStepClick],
//     );

//     const getStepStatus = useCallback(
//       (step: OnboardingStep, index: number) => {
//         if (step.isCompleted) return "completed";
//         if (index === currentStepIndex) return "current";
//         if (step.isAccessible) return "accessible";
//         return "locked";
//       },
//       [currentStepIndex],
//     );

//     const getStepIcon = useCallback(
//       (step: OnboardingStep, index: number) => {
//         const status = getStepStatus(step, index);

//         switch (status) {
//           case "completed":
//             return <CheckIcon className="h-4 w-4 text-white" />;
//           case "current":
//             return (
//               <span className="text-sm font-semibold text-white">
//                 {step.stepNumber}
//               </span>
//             );
//           case "accessible":
//             return (
//               <span className="text-sm font-semibold text-gray-600">
//                 {step.stepNumber}
//               </span>
//             );
//           case "locked":
//             return (
//               <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
//             );
//           default:
//             return (
//               <span className="text-sm font-semibold text-gray-400">
//                 {step.stepNumber}
//               </span>
//             );
//         }
//       },
//       [getStepStatus],
//     );

//     const getStepClasses = useCallback(
//       (step: OnboardingStep, index: number) => {
//         const status = getStepStatus(step, index);
//         const baseClasses =
//           "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200";

//         switch (status) {
//           case "completed":
//             return cn(
//               baseClasses,
//               "bg-green-500 hover:bg-green-600 cursor-pointer",
//             );
//           case "current":
//             return cn(
//               baseClasses,
//               "bg-blue-500 hover:bg-blue-600 cursor-pointer",
//             );
//           case "accessible":
//             return cn(
//               baseClasses,
//               "bg-gray-200 hover:bg-gray-300 cursor-pointer",
//             );
//           case "locked":
//             return cn(baseClasses, "bg-gray-100 cursor-not-allowed");
//           default:
//             return cn(baseClasses, "bg-gray-100 cursor-not-allowed");
//         }
//       },
//       [getStepStatus],
//     );

//     return (
//       <div className={cn("w-full", className)}>
//         <Stepper
//           value={currentStepIndex + 1}
//           onValueChange={(value) => {
//             const stepIndex = value - 1;
//             handleStepClick(stepIndex);
//           }}
//           className="gap-1"
//         >
//           {steps.map((step, index) => (
//             <StepperItem
//               key={step.key}
//               step={step.stepNumber}
//               className="flex-1"
//             >
//               <StepperTrigger
//                 className="w-full flex-col items-start gap-2"
//                 asChild
//                 disabled={!step.isAccessible || disabled}
//               >
//                 <div className="flex w-full items-center gap-3">
//                   <div className={getStepClasses(step, index)}>
//                     {getStepIcon(step, index)}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center justify-between">
//                       <p
//                         className={cn(
//                           "truncate text-sm font-medium",
//                           index === currentStepIndex
//                             ? "text-blue-600"
//                             : "text-gray-700",
//                         )}
//                       >
//                         {step.stepTitle}
//                       </p>
//                       {step.isCompleted && (
//                         <CheckIcon className="h-4 w-4 flex-shrink-0 text-green-500" />
//                       )}
//                     </div>

//                     <StepperIndicator
//                       asChild
//                       className={cn(
//                         "h-2 w-full transition-colors duration-200",
//                         step.isCompleted
//                           ? "bg-green-500"
//                           : index === currentStepIndex
//                             ? "bg-blue-500"
//                             : step.isAccessible
//                               ? "bg-gray-200"
//                               : "bg-gray-100",
//                       )}
//                     >
//                       <span className="sr-only">
//                         Step {step.stepNumber}: {step.stepTitle}
//                       </span>
//                     </StepperIndicator>
//                   </div>
//                 </div>
//               </StepperTrigger>
//             </StepperItem>
//           ))}
//         </Stepper>
//       </div>
//     );
//   },
// );

// ProgressStepper.displayName = "ProgressStepper";

// export default ProgressStepper;

