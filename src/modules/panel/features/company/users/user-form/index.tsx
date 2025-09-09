import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Form } from "@/core/components/ui/form";
import { FormInput } from "@/core/components/ui/form-input";
import { Input } from "@/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { PageContent } from "@/core/components/ui/structure";
import { MODE } from "@/core/types/base.type";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import {
  userFormFieldConfigs,
  userFormSchema,
  type UserFormData,
} from "@/modules/panel/features/users/user-form/formSchema";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import {
  apiGetCompanyDetailById,
  apiGetCompanyUsers,
} from "@/modules/panel/services/http/company.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import {
  apiCreateSellerMember,
  apiUpdateSellerMember,
} from "@/modules/panel/services/http/user.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const CompanyUserForm = () => {
  const { id: companyId, userId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (userId) {
    if (pathname.includes("/view") || pathname.endsWith("/view")) {
      mode = MODE.VIEW;
    } else if (pathname.includes("/edit") || pathname.endsWith("/edit")) {
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
    } else if (mode === MODE.ADD) {
      // For add mode, make active optional (comes from backend)
      return userFormSchema.partial({ active: true });
    }
    return userFormSchema;
  };

  const form = useForm<UserFormData>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roleId: "",
      allowedBrands: [],
      allowedAddresses: [],
      active: true,
    },
  });

  const { handleSubmit, watch, setValue } = form;

  const {
    data: companyData,
    isLoading: isLoadingCompany,
    error: companyError,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.DETAIL(companyId!)],
    queryFn: async () => {
      return await apiGetCompanyDetailById(companyId!);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user data for edit/view modes using the same API as the list
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.USERS(companyId!)],
    queryFn: async () => {
      return await apiGetCompanyUsers(companyId!);
      // console.log("Fetching user data for:", { companyId, userId, mode });
      // if (!companyId || !userId) return null;

      // try {
      //   // Use the company users API (revert back to working API)
      //   console.log("=== USER DATA FETCHING ===");
      //   console.log("Calling apiGetCompanyUsers with companyId:", companyId);
      //   console.log("API endpoint will be: /company/" + companyId + "/users");
      //   const response = await apiGetCompanyUsers(companyId, {
      //     createdAt: true,
      //   } as any);
      //   console.log("Company users API response:", response);
      //   console.log("API response data items:", response?.data?.items);
      //   if (response?.data?.items && response.data.items.length > 0) {
      //     console.log("First user in response:", response.data.items[0]);
      //     console.log("First user keys:", Object.keys(response.data.items[0]));
      //     console.log(
      //       "First user full structure:",
      //       JSON.stringify(response.data.items[0], null, 2),
      //     );
      //   }
      //   console.log("=== USER DATA FETCHING SUCCESS ===");

      //   if (response?.data?.items) {
      //     // Find the specific user by userId
      //     const user = response.data.items.find(
      //       (item: any) =>
      //         item.userId === userId ||
      //         item.user?._id === userId ||
      //         item._id === userId,
      //     );

      //     console.log("Found user:", user);
      //     if (user) {
      //       console.log("User allowedBrands:", (user as any).allowedBrands);
      //       console.log(
      //         "User allowedAddresses:",
      //         (user as any).allowedAddresses,
      //       );
      //       console.log("User keys:", Object.keys(user));
      //       console.log("User full structure:", JSON.stringify(user, null, 2));

      //       // Transform the data to match the expected format
      //       const transformedData = {
      //         data: {
      //           _id:
      //             (user as any).userId ||
      //             (user as any).user?._id ||
      //             (user as any)._id,
      //           firstName:
      //             (user as any).user?.firstName ||
      //             (user as any).firstName ||
      //             "",
      //           lastName:
      //             (user as any).user?.lastName || (user as any).lastName || "",
      //           email: (user as any).user?.email || (user as any).email || "",
      //           phoneNumber:
      //             (user as any).user?.phoneNumber ||
      //             (user as any).phoneNumber ||
      //             "",
      //           roleId: (user as any).roleValue || (user as any).roleId || "",
      //           active:
      //             (user as any).active !== undefined
      //               ? (user as any).active
      //               : true,
      //           createdAt: (user as any).createdAt || "",
      //           updatedAt: (user as any).updatedAt || "",
      //           // Map from API response structure to form structure
      //           allowedBrands: (() => {
      //             const brands =
      //               (user as any).allowedBrands?.map(
      //                 (brand: any) => brand._id,
      //               ) || [];
      //             console.log("Mapped allowedBrands:", brands);
      //             return brands;
      //           })(),
      //           allowedAddresses: (() => {
      //             const addresses =
      //               (user as any).allowedAddresses?.map(
      //                 (address: any) => address._id,
      //               ) || [];
      //             console.log("Mapped allowedAddresses:", addresses);
      //             return addresses;
      //           })(),
      //           originalData: user,
      //         },
      //       };
      //       console.log("Transformed user data:", transformedData);
      //       return transformedData;
      //     }
      //   }

      //   console.log("No user found");
      //   return null;
      // } catch (error) {
      //   console.error("=== USER DATA FETCHING ERROR ===");
      //   console.error("Error fetching user data:", error);
      //   console.error("Error details:", {
      //     message: (error as any)?.message,
      //     status: (error as any)?.response?.status,
      //     data: (error as any)?.response?.data,
      //     companyId: companyId,
      //     userId: userId,
      //   });
      //   console.error("=== USER DATA FETCHING ERROR END ===");
      //   return null;
      // }
    },
    enabled:
      companyData &&
      !!companyId &&
      !!userId &&
      (mode === MODE.EDIT || mode === MODE.VIEW),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch roles from API
  const {
    data: rolesResponse,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => {
      console.log("=== ROLES API CALL ===");
      console.log("Calling apiGetRoles");
      return apiGetRoles({ excludeRole: "mude" });
    },
    enabled: userData && !!companyId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format roles for select options and create mappings (memoized to prevent infinite loops)
  const { roleOptions, roleValueToIdMap, roleIdToValueMap } = useMemo(() => {
    const options =
      rolesResponse?.data?.roles?.map((role: any) => ({
        label: role.label,
        value: role._id,
        roleValue:
          role.roleValue || role.label?.toLowerCase().replace(/\s+/g, "-"), // Create roleValue mapping
      })) || [];

    // Create a mapping from roleValue to roleId for form population
    const valueToIdMap = options.reduce(
      (acc, role) => {
        if (role.roleValue) {
          acc[role.roleValue] = role.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    // Create a mapping from roleId to roleValue for form submission
    const idToValueMap = options.reduce(
      (acc, role) => {
        acc[role.value] =
          role.roleValue || role.label?.toLowerCase().replace(/\s+/g, "-");
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      roleOptions: options,
      roleValueToIdMap: valueToIdMap,
      roleIdToValueMap: idToValueMap,
    };
  }, [rolesResponse?.data?.roles]);

  // Get brands and addresses from company data
  // Handle different possible response structures and null cases
  const company =
    (companyData as any)?.data?.company ||
    (companyData as any)?.company ||
    (companyData as any)?.data;
  const companyAddresses = company?.addresses || [];

  const brands = useMemo(
    () =>
      companyAddresses.flatMap(
        (address: any) =>
          address.brands?.map((brand: any) => ({
            id: brand._id,
            name: brand.name,
            addressId: address.addressId,
            addressName: `${address.city}, ${address.state}`,
          })) || [],
      ) || [],
    [companyAddresses],
  );

  const addresses = useMemo(
    () =>
      companyAddresses.map((address: any) => ({
        id: address.addressId,
        name: `${address.addressLine1}, ${address.city}, ${address.state}`,
        type: address.addressType,
      })) || [],
    [companyAddresses],
  );

  // Populate form with user data for edit/view modes
  // Wait for both user data AND company data to be loaded for proper checkbox state
  // useEffect(() => {
  //   if (userData?.data && (mode === MODE.EDIT || mode === MODE.VIEW)) {
  //     const user = userData.data;

  //     // Convert roleValue to roleId for form population
  //     const roleId = user.roleId
  //       ? roleValueToIdMap[user.roleId] || user.roleId
  //       : "";

  //     // Check if user's allowed brands/addresses match available ones
  //     if (user.allowedBrands && brands.length > 0) {
  //       user.allowedBrands.forEach((allowedBrandId: any) => {
  //         const matchingBrand = brands.find(
  //           (b: any) => b.id === allowedBrandId,
  //         );
  //       });
  //     }

  //     if (user.allowedAddresses && addresses.length > 0) {
  //       user.allowedAddresses.forEach((allowedAddressId: any) => {
  //         const matchingAddress = addresses.find(
  //           (a: any) => a.id === allowedAddressId,
  //         );
  //       });
  //     }

  //     const formData = {
  //       firstName: user.firstName || "",
  //       lastName: user.lastName || "",
  //       email: user.email || "",
  //       phoneNumber: user.phoneNumber || "",
  //       password: "", // Don't populate password for security
  //       roleId: roleId, // Convert roleValue to roleId for form
  //       allowedBrands: user.allowedBrands || [],
  //       allowedAddresses: user.allowedAddresses || [],
  //       active: user.active ?? true,
  //     };

  //     console.log("Form data being set:", formData);
  //     console.log("Form allowedBrands:", formData.allowedBrands);
  //     console.log("Form allowedAddresses:", formData.allowedAddresses);

  //     form.reset(formData);

  //     // Also log the form values after reset
  //     setTimeout(() => {
  //       console.log("Form values after reset:", form.getValues());
  //       console.log(
  //         "Form allowedBrands after reset:",
  //         form.getValues("allowedBrands"),
  //       );
  //       console.log(
  //         "Form allowedAddresses after reset:",
  //         form.getValues("allowedAddresses"),
  //       );
  //       console.log("Form watch allowedBrands:", watch("allowedBrands"));
  //       console.log("Form watch allowedAddresses:", watch("allowedAddresses"));
  //     }, 100);
  //   }
  // }, [userData, mode, form, roleValueToIdMap, brands, addresses]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      const { password, active, ...userData } = data;
      console.log("Creating user with data:", { companyId, userData });

      // Convert roleId to roleValue for API submission
      const roleValue = userData.roleId
        ? roleIdToValueMap[userData.roleId] || userData.roleId
        : "";

      // Map form fields to API fields according to the API documentation
      return apiCreateSellerMember(companyId!, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        roleId: roleValue,
        brandIds: userData.allowedBrands || [],
        addressIds: userData.allowedAddresses || [],
        extraPermissions: userData.extraPermissions || [],
        revokedPermissions: userData.revokedPermissions || [],
        password: password || "defaultPassword123!",
        // Don't send active field for add mode - comes from backend
      });
    },
    onSuccess: (response) => {
      console.log("User created successfully:", response);
      toast.success("User created successfully");
      // Navigate back to user list and force refresh
      navigate(PANEL_ROUTES.COMPANY.USERS(companyId));
      // Force a page refresh to ensure the new user appears
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      console.error("User creation failed:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create user";
      toast.error(errorMessage);

      // If the error is about email/phone already existing, provide more specific guidance
      if (errorMessage.includes("already exists")) {
        toast.error(
          "A user with this email or phone number already exists. Please use different credentials or check the user list.",
        );
      }
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      const { password, roleId, ...userData } = data;
      console.log("Updating user with data:", { userId, userData });

      // Convert roleId back to roleValue for API submission
      const roleValue = roleId ? roleIdToValueMap[roleId] || roleId : "";

      // Map form fields to API fields according to the API documentation
      return apiUpdateSellerMember(userId!, {
        roleId: roleValue,
        brandIds: userData.allowedBrands || [],
        addressIds: userData.allowedAddresses || [],
        extraPermissions: userData.extraPermissions || [],
        revokedPermissions: userData.revokedPermissions || [],
        active: userData.active ?? true,
      });
    },
    onSuccess: (response) => {
      console.log("User updated successfully:", response);
      toast.success("User updated successfully!");
      navigate(PANEL_ROUTES.COMPANY.USERS(companyId!));
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    },
  });

  const onSubmit = (data: UserFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Mode:", mode);
    if (mode === MODE.ADD) {
      console.log("Creating new user...");
      createUserMutation.mutate(data);
    } else if (mode === MODE.EDIT) {
      console.log("Updating user...");
      updateUserMutation.mutate(data);
    } else {
      console.log("View mode - no action needed");
    }
  };

  const pageTitle =
    mode === MODE.ADD
      ? `Add User`
      : mode === MODE.EDIT
        ? `Edit User`
        : `View User`;

  return (
    <PageContent
      header={{
        title: pageTitle,
      }}
      error={companyError ?? userError}
    >
      <div className="w-full">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>User Information</CardTitle>
            {/* Show subtle warning if company data is not available in edit/view modes */}
            {(mode === MODE.EDIT || mode === MODE.VIEW) &&
              !companyData &&
              companyError && (
                <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2">
                  <p className="text-xs text-blue-700">
                    ℹ️ Company details unavailable - some permissions may not be
                    loaded
                  </p>
                </div>
              )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {userFormFieldConfigs.map((field) => {
                        return <FormInput {...field} control={form.control} />;
                      })}
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                        <label className="text-sm font-medium">
                          First Name *
                        </label>
                        <Input
                          {...form.register("firstName")}
                          placeholder="Enter first name"
                          disabled={mode === MODE.VIEW}
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-sm text-red-500">
                            {form.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Last Name *
                        </label>
                        <Input
                          {...form.register("lastName")}
                          placeholder="Enter last name"
                          disabled={mode === MODE.VIEW}
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-sm text-red-500">
                            {form.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        {...form.register("email")}
                        type="email"
                        placeholder="Enter email address"
                        disabled={mode === MODE.VIEW}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Phone Number *
                      </label>
                      <Input
                        {...form.register("phoneNumber")}
                        placeholder="Enter phone number"
                        disabled={mode === MODE.VIEW}
                      />
                      {form.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    {mode === MODE.ADD && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Password *
                        </label>
                        <Input
                          {...form.register("password")}
                          type="password"
                          placeholder="Enter password"
                        />
                        {form.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {form.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role *</label>
                      <Select
                        value={watch("roleId")}
                        onValueChange={(value) => setValue("roleId", value)}
                        disabled={mode === MODE.VIEW || isLoadingRoles}
                        options={roleOptions}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.roleId && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.roleId.message}
                        </p>
                      )}
                    </div> */}

                  {/* Right Column - Permissions */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Permissions
                    </h3>

                    {/* Hidden inputs to register the fields */}
                    <input type="hidden" {...form.register("allowedBrands")} />
                    <input
                      type="hidden"
                      {...form.register("allowedAddresses")}
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Allowed Brands
                      </label>
                      <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                        {brands.map((brand: any) => {
                          const currentAllowedBrands =
                            watch("allowedBrands") || [];
                          const isChecked = currentAllowedBrands.includes(
                            brand.id,
                          );
                          return (
                            <div
                              key={brand.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`brand-${brand.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentBrands =
                                    watch("allowedBrands") || [];
                                  if (checked) {
                                    setValue("allowedBrands", [
                                      ...currentBrands,
                                      brand.id,
                                    ]);
                                  } else {
                                    setValue(
                                      "allowedBrands",
                                      currentBrands.filter(
                                        (id) => id !== brand.id,
                                      ),
                                    );
                                  }
                                }}
                                disabled={mode === MODE.VIEW}
                              />
                              <label
                                htmlFor={`brand-${brand.id}`}
                                className="text-sm"
                              >
                                {brand.name} ({brand.addressName})
                              </label>
                            </div>
                          );
                        })}
                        {brands.length === 0 && (
                          <p className="text-sm text-gray-500">
                            No brands available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Allowed Addresses
                      </label>
                      <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                        {addresses.map((address: any) => {
                          const currentAllowedAddresses =
                            watch("allowedAddresses") || [];
                          const isChecked = currentAllowedAddresses.includes(
                            address.id,
                          );
                          return (
                            <div
                              key={address.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`address-${address.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentAddresses =
                                    watch("allowedAddresses") || [];
                                  if (checked) {
                                    setValue("allowedAddresses", [
                                      ...currentAddresses,
                                      address.id,
                                    ]);
                                  } else {
                                    setValue(
                                      "allowedAddresses",
                                      currentAddresses.filter(
                                        (id) => id !== address.id,
                                      ),
                                    );
                                  }
                                }}
                                disabled={mode === MODE.VIEW}
                              />
                              <label
                                htmlFor={`address-${address.id}`}
                                className="text-sm"
                              >
                                {address.name} ({address.type})
                              </label>
                            </div>
                          );
                        })}
                        {addresses.length === 0 && (
                          <p className="text-sm text-gray-500">
                            No addresses available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Only show active status in edit/view modes, not in add mode */}
                    {(mode === MODE.EDIT || mode === MODE.VIEW) && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="active"
                            checked={watch("active") || false}
                            onCheckedChange={(checked) =>
                              setValue("active", !!checked)
                            }
                            disabled={mode === MODE.VIEW}
                          />
                          <label htmlFor="active" className="text-sm">
                            Active User
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note: Removed existing users section to optimize API calls */}

                {mode !== MODE.VIEW && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={
                        createUserMutation.isPending ||
                        updateUserMutation.isPending
                      }
                      className="flex-1"
                    >
                      {createUserMutation.isPending
                        ? "Creating..."
                        : updateUserMutation.isPending
                          ? "Updating..."
                          : mode === MODE.ADD
                            ? "Create User"
                            : "Update User"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        navigate(PANEL_ROUTES.COMPANY.USERS(companyId))
                      }
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default CompanyUserForm;
