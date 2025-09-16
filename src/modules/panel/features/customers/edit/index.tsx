import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
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
} from "../customer-form/formSchema";
import {
  apiGetCustomerById,
  apiUpdateCustomer,
} from "@/modules/panel/services/http/customer.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

const CustomerEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerFormFieldConfigs.reduce((acc, field) => {
      acc[field.name] = field.name === "profilePic" ? "" : "";
      return acc;
    }, {} as CustomerFormData),
  });

  const { control, handleSubmit, reset } = form;

  // Fetch customer data
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => apiGetCustomerById(id!),
    enabled: !!id,
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

  // Debug logging
  React.useEffect(() => {
    if (customerData) {
      console.log("Customer data received in edit:", customerData);
    }
  }, [customerData]);

  // Reset form when customer data is loaded
  React.useEffect(() => {
    if (customerData?.data) {
      reset({
        name: customerData.data.name || "",
        email: customerData.data.email || "",
        phoneNumber: customerData.data.phoneNumber || "",
        role: customerData.data.role || "",
        profilePic: customerData.data.profilePic?.url || "",
      });
    }
  }, [customerData, reset]);

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: (data: CustomerFormData) => apiUpdateCustomer(id!, data),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      navigate(PANEL_ROUTES.CUSTOMER.VIEW(id!));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update customer",
      );
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    updateCustomerMutation.mutate(data);
  };

  const isLoading = updateCustomerMutation.isPending;

  if (isLoadingCustomer) {
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

  if (!customerData?.data) {
    return (
      <PageContent
        header={{
          title: "Customer Not Found",
          description: "The customer you're trying to edit doesn't exist.",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Customer not found</p>
            <Button onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}>
              Back to Customers
            </Button>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: `Edit ${customerData.data.name || "Customer"}`,
        description: "Update customer information and settings.",
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.CUSTOMER.VIEW(id!))}
            >
              View Customer
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.CUSTOMER.LIST)}
            >
              Back to Customers
            </Button>
          </div>
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
                          disabled: false,
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
                    disabled={false}
                    placeholder="Upload customer profile picture"
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 border-t pt-6">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(PANEL_ROUTES.CUSTOMER.VIEW(id!))}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-32">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Customer"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContent>
  );
};

export default CustomerEdit;
