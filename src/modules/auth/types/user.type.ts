import type { Permission } from "./permission.type.";

export interface LoggedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePic: { _id: string; url: string }[];
  roleLabel: string;
  roleValue: string;
  permissions: Permission[];
}
