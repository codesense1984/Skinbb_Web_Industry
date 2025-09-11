import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/components/ui/avatar";
import { Form } from "@/core/components/ui/form";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { apiGetCustomerById } from "@/modules/panel/services/http/customer.service";
import { apiGetRoles } from "@/modules/panel/services/http/role.service";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { User } from "lucide-react";
import { customerFormSchema, customerFormFieldConfigs, type CustomerFormData } from "../customer-form/formSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const CustomerView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customerData, isLoading, error } = useQuery({
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
  const roleOptions = rolesResponse?.data?.roles?.map(role => ({
    label: role.label,
    value: role._id,
  })) || [];

  // Create dynamic field configs with role options
  const dynamicFieldConfigs = customerFormFieldConfigs.map(field => {
    if (field.name === "role") {
      return {
        ...field,
        options: roleOptions,
      };
    }
    return field;
  });

  // Form setup for view mode (all fields disabled)
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "",
      profilePic: "",
    },
  });

  // Reset form when customer data is loaded
  React.useEffect(() => {
    if (customerData?.data) {
      form.reset({
        name: customerData.data.name || "",
        email: customerData.data.email || "",
        phoneNumber: customerData.data.phoneNumber || "",
        role: customerData.data.role || "",
        profilePic: customerData.data.profilePic?.url || "",
      });
    }
  }, [customerData, form]);

  // Debug logging
  React.useEffect(() => {
    if (customerData) {
      console.log("Customer data received:", customerData);
    }
    if (error) {
      console.error("Customer fetch error:", error);
    }
  }, [customerData, error]);

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Please wait while we load customer data.",
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customer data...</p>
          </div>
        </div>
      </PageContent>
    );
  }

  if (error || !customerData?.data) {
    return (
      <PageContent
        header={{
          title: "Customer Not Found",
          description: "The customer you're looking for doesn't exist.",
        }}
      >
        <div className="flex items-center justify-center h-64">
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

  const customer = customerData.data;

  return (
    <PageContent
      header={{
        title: customer.name || "Customer Details",
        description: "View customer information and details.",
        actions: (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.CUSTOMER.EDIT(customer._id))}
            >
              Edit Customer
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
          <form className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Card - Basic Information */}
              <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <FormFieldsRenderer<CustomerFormData>
                      control={form.control}
                      fieldConfigs={dynamicFieldConfigs
                        .filter(field => field.name !== "profilePic")
                        .map(field => ({
                          ...field,
                          disabled: true, // All fields disabled in view mode
                        }))}
                      className="contents"
                    />
                  </div>
                </div>
              </div>

              {/* Right Card - Profile Picture */}
              <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Picture
                  </h2>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="size-32 border-2 border-gray-200">
                        <AvatarImage
                          src={customer.profilePic?.url}
                          alt={`${customer.name || 'Customer'} profile`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gray-100">
                          <User className="size-12 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">
                          {customer.profilePic?.url ? "Profile picture" : "No profile picture"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </PageContent>
  );
};

export default CustomerView;
