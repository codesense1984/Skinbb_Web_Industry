// import { Button } from "@/core/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/core/components/ui/card";
// import { FormFieldsRenderer } from "@/core/components/ui/form-input";
// import { SURVEY } from "@/core/config/constants";
// import { useImagePreview } from "@/core/hooks/useImagePreview";
// import { MODE } from "@/core/types";
// import { handleFormErrors } from "@/core/utils/react-hook-form.utils";
// import type { CompanyLocationBrand } from "@/modules/panel/types/brand.type";
// import { PlusIcon } from "@heroicons/react/24/outline";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect, useState } from "react";
// import {
//   FormProvider,
//   useFieldArray,
//   useForm,
//   useWatch,
// } from "react-hook-form";
// import {
//   brandSchema,
//   brandFormSchema,
//   type BrandFormData,
// } from "./brand.schema";

// // Default values function with parameters
// export const getDefaultValues = (
//   brandData?: CompanyLocationBrand | null,
// ): BrandFormData => {
//   return {
//     _id: brandData?._id || "",
//     name: brandData?.name || "",
//     aboutTheBrand: brandData?.aboutTheBrand || "",
//     websiteUrl: brandData?.websiteUrl || "",
//     totalSKU: brandData?.totalSKU ? String(brandData.totalSKU) : "0",
//     // averageSellingPrice: brandData?.averageSellingPrice
//     //   ? String(brandData.averageSellingPrice)
//     //   : "0",
//     marketingBudget: brandData?.marketingBudget
//       ? String(brandData.marketingBudget)
//       : "",
//     instagramUrl: brandData?.instagramUrl || "",
//     facebookUrl: brandData?.facebookUrl || "",
//     youtubeUrl: brandData?.youtubeUrl || "",
//     brandType: brandData?.brandType || [],
//     sellingOn: brandData?.sellingOn || [],
//     authorizationLetter: brandData?.authorizationLetter || "",
//     logo: brandData?.logoImage || "",
//     logo_files: undefined,
//     // isActive: brandData?.isActive ? "true" : "false",
//   };
// };

// interface BrandFormProps {
//   mode: MODE;
//   defaultValues?: BrandFormData;
//   onSubmit: (data: BrandFormData) => void;
//   submitting?: boolean;
// }

// const BrandForm = ({
//   mode,
//   defaultValues,
//   onSubmit,
//   submitting = false,
// }: BrandFormProps) => {
//   const form = useForm<BrandFormData>({
//     resolver: zodResolver(brandFormSchema),
//     defaultValues: defaultValues || getDefaultValues(),
//     mode: "onChange", // Validate on change for better UX
//     reValidateMode: "onChange",
//   });

//   const { handleSubmit, control, setValue } = form;

//   // Field array for selling platforms
//   const {
//     fields: sellingPlatformFields,
//     append: addSellingPlatform,
//     remove: removeSellingPlatform,
//   } = useFieldArray({
//     control,
//     name: "sellingOn",
//   });

//   // Reset form when defaultValues change
//   useEffect(() => {
//     if (defaultValues) {
//       form.reset(defaultValues);
//     }
//   }, [defaultValues, form]);

//   const [logoFiles, setLogoFiles] = useState<
//     FileList | File[] | null | undefined
//   >(undefined);

//   // Watch for logo_files changes using form.watch subscription for better reactivity
//   useEffect(() => {
//     // Initialize with current value
//     const currentFiles = form.getValues("logo_files");
//     setLogoFiles(currentFiles);

//     const subscription = form.watch((value, { name }) => {
//       // Update when logo_files changes or on any change (to catch all updates)
//       if (name === "logo_files" || name === undefined) {
//         const files = form.getValues("logo_files");
//         setLogoFiles(files);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [form]);

//   // Extract File from FileList or array
//   const imageData = logoFiles
//     ? logoFiles instanceof FileList
//       ? logoFiles[0] || null
//       : Array.isArray(logoFiles) && logoFiles.length > 0
//         ? logoFiles[0] || null
//         : logoFiles instanceof File
//           ? logoFiles
//           : null
//     : null;

//   const imageUrl = useWatch({
//     control,
//     name: "logo",
//   });

//   const { element } = useImagePreview(imageData, imageUrl, {
//     clear: () => {
//       setValue("logo_files", undefined);
//       setValue("logo", "");
//     },
//   });

//   const handleFormSubmit = (data: BrandFormData) => {
//     onSubmit(data);
//   };

//   // Get available platform options (exclude already selected ones, except "Other")
//   const getAvailablePlatformOptions = (currentIndex: number) => {
//     const selectedPlatforms = sellingPlatformFields
//       .map((platform, index) =>
//         index !== currentIndex ? platform?.platform : null,
//       )
//       .filter(Boolean);

//     return Object.values(SURVEY.SELLING_PLATFORMS).filter((option) => {
//       // "Other" can be selected multiple times
//       if (option.value === "other") {
//         return true;
//       }
//       // All other platforms can only be selected once
//       return !selectedPlatforms.includes(option.value);
//     });
//   };

//   const handleAddSellingPlatform = () => {
//     addSellingPlatform({ platform: "", url: "" });
//   };

//   const handleResetForm = () => {
//     form.reset(getDefaultValues());
//   };

//   const submitAction = mode !== MODE.VIEW && (
//     <>
//       <Button
//         type="button"
//         variant="outlined"
//         onClick={handleResetForm}
//         className="px-6 py-2"
//       >
//         Reset
//       </Button>
//       <Button
//         type="submit"
//         disabled={submitting}
//         color="secondary"
//         className="px-6 py-2"
//       >
//         {submitting ? "Saving..." : "Save"}
//       </Button>
//     </>
//   );

//   return (
//     <div className="w-full">
//       <div className="">
//         <FormProvider {...form}>
//           <form
//             onSubmit={handleSubmit(handleFormSubmit, handleFormErrors)}
//             className="space-y-8"
//           >
//             <Card>
//               <CardHeader className="border-b">
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6 pt-6">
//                 <div className="flex items-center gap-4">
//                   {element}
//                   <FormFieldsRenderer<BrandFormData>
//                     className="w-full grid-cols-1 md:grid-cols-2"
//                     control={control}
//                     fieldConfigs={brandSchema.uploadbrandImage({
//                       mode,
//                     })}
//                   />
//                 </div>
//                 <FormFieldsRenderer<BrandFormData>
//                   control={control}
//                   fieldConfigs={brandSchema.basic_information({ mode })}
//                   className="lg:grid-cols-4"
//                 />
//               </CardContent>
//             </Card>

//             {/* Selling Platforms - Full Width */}
//             <Card>
//               <CardHeader className="border-b">
//                 <div className="flex items-center justify-between">
//                   <CardTitle>Selling Platforms</CardTitle>
//                   {mode !== MODE.VIEW && (
//                     <Button
//                       className="font-normal"
//                       startIcon={<PlusIcon className="size-4" />}
//                       type="button"
//                       onClick={handleAddSellingPlatform}
//                       variant="outlined"
//                       size="sm"
//                     >
//                       Add Platform
//                     </Button>
//                   )}
//                 </div>
//               </CardHeader>
//               <CardContent className="pt-2">
//                 <div className="space-y-4">
//                   {sellingPlatformFields.map((field, index) => (
//                     <div
//                       key={field.id}
//                       className="flex items-end gap-4 rounded-lg border border-gray-200 p-4"
//                     >
//                       <div className="flex-1">
//                         <FormFieldsRenderer<BrandFormData>
//                           control={control}
//                           fieldConfigs={brandSchema.selling_platforms({
//                             mode,
//                             index,
//                             availableOptions:
//                               getAvailablePlatformOptions(index),
//                           })}
//                           className="grid grid-cols-1 gap-4 md:grid-cols-2"
//                         />
//                       </div>
//                       {mode !== MODE.VIEW && (
//                         <Button
//                           type="button"
//                           onClick={() => removeSellingPlatform(index)}
//                           variant="outlined"
//                           size="sm"
//                           className="text-red-600 hover:bg-red-50 hover:text-red-700"
//                         >
//                           Remove
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                   {sellingPlatformFields.length === 0 && (
//                     <div className="py-8 text-center text-gray-500">
//                       <p>No selling platforms added yet.</p>
//                       {mode !== MODE.VIEW && (
//                         <p className="text-sm">
//                           Click &quot;Add Platform&quot; to get started.
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex justify-end space-x-4">{submitAction}</div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default BrandForm;
