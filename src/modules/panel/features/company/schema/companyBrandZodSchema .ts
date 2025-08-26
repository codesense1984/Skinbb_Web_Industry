// schema/companyBrand.schema.ts
import type { FormFieldConfig } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import { type CompanyBrand } from "@/modules/panel/types";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export const companyBrandZodSchema = z.object({
  logo_files: z.any().optional(),
  brandName: z.string().min(1, "Brand Name is required"),
  category: z.string().min(1, "Category is required"),
  website: z.string().optional(),
  description: z.string().optional(),
  letterOfAuthorization: z.any().optional(),
});

export const companyBrandDefaultValues = (data?: Partial<CompanyBrand>) => ({
  logo_files: data?.logo_files ?? [],
  brandName: data?.brandName ?? "",
  category: data?.category ?? "",
  website: data?.website ?? "",
  description: data?.description ?? "",
  letterOfAuthorization: data?.letterOfAuthorization ?? [],
});

export const companyBrandSchema: Record<
  string,
  ({ mode }: { mode?: MODE }) => FormFieldConfig<CompanyBrand>[]
> = {
  uploadImage: ({ mode }) => [
    {
      name: "logo",
      label: "Change Logo",
      type: "file",
      placeholder: "Upload brand logo",
      disabled: mode === MODE.VIEW,
      inputProps: {
        accept: ACCEPTED_IMAGE_TYPES.join(", "),
      },
    },
  ],

  brandInfo: ({ mode }) => [
    {
      name: "brandName",
      label: "Brand Name",
      type: "text",
      placeholder: "Enter brand name",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select category",
      disabled: mode === MODE.VIEW,
      options: [
        { label: "Skincare", value: "skincare" },
        { label: "Haircare", value: "haircare" },
        { label: "Wellness", value: "wellness" },
      ],
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "Enter website",
      disabled: mode === MODE.VIEW,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
      disabled: mode === MODE.VIEW,
      className: "md:col-span-3",
    },
  ],

  documents: ({ mode }) => [
    {
      name: "letterOfAuthorization",
      label: "Letter of Authorization",
      type: "file",
      placeholder: "Upload letter",
      disabled: mode === MODE.VIEW,
      inputProps: {
        accept: ".pdf,.doc,.docx,image/*",
      },
    },
  ],

  //   addressTable: ({ mode }) => [
  //     {
  //       name: "addresses", // assuming addresses is handled separately (table or modal)
  //       label: "Address Table",
  //       type: "custom", // special renderer
  //       render: "addressTable", // custom form renderer key
  //       disabled: mode === MODE.VIEW,
  //     },
  //   ],
};
