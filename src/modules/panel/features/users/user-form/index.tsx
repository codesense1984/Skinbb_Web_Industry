import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";
import { PageContent } from "@/core/components/ui/structure";
import { PasswordStrength } from "@/core/components/ui/password-strength";
import { MODE } from "@/core/types";
import {
  apiCreateSellerMember,
  apiUpdateSellerMember,
} from "@/modules/panel/services/http/user.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import {
  userFormSchema,
  defaultValues,
  userFormFieldConfigs,
  type UserFormData,
} from "../../company/users/user-form/formSchema";
import { zodResolver } from "@hookform/resolvers/zod";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (id) {
    if (pathname.includes("/view/")) {
      mode = MODE.VIEW;
    } else if (pathname.includes("/edit/")) {
      mode = MODE.EDIT;
    } else {
      mode = MODE.EDIT; // fallback
    }
  }

  // Create dynamic schema based on mode
  const createFormSchema = () => {
    if (mode === MODE.EDIT) {
      // For edit mode, make password optional
      return userFormSchema.partial({ password: true });
    }
    return userFormSchema;
  };

  const form = useForm<UserFormData>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: defaultValues,
  });

  const { control, handleSubmit } = form;

  // Watch password field for strength validation
  const password = useWatch({
    control,
    name: "password",
  });

  // Fetch roles from API
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiGetRoles({ excludeRole: "mude" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format roles for select options
  const roleOptions =
    rolesResponse?.data?.roles?.map((role) => ({
      label: role.label,
      value: role._id,
    })) || [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      // For now, using a placeholder sellerId - in real app, get from context/auth
      const sellerId = "placeholder-seller-id";
      const { password, ...userData } = data;
      return apiCreateSellerMember(sellerId, {
        ...userData,
        password: password || "defaultPassword123!",
      });
    },
    onSuccess: () => {
      toast.success("User created successfully");
      navigate("/users");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create user");
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      const { password, ...userData } = data;
      return apiUpdateSellerMember(id!, userData);
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      navigate("/users");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update user");
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (mode === MODE.EDIT) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Form {...form}>
      <PageContent
        header={{
          title: mode === MODE.EDIT ? "Edit User" : "Create User",
          description:
            mode === MODE.EDIT
              ? "Update user information"
              : "Add a new user to your team",
        }}
      >
        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Card - Basic Information */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormFieldsRenderer<UserFormData>
                      control={control}
                      fieldConfigs={
                        userFormFieldConfigs.slice(0, 4).map((field) => ({
                          ...field,
                          mode,
                        })) as FormFieldConfig<UserFormData>[]
                      }
                      className="contents"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card - Account Settings */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Account Settings
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {userFormFieldConfigs.slice(4).map((field) => {
                      const fieldConfig = {
                        ...field,
                        ...(field.name === "password" && {
                          required: mode === MODE.ADD,
                          placeholder:
                            mode === MODE.ADD
                              ? "Enter password"
                              : "Leave blank to keep current password",
                        }),
                        ...(field.name === "roleId" && {
                          options: roleOptions,
                          placeholder: isLoadingRoles
                            ? "Loading roles..."
                            : "Select role",
                        }),
                      } as FormFieldConfig<UserFormData>;

                      return (
                        <div key={field.name}>
                          <FormFieldsRenderer<UserFormData>
                            control={control}
                            fieldConfigs={[fieldConfig]}
                            className="contents"
                          />
                          {/* Password Strength Indicator - only for password field */}
                          {field.name === "password" && password && (
                            <div className="mt-3">
                              <PasswordStrength password={password} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/users")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    {mode === MODE.EDIT ? "Updating..." : "Creating..."}
                  </div>
                ) : mode === MODE.EDIT ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageContent>
    </Form>
  );
};

export default UserForm;
