import { z } from "zod";
import type { ShortCompany } from "@/types/company.type";
import type { FormFieldConfig } from "@/components/ui/form-input";

export const shortCompanyZodSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email"),
});

export const shortCompanyDefaultValues: ShortCompany = {
  companyName: "",
  email: "",
};

export const shortCompanyFormFields: FormFieldConfig<ShortCompany>[] = [
  {
    name: "companyName",
    label: "Company Name",
    type: "text",
    placeholder: "Enter name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email",
    note: "This field is used to send emails.",
  },
];
