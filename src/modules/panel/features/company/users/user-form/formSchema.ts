import {
  INPUT_TYPES,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { STATUS_MAP } from "@/core/config/status";
import { MODE } from "@/core/types";
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
  status: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const defaultValues = () => ({
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
  status: "",
});

export const userFormFieldConfigs: ({
  mode,
}: {
  mode: MODE;
}) => FormFieldConfig<UserFormData>[] = ({ mode }) => [
  {
    name: "firstName" as const,
    label: "First Name",
    type: "text",
    placeholder: "Enter first name",
    disabled: mode === MODE.VIEW,
  },
  {
    name: "lastName" as const,
    label: "Last Name",
    type: "text",
    placeholder: "Enter last name",
    disabled: mode === MODE.VIEW,
  },
  {
    name: "email" as const,
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    disabled: mode === MODE.VIEW,
  },
  {
    name: "phoneNumber" as const,
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
    disabled: mode === MODE.VIEW,
  },

  {
    name: "roleId" as const,
    label: "Role",
    type: "select",
    placeholder: "Select role",
    options: [], // Will be populated from API
    disabled: mode === MODE.VIEW,
  },
  {
    name: "status" as const,
    label: "User account status",
    type: INPUT_TYPES.SELECT,
    placeholder: "Select account status",
    options: Object.values(STATUS_MAP.company_user).map((status) => ({
      value: status.value,
      label: status.label,
    })),
    disabled: mode === MODE.VIEW,
  },
  {
    name: "password" as const,
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    className: "col-span-2",
    disabled: mode === MODE.VIEW,
  },
];
