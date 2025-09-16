import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import {
  couponFormInputSchema,
  couponFormSchema,
  couponSchema,
  type CouponFormData,
} from "./formSchema";
import {
  apiCreateCoupon,
  apiUpdateCoupon,
  type Coupon,
} from "@/modules/panel/services/http/coupon.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { MODE } from "@/core/types";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { Badge } from "@/core/components/ui/badge";

// Default values function with parameters
const getDefaultValues = (couponData?: Coupon | null): CouponFormData => {
  return {
    code: couponData?.code || "",
    title: couponData?.title || "",
    description: couponData?.description || "",
    type: couponData?.type || "product",
    discountType: couponData?.discountType || "percentage",
    discountValue: couponData?.discountValue
      ? String(couponData.discountValue)
      : "0",
    usageLimit: couponData?.usageLimit ? String(couponData.usageLimit) : "1",
    validFrom: new Date(couponData?.validFrom ?? ""),
    // validFrom: couponData?.validFrom
    //   ? new Date(couponData.validFrom).toISOString().split("T")[0]
    //   : new Date().toISOString().split("T")[0],
    expiresAt: new Date(couponData?.expiresAt ?? ""),
    // expiresAt: couponData?.expiresAt
    //   ? new Date(couponData.expiresAt).toISOString().split("T")[0]
    //   : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    //       .toISOString()
    //       .split("T")[0],
    isActive: couponData?.isActive ?? false,
  };
};

interface CouponFormProps {
  initialData?: Coupon;
  isEdit?: boolean;
  isView?: boolean;
}

export function CouponForm({
  initialData,
  isEdit = false,
  isView = false,
}: CouponFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = isView ? MODE.VIEW : isEdit ? MODE.EDIT : MODE.ADD;

  // Function to handle API errors and set form field errors
  const handleApiError = (error: unknown) => {
    const apiError = error as {
      response?: {
        data?: {
          errors?: Array<{ msg?: string; field?: string; type?: string }>;
          message?: string;
        };
        status?: number;
      };
      message?: string;
    };

    if (
      apiError.response?.data?.errors &&
      Array.isArray(apiError.response.data.errors)
    ) {
      // Set field-specific errors
      apiError.response.data.errors.forEach((err) => {
        // Map error to field based on the error message or type
        let fieldName: keyof CouponFormData | null = null;

        if (err.msg?.toLowerCase().includes("coupon code")) {
          fieldName = "code";
        } else if (err.msg?.toLowerCase().includes("title")) {
          fieldName = "title";
        } else if (err.msg?.toLowerCase().includes("description")) {
          fieldName = "description";
        } else if (err.msg?.toLowerCase().includes("discount")) {
          fieldName = "discountValue";
        } else if (err.msg?.toLowerCase().includes("usage")) {
          fieldName = "usageLimit";
        } else if (
          err.msg?.toLowerCase().includes("valid from") ||
          err.msg?.toLowerCase().includes("valid from")
        ) {
          fieldName = "validFrom";
        } else if (
          err.msg?.toLowerCase().includes("expires") ||
          err.msg?.toLowerCase().includes("expiry")
        ) {
          fieldName = "expiresAt";
        }

        if (fieldName && err.msg) {
          form.setError(fieldName, {
            type: "server",
            message: err.msg,
          });
        }
      });

      // Show the first error as toast
      const firstError = apiError.response.data.errors[0];
      if (firstError.msg) {
        toast.error(firstError.msg);
      }
    } else {
      // Show generic error
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "An error occurred";
      toast.error(errorMessage);
    }
  };

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponFormInputSchema),
    defaultValues: getDefaultValues(initialData),
  });

  console.log(form.watch(), "watch");
  // Clear server errors when user changes form values
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name) {
        const error = form.formState.errors[name as keyof CouponFormData];
        if (error?.type === "server") {
          form.clearErrors(name as keyof CouponFormData);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const createMutation = useMutation({
    mutationFn: (data: CouponFormData) => {
      const validatedData = couponFormSchema.parse(data);
      const requestData = {
        ...validatedData,
        discountValue: Number(validatedData.discountValue),
        usageLimit: Number(validatedData.usageLimit),
        isActive: validatedData.isActive,
      };
      console.log("Creating coupon with data:", requestData);
      return apiCreateCoupon(requestData);
    },
    onSuccess: () => {
      toast.success("Coupon created successfully");
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.COUPON.LIST] });
      navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON);
    },
    onError: (error: unknown) => {
      console.error("Create coupon error:", error);
      handleApiError(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const validatedData = couponFormSchema.parse(data);
      return apiUpdateCoupon(id, {
        _id: id,
        ...validatedData,
        discountValue: Number(validatedData.discountValue),
        usageLimit: Number(validatedData.usageLimit),
        isActive: validatedData.isActive,
      });
    },
    onSuccess: () => {
      toast.success("Coupon updated successfully");
      queryClient.invalidateQueries({ queryKey: [ENDPOINTS.COUPON.LIST] });
      navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON);
    },
    onError: (error: unknown) => {
      console.error("Update coupon error:", error);
      handleApiError(error);
    },
  });

  const onSubmit = (data: CouponFormData) => {
    if (isView) {
      return; // Don't submit in view mode
    }

    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData._id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  const onError = (err: FieldErrors<CouponFormData>) => {
    console.log("🚀 ~ onError ~ err:", err);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-wrap justify-between gap-2 border-b">
            <CardTitle>Basic Information </CardTitle>
            <Badge variant={"outline"} className="bg-muted/50 capitalize">
              {initialData?.status}
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <FormFieldsRenderer<CouponFormData>
              control={form.control}
              fieldConfigs={couponSchema.basic_information({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
            />
          </CardContent>
        </Card>

        {/* Validity Period */}
        <div className="grid gap-4 md:grid-cols-10 md:gap-6">
          <Card className="md:col-span-6">
            <CardHeader className="border-b">
              <CardTitle>Validity Period</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <FormFieldsRenderer<CouponFormData>
                control={form.control}
                fieldConfigs={couponSchema.validity_period({ mode })}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
              />
            </CardContent>
          </Card>
          <Card className="md:col-span-4">
            <CardHeader className="flex flex-wrap justify-between gap-2 border-b">
              <CardTitle className="flex items-center gap-2">Status</CardTitle>
              <CardDescription className="font-normal">
                ⚠️ Turning this off will remove this Coupon to every section.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p></p>
              <br />
              <FormFieldsRenderer<CouponFormData>
                control={form.control}
                fieldConfigs={couponSchema.status({ mode })}
                className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Coupon Details */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <FormFieldsRenderer<CouponFormData>
              control={form.control}
              fieldConfigs={couponSchema.coupon_details({ mode })}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2"
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        {!isView && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant="contained"
              color="secondary"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
