import { z } from "zod";
import type { FormFieldConfig } from "@/core/components/ui/form-input";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional(),
  role: z.string().optional(),
  profilePic: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export const defaultValues: CustomerFormData = {
  name: "",
  email: "",
  phoneNumber: "",
  role: "",
  profilePic: "",
};

export const customerFormFieldConfigs: FormFieldConfig<CustomerFormData>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "Enter customer name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    required: false,
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
    required: false,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    placeholder: "Select role",
    required: false,
    options: [], // Will be populated dynamically from API
  },
  {
    name: "profilePic",
    label: "Profile Picture URL",
    type: "text",
    placeholder: "Enter profile picture URL",
    required: false,
  },
];
