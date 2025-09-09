import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { STATUS_MAP } from "@/core/config/status";
import {
  createEmailValidator,
  createPasswordValidator,
  createPhoneValidator,
  createRequiredString,
} from "@/core/utils/validation.utils";
import { z } from "zod";

export const userFormSchema = z.object({
  firstName: createRequiredString("First name"),
  lastName: createRequiredString("Last name"),
  email: createEmailValidator("Email"),
  phoneNumber: createPhoneValidator("Phone number"),
  password: createPasswordValidator().optional(),
  roleId: createRequiredString("Role"),
  brandIds: z.array(z.string()).optional(),
  addressIds: z.array(z.string()).optional(),
  allowedBrands: z.array(z.string()).optional(),
  allowedAddresses: z.array(z.string()).optional(),
  extraPermissions: z.array(z.string()).optional(),
  revokedPermissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const defaultValues: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  roleId: "",
  brandIds: [],
  addressIds: [],
  allowedBrands: [],
  allowedAddresses: [],
  extraPermissions: [],
  revokedPermissions: [],
  active: true,
};

export const userFormFieldConfigs: FormFieldConfig<UserFormData>[] = [
  {
    name: "firstName" as const,
    label: "First Name",
    type: "text",
    placeholder: "Enter first name",
  },
  {
    name: "lastName" as const,
    label: "Last Name",
    type: "text",
    placeholder: "Enter last name",
  },
  {
    name: "email" as const,
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
  },
  {
    name: "phoneNumber" as const,
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
  },

  {
    name: "roleId" as const,
    label: "Role",
    type: "select",
    placeholder: "Select role",
    options: [], // Will be populated from API
  },
  {
    name: "active" as const,
    label: "User account status",
    type: INPUT_TYPES.SELECT,
    options: Object.values(STATUS_MAP.company_user).map((status) => ({
      value: status.value,
      label: status.label,
    })),
  },
  {
    name: "password" as const,
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    className: "col-span-2",
  },
];
