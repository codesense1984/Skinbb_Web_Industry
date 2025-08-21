// import { Button } from "@/components/ui/button";
// import { Form } from "@/components/ui/form";
// import {
//   FormFieldsRenderer,
//   type FormFieldConfig,
// } from "@/components/ui/form-input";
// import { TitledSection } from "@/components/ui/section";
// import {
//   companyBrandDefaultValues,
//   companyBrandSchema,
//   companyBrandZodSchema,
// } from "@/features/company/schema/companyBrandZodSchema ";
// import { useImagePreview } from "@/hooks/useImagePreview";
// import { MODE, type CompanyBrand } from "@/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { Step, useOnBoardContext } from "..";

// const BrandForm = () => {
//   const { mode, steps, goToNextStep, form: formValues } = useOnBoardContext();

//   const form = useForm<CompanyBrand>({
//     defaultValues: companyBrandDefaultValues(formValues[Step.address]),
//     resolver: zodResolver(companyBrandZodSchema),
//   });

//   const { control, setValue, watch, handleSubmit, reset } = form;

//   const profileData = watch("logo_files")?.[0];

//   const { element } = useImagePreview(profileData, {
//     clear: () => {
//       setValue("logo_files", []);
//       setValue("logo", undefined);
//     },
//   });

//   const onSubmit = (data: CompanyBrand) => {
//     console.log("Submitted", data);
//     toast.success(`${steps[0].stepTitle} submitted successfully!`);
//     goToNextStep();
//   };

//   const action = (
//     <div className="flex justify-end gap-4">
//       <Button variant="outlined" type="reset" onClick={() => reset()}>
//         Reset
//       </Button>
//       <Button color="primary" type="submit">
//         Save & Next
//       </Button>
//     </div>
//   );

//   return (
//     <Form {...form}>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <TitledSection
//           className="space-y-8"
//           title="Add brand details"
//           titleProps={{ className: "h5" }}
//           actions={mode !== MODE.VIEW && action}
//         >
//           <div className="flex items-center gap-4">
//             {element}
//             <FormFieldsRenderer<CompanyBrand>
//               className="flex"
//               control={control}
//               fieldConfigs={
//                 companyBrandSchema.uploadImage({
//                   mode,
//                 }) as FormFieldConfig<CompanyBrand>[]
//               }
//             />
//           </div>

//           <FormFieldsRenderer<CompanyBrand>
//             control={control}
//             fieldConfigs={
//               companyBrandSchema.brandInfo({
//                 mode,
//               }) as FormFieldConfig<CompanyBrand>[]
//             }
//           />

//           {mode !== MODE.VIEW && action}
//         </TitledSection>
//       </form>
//     </Form>
//   );
// };

// export default BrandForm;
