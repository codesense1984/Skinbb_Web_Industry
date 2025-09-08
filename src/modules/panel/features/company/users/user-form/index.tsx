import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate, useLocation } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Form } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetCompanyDetailsForOnboarding } from "@/modules/panel/services/http/company.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import { apiCreateSellerMember } from "@/modules/panel/services/http/user.service";
import { userFormSchema, type UserFormData } from "@/modules/panel/features/users/user-form/formSchema";
import { MODE } from "@/core/types/base.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CompanyUserForm = () => {
  const { id: companyId, userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Determine mode based on URL path
  let mode = MODE.ADD;
  if (userId) {
    if (pathname.includes('/view/')) {
      mode = MODE.VIEW;
    } else if (pathname.includes('/edit/')) {
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

  // Fetch company details to get brands and addresses
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ["company-details", companyId],
    queryFn: () => apiGetCompanyDetailsForOnboarding(companyId!),
    enabled: !!companyId,
  });

  // Debug logging
  console.log("Company Data:", companyData);
  console.log("Company Error:", companyError);
  console.log("Is Loading Company:", isLoadingCompany);

  // Fetch roles from API
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiGetRoles({ excludeRole: "mude" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Format roles for select options
  const roleOptions = rolesResponse?.data?.roles?.map(role => ({
    label: role.label,
    value: role._id,
  })) || [];

  // Get brands and addresses from company data
  // Handle different possible response structures
  const company = companyData?.data?.company || (companyData as any)?.company;
  const companyAddresses = company?.addresses || [];
  
  const brands = companyAddresses.flatMap((address: any) => 
    address.brands?.map((brand: any) => ({
      id: brand._id,
      name: brand.name,
      addressId: address.addressId,
      addressName: `${address.city}, ${address.state}`,
    })) || []
  ) || [];

  const addresses = companyAddresses.map((address: any) => ({
    id: address.addressId,
    name: `${address.addressLine1}, ${address.city}, ${address.state}`,
    type: address.addressType,
  })) || [];

  // Fetch existing users for this company
  // Note: Removed existing users API call as it's not needed for add user form

  // Debug logging for brands and addresses
  console.log("Full Company Data:", companyData);
  console.log("Company Data Structure:", companyData?.data);
  console.log("Company Object:", company);
  console.log("Company Addresses:", companyAddresses);
  console.log("Extracted Brands:", brands);
  console.log("Extracted Addresses:", addresses);
  console.log("Brands Length:", brands.length);
  console.log("Addresses Length:", addresses.length);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      const { password, ...userData } = data;
      console.log("Creating user with data:", { companyId, userData });
      return apiCreateSellerMember(companyId!, {
        ...userData,
        password: password || "defaultPassword123!",
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
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create user";
      toast.error(errorMessage);
      
      // If the error is about email/phone already existing, provide more specific guidance
      if (errorMessage.includes("already exists")) {
        toast.error("A user with this email or phone number already exists. Please use different credentials or check the user list.");
      }
    },
  });

  const onSubmit = (data: UserFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Mode:", mode);
    if (mode === MODE.ADD) {
      console.log("Creating new user...");
      createUserMutation.mutate(data);
    } else {
      // TODO: Implement update functionality
      console.log("Update user:", data);
    }
  };

  const companyName = company?.companyName || "Company";

  // Show loading state while fetching company data
  if (isLoadingCompany) {
    return (
      <PageContent
        header={{
          title: "Add User to Company",
          description: "Loading company data...",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading company information...</p>
        </div>
      </PageContent>
    );
  }

  // Show error state if company data failed to load
  if (companyError) {
    return (
      <PageContent
        header={{
          title: "Add User to Company",
          description: "Error loading company data",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500">Failed to load company information. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </PageContent>
    );
  }

  if (!companyId) {
    return (
      <PageContent
        header={{
          title: "Add User",
          description: "Company ID is required.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Invalid company ID provided.</p>
        </div>
      </PageContent>
    );
  }

  if (isLoadingCompany) {
    return (
      <PageContent
        header={{
          title: "Add User",
          description: "Loading company details...",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading company information...</p>
        </div>
      </PageContent>
    );
  }

  if (companyError) {
    return (
      <PageContent
        header={{
          title: "Add User",
          description: "Error loading company details.",
        }}
      >
        <div className="py-8 text-center">
          <p className="text-red-500">Failed to load company information. Please try again.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {(companyError as any)?.message || 'Unknown error'}</p>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: mode === MODE.ADD ? `Add User to ${companyName}` : `Edit User - ${companyName}`,
        description: mode === MODE.ADD 
          ? `Add a new user to ${companyName}` 
          : `Edit user details for ${companyName}`,
        actions: (
          <Button
            variant="outlined"
            onClick={() => navigate(PANEL_ROUTES.COMPANY.USERS(companyId))}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name *</label>
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
                        <label className="text-sm font-medium">Last Name *</label>
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
                      <label className="text-sm font-medium">Phone Number *</label>
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
                        <label className="text-sm font-medium">Password *</label>
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
                    </div>
                  </div>

                  {/* Right Column - Permissions */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed Brands</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {brands.map((brand: any) => (
                          <div key={brand.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand.id}`}
                              checked={watch("allowedBrands")?.includes(brand.id) || false}
                              onCheckedChange={(checked) => {
                                const currentBrands = watch("allowedBrands") || [];
                                if (checked) {
                                  setValue("allowedBrands", [...currentBrands, brand.id]);
                                } else {
                                  setValue("allowedBrands", currentBrands.filter(id => id !== brand.id));
                                }
                              }}
                              disabled={mode === MODE.VIEW}
                            />
                            <label htmlFor={`brand-${brand.id}`} className="text-sm">
                              {brand.name} ({brand.addressName})
                            </label>
                          </div>
                        ))}
                        {brands.length === 0 && (
                          <p className="text-sm text-gray-500">No brands available</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed Addresses</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {addresses.map((address: any) => (
                          <div key={address.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`address-${address.id}`}
                              checked={watch("allowedAddresses")?.includes(address.id) || false}
                              onCheckedChange={(checked) => {
                                const currentAddresses = watch("allowedAddresses") || [];
                                if (checked) {
                                  setValue("allowedAddresses", [...currentAddresses, address.id]);
                                } else {
                                  setValue("allowedAddresses", currentAddresses.filter(id => id !== address.id));
                                }
                              }}
                              disabled={mode === MODE.VIEW}
                            />
                            <label htmlFor={`address-${address.id}`} className="text-sm">
                              {address.name} ({address.type})
                            </label>
                          </div>
                        ))}
                        {addresses.length === 0 && (
                          <p className="text-sm text-gray-500">No addresses available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note: Removed existing users section to optimize API calls */}

                {mode !== MODE.VIEW && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={createUserMutation.isPending}
                      className="flex-1"
                    >
                      {createUserMutation.isPending ? "Creating..." : mode === MODE.ADD ? "Create User" : "Update User"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate(PANEL_ROUTES.COMPANY.USERS(companyId))}
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
