import { z } from "zod";

export const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must contain at least 1 number")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least 1 special character")
    .optional(),
  roleId: z.string().min(1, "Role is required"),
  brandIds: z.array(z.string()).optional(),
  addressIds: z.array(z.string()).optional(),
  allowedBrands: z.array(z.string()).optional(),
  allowedAddresses: z.array(z.string()).optional(),
  extraPermissions: z.array(z.string()).optional(),
  revokedPermissions: z.array(z.string()).optional(),
  active: z.boolean(),
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

export const userFormFieldConfigs = [
  {
    name: "firstName" as const,
    label: "First Name",
    type: "text",
    placeholder: "Enter first name",
    required: true,
  },
  {
    name: "lastName" as const,
    label: "Last Name", 
    type: "text",
    placeholder: "Enter last name",
    required: true,
  },
  {
    name: "email" as const,
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    required: true,
  },
  {
    name: "phoneNumber" as const,
    label: "Phone Number",
    type: "text",
    placeholder: "Enter phone number",
    required: true,
  },
  {
    name: "password" as const,
    label: "Password",
    type: "password",
    placeholder: "Enter password",
    required: true,
  },
  {
    name: "roleId" as const,
    label: "Role",
    type: "select",
    placeholder: "Select role",
    required: true,
    options: [], // Will be populated from API
  },
  {
    name: "active" as const,
    label: "Status",
    type: "switch",
    description: "User account status",
  },
];
