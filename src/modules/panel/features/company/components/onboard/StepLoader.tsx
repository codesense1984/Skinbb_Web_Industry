// import { lazy, Suspense, memo, type ComponentType } from "react";
// import { MODE } from "@/core/types";
// import { StepKey } from "../../config/steps.config";

// // Lazy load step components with proper error boundaries
// const CompanyDetails = lazy(() =>
//   import("./onboard-form/CompanyDetails").then((module) => ({
//     default: module.default,
//   })),
// );

// const AddressDetails = lazy(() =>
//   import("./onboard-form/AddressDetails").then((module) => ({
//     default: module.AddressDetails,
//   })),
// );

// const BrandDetails = lazy(() =>
//   import("./onboard-form/BrandDetails").then((module) => ({
//     default: module.default,
//   })),
// );

// const DocumentDetails = lazy(() =>
//   import("./onboard-form/DocumentDetails").then((module) => ({
//     default: module.DocumentDetails,
//   })),
// );

// const PersonalDetails = lazy(() =>
//   import("./onboard-form/PersonalDetails").then((module) => ({
//     default: module.default,
//   })),
// );

// const Thankyou = lazy(() =>
//   import("./onboard-form/Thankyou").then((module) => ({
//     default: module.default,
//   })),
// );

// // Component mapping
// const STEP_COMPONENTS: Record<StepKey, ComponentType<{ mode: MODE }>> = {
//   [StepKey.COMPANY_DETAILS]: CompanyDetails,
//   [StepKey.ADDRESS_DETAILS]: AddressDetails,
//   [StepKey.BRAND_DETAILS]: BrandDetails,
//   [StepKey.DOCUMENTS_DETAILS]: DocumentDetails,
//   [StepKey.PERSONAL_INFORMATION]: PersonalDetails,
//   [StepKey.THANK_YOU]: Thankyou,
// };

// // Enhanced loading skeleton with better UX
// const LoadingSkeleton = memo(() => (
//   <div className="animate-pulse space-y-6">
//     <div className="space-y-4">
//       <div className="h-4 w-1/4 rounded bg-gray-200"></div>
//       <div className="h-3 w-1/2 rounded bg-gray-200"></div>
//     </div>

//     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//       {Array.from({ length: 4 }).map((_, index) => (
//         <div key={index} className="space-y-3">
//           <div className="h-4 w-1/3 rounded bg-gray-200"></div>
//           <div className="h-10 rounded bg-gray-200"></div>
//         </div>
//       ))}
//     </div>

//     <div className="space-y-3">
//       <div className="h-4 w-1/4 rounded bg-gray-200"></div>
//       <div className="h-20 rounded bg-gray-200"></div>
//     </div>
//   </div>
// ));

// LoadingSkeleton.displayName = "LoadingSkeleton";

// // Error boundary component
// const StepErrorBoundary = memo(
//   ({ children, stepKey }: { children: React.ReactNode; stepKey: StepKey }) => {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <div className="space-y-4 text-center">
//           <div className="text-6xl text-red-500">⚠️</div>
//           <h3 className="text-lg font-semibold text-gray-900">
//             Failed to load step
//           </h3>
//           <p className="text-gray-600">
//             There was an error loading the {stepKey} step. Please try refreshing
//             the page.
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   },
// );

// StepErrorBoundary.displayName = "StepErrorBoundary";

// interface StepLoaderProps {
//   stepKey: StepKey;
//   mode: MODE;
// }

// export const StepLoader = memo(({ stepKey, mode }: StepLoaderProps) => {
//   const StepComponent = STEP_COMPONENTS[stepKey];

//   if (!StepComponent) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <div className="text-center">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Step not found
//           </h3>
//           <p className="text-gray-600">
//             The requested step "{stepKey}" could not be found.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Suspense fallback={<LoadingSkeleton />}>
//       <StepErrorBoundary stepKey={stepKey}>
//         <StepComponent mode={mode} />
//       </StepErrorBoundary>
//     </Suspense>
//   );
// });

// StepLoader.displayName = "StepLoader";

// export default StepLoader;

