// import {
//   Stepper,
//   StepperIndicator,
//   StepperItem,
//   StepperSeparator,
//   StepperTitle,
//   StepperTrigger,
// } from "@/components/ui/stepper";
// import { HorizontalLogo } from "@/config/svg";
// import { MODE, type Company, type CompanyBrand } from "@/types";
// import { cn } from "@/utils";
// import {
//   createContext,
//   useCallback,
//   useContext,
//   useMemo,
//   useState,
//   type Dispatch,
//   type SetStateAction,
// } from "react";
// import { useSearchParams } from "react-router";
// import CompanyDetails from "./CompanyDetails";

// export enum Step {
//   company_details = "company_details",
//   brand_details = "brand_details",
//   users_details = "users_details",
//   review = "review",
// }

// interface StepItem {
//   step: number;
//   title: string;
//   value: string;
// }

// type OnBoardFormData = {
//   [Step.company_details]?: Company;
//   [Step.brand_details]?: CompanyBrand;
//   [Step.users_details]?: unknown;
// };

// const steps: StepItem[] = [
//   {
//     step: 1,
//     title: "Company details",
//     value: Step.company_details,
//   },
//   {
//     step: 2,
//     title: "Brand details",
//     value: Step.brand_details,
//   },
//   {
//     step: 3,
//     title: "Users details",
//     value: Step.users_details,
//   },
//   {
//     step: 4,
//     title: "Review",
//     value: Step.review,
//   },
// ];

// type OnBoardContextType = {
//   currentTab: string;
//   setCurrentTab: (step: number) => void;
//   steps: StepItem[];
//   currentItem: StepItem | undefined;
//   mode: MODE;
//   goToNextStep: () => void;
//   goToPreviousStep: () => void;
//   setForm: Dispatch<SetStateAction<OnBoardFormData>>;
//   form: OnBoardFormData;
// };

// const OnBoardContext = createContext<OnBoardContextType | undefined>(undefined);

// export const useOnBoardContext = () => {
//   const context = useContext(OnBoardContext);
//   if (!context) {
//     throw new Error("useOnBoardContext must be used within OnBoardProvider");
//   }
//   return context;
// };

// const OnBoardForm = ({ mode = MODE.ADD }: { mode?: MODE }) => {
//   const [searchParam, setSearchParam] = useSearchParams();

//   const [form, setForm] = useState<OnBoardFormData>({
//     [Step.company_details]: undefined,
//     // [Step.users_details]: undefined,
//     // [Step.brand_details]: undefined,
//   });

//   const currentTab = searchParam.get("currentTab") ?? steps[0].value;
//   const currentItem = steps.find((item) => item.value === currentTab);

//   const setCurrentTab = useCallback(
//     (step: number) => {
//       const data = steps.find((item) => item.step === step);
//       setSearchParam({ currentTab: data?.value ?? "" });
//     },
//     [setSearchParam],
//   );

//   const goToNextStep = useCallback(() => {
//     if (currentItem && currentItem.step < steps.length) {
//       setCurrentTab(currentItem.step + 1);
//     }
//   }, [currentItem, setCurrentTab]);

//   const goToPreviousStep = useCallback(() => {
//     if (currentItem && currentItem.step > 1) {
//       setCurrentTab(currentItem.step - 1);
//     }
//   }, [currentItem, setCurrentTab]);

//   const currentComponent = useMemo(() => {
//     switch (currentTab) {
//       case Step.company_details:
//         return <CompanyDetails />;
//       // case Step.brand_details:
//       //   return <Brands />;
//       default:
//         return <CompanyDetails />;
//     }
//   }, [currentTab]);

//   const contextValue = useMemo(
//     () => ({
//       currentTab,
//       currentItem,
//       steps,
//       mode,
//       form,
//       setForm,
//       setCurrentTab,
//       goToNextStep,
//       goToPreviousStep,
//     }),
//     [
//       form,
//       currentTab,
//       currentItem,
//       mode,
//       setCurrentTab,
//       goToNextStep,
//       goToPreviousStep,
//     ],
//   );
//   return (
//     <OnBoardContext.Provider value={contextValue}>
//       <div className="bg-card flex h-full w-full flex-col gap-4 rounded-md p-4 shadow-md md:flex-row md:p-6">
//         <div className="h-full min-w-40 space-y-7 text-center md:sticky md:top-5">
//           <HorizontalLogo />

//           <hr />
//           <Stepper
//             defaultValue={currentItem?.step}
//             orientation={"vertical"}
//             onValueChange={setCurrentTab}
//           >
//             {steps.map(({ step, title }) => (
//               <StepperItem
//                 key={step}
//                 step={step}
//                 className="relative items-start not-last:flex-1"
//               >
//                 <StepperTrigger className="flex-row items-start rounded pb-8">
//                   <StepperIndicator />
//                   <div className="text-left">
//                     <StepperTitle className="data-[state=active]:text-foreground data-[state=completed]:text-foreground text-muted-foreground text-sm font-normal data-[state=active]:font-medium md:text-base">
//                       {title}
//                     </StepperTitle>
//                   </div>
//                 </StepperTrigger>
//                 {step < steps.length && (
//                   <StepperSeparator
//                     className={cn(
//                       "mt-3.5 md:m-0",
//                       "absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]",
//                     )}
//                   />
//                 )}
//               </StepperItem>
//             ))}
//           </Stepper>
//         </div>
//         <div className="w-full flex-1 border-l pl-4 md:pl-6">
//           {currentComponent}
//         </div>
//       </div>
//     </OnBoardContext.Provider>
//   );
// };

// export default OnBoardForm;
