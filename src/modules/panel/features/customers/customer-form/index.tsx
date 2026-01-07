import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { PageContent } from "@/core/components/ui/structure";
import { ImageUpload } from "@/core/components/ui/image-upload";
import {
  customerFormSchema,
  customerFormFieldConfigs,
  type CustomerFormData,
} from "./formSchema";
import {
  apiGetCustomerById,
  apiCreateCustomer,
  apiUpdateCustomer,
} from "@/modules/panel/services/http/customer.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const MODE = {
  ADD: "add",
  EDIT: "edit",
  VIEW: "view",
} as const;

type Mode = (typeof MODE)[keyof typeof MODE];

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Determine mode based on URL path
  let mode: Mode = MODE.ADD;
  if (id) {
    if (pathname.includes("/view/")) {
      mode = MODE.VIEW;
    } else if (pathname.includes("/edit/")) {
      mode = MODE.EDIT;
    } else {
      mode = MODE.EDIT; // fallback
    }
  }

  // Create form with dynamic schema
  const createFormSchema = () => {
    return customerFormSchema;
  };

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: customerFormFieldConfigs.reduce((acc, field) => {
      acc[field.name] = field.name === "profilePic" ? "" : "";
      return acc;
    }, {} as CustomerFormData),
  });

  const { control, handleSubmit, reset } = form;

  // Fetch customer data for edit and view modes
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => apiGetCustomerById(id!),
    enabled: (mode === MODE.EDIT || mode === MODE.VIEW) && !!id,
  });

  // Fetch roles from API
  const { data: rolesResponse } = useQuery({
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

  // Create dynamic field configs with role options
  const dynamicFieldConfigs = customerFormFieldConfigs.map((field) => {
    if (field.name === "role") {
      return {
        ...field,
        options: roleOptions,
      };
    }
    return field;
  });

  // Reset form when customer data is loaded
  React.useEffect(() => {
    if (customerData?.data && (mode === MODE.EDIT || mode === MODE.VIEW)) {
      reset({
        name: customerData.data.name || "",
        email: customerData.data.email || "",
        phoneNumber: customerData.data.phoneNumber || "",
        role: customerData.data.role || "",
        profilePic: customerData.data.profilePic?.url || "",
      });
    }
  }, [customerData, mode, reset]);

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => apiCreateCustomer(data),
    onSuccess: () => {
      toast.success("Customer created successfully!");
      navigate(PANEL_ROUTES.CUSTOMER.LIST);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create customer",
      );
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => apiUpdateCustomer(id!, data),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      navigate(PANEL_ROUTES.CUSTOMER.LIST);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update customer",
      );
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (mode === MODE.ADD) {
      createCustomerMutation.mutate(data);
    } else {
      updateCustomerMutation.mutate(data);
    }
  };

  const isLoading =
    createCustomerMutation.isPending || updateCustomerMutation.isPending;

  if ((mode === MODE.EDIT || mode === MODE.VIEW) && isLoadingCustomer) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Please wait while we load customer data.",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading customer data...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title:
          mode === MODE.ADD
            ? "Create Customer"
            : mode === MODE.EDIT
              ? "Edit Customer"
              : "View Customer",
        description:
          mode === MODE.ADD
            ? "Add a new customer to your system."
            : mode === MODE.EDIT
              ? "Update customer information and settings."
              : "View customer information and details.",
        actions: (
          <Button
            variant="outlined"
            onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}
          >
            Back to Customers
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Card - Basic Information */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormFieldsRenderer<CustomerFormData>
                      control={control}
                      fieldConfigs={dynamicFieldConfigs
                        .filter((field) => field.name !== "profilePic")
                        .map((field) => ({
                          ...field,
                          disabled: mode === MODE.VIEW,
                        }))}
                      className="contents"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card - Profile Picture Upload */}
              <div className="space-y-6 rounded-xl border bg-white p-8 shadow-sm">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Picture
                  </h2>
                  <ImageUpload
                    value={form.watch("profilePic")}
                    onChange={(value) => form.setValue("profilePic", value)}
                    disabled={mode === MODE.VIEW}
                    placeholder="Upload customer profile picture"
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons - Only show for ADD and EDIT modes */}
            {mode !== MODE.VIEW && (
              <div className="flex justify-end space-x-4 border-t pt-6">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="min-w-32">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      <span>
                        {mode === MODE.ADD ? "Creating..." : "Updating..."}
                      </span>
                    </div>
                  ) : mode === MODE.ADD ? (
                    "Create Customer"
                  ) : (
                    "Update Customer"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </PageContent>
  );
};

export default CustomerForm;
