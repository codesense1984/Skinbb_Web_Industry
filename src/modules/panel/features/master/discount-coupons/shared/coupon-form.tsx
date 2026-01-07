import {
  useForm,
  FormProvider,
  type FieldErrors,
  Controller,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface ProductVariant {
  variantId: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  attributes?: {
    productAttribute: {
      _id: string;
      name: string;
      slug: string;
    };
    productAttributeValue: {
      _id: string;
      label: string;
      value: string;
      colorCode?: string | null;
    };
  };
}

interface SelectedProduct {
  productId: string;
  variantIds: string[];
  productName: string;
  variants: ProductVariant[];
}
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Select } from "@/core/components/ui/select";
import { DatePicker } from "@/core/components/ui/date-picker";
// import { ComboBox } from "@/core/components/ui/combo-box";
import { Checkbox } from "@/core/components/ui/checkbox";
import { ProductSelectionModal } from "./ProductSelectionModal";
import {
  couponFormInputSchema,
  couponFormSchema,
  type CouponFormData,
} from "./formSchema";
import {
  apiCreateCoupon,
  apiUpdateCoupon,
  type Coupon,
} from "@/modules/panel/services/http/coupon.service";
import { apiGetProductsForDropdown } from "@/modules/panel/services/http/product.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
// import { MODE } from "@/core/types";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// Usage Rules Section Component
const UsageRulesSection = ({
  control,
  errors,
}: {
  control: Control<CouponFormData>;
  errors: FieldErrors<CouponFormData>;
}) => {
  const [showFields, setShowFields] = useState({
    usageLimit: false,
    minimumSpend: false,
    minimumQuantity: false,
    maxDiscountValue: false,
  });

  const watchValues = useWatch({
    control,
    name: ["usageLimit", "minimumSpend", "minimumQuantity", "maxDiscountValue"],
  });

  useEffect(() => {
    const [
      usageLimit = 0,
      minimumSpend = 0,
      minimumQuantity = 0,
      maxDiscountValue = 0,
    ] = watchValues;
    setShowFields({
      usageLimit: Number(usageLimit) > 0,
      minimumSpend: Number(minimumSpend) > 0,
      minimumQuantity: Number(minimumQuantity) > 0,
      maxDiscountValue: Number(maxDiscountValue) > 0,
    });
  }, [watchValues]);

  const toggleField = (field: keyof typeof showFields, checked: boolean) => {
    setShowFields((prev) => ({ ...prev, [field]: checked }));
  };

  const discountType = useWatch({ control, name: "discountType" });

  return (
    <div className="space-y-4">
      {/* Usage Limit */}
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-medium">Usage Limit</h6>
          <p className="text-muted-foreground text-xs">
            Enable to limit number of times the coupon can be used.
          </p>
        </div>
        <Checkbox
          checked={showFields.usageLimit}
          onCheckedChange={(checked: boolean) =>
            toggleField("usageLimit", checked)
          }
        />
      </div>
      {showFields.usageLimit && (
        <div>
          <Controller
            name="usageLimit"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                {...field}
                placeholder="e.g. 100"
                className={errors.usageLimit ? "border-red-500" : ""}
                onChange={(e) => {
                  console.log("🔍 Usage Limit onChange:", {
                    targetValue: e.target.value,
                    fieldValue: field.value,
                    event: e,
                  });
                  field.onChange(e);
                }}
              />
            )}
          />
          {errors.usageLimit && (
            <p className="mt-1 text-sm text-red-500">
              {errors.usageLimit.message}
            </p>
          )}
        </div>
      )}

      {/* Minimum Spend */}
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-medium">Minimum Spend</h6>
          <p className="text-muted-foreground text-xs">
            Enable to set minimum purchase value required.
          </p>
        </div>
        <Checkbox
          checked={showFields.minimumSpend}
          onCheckedChange={(checked: boolean) =>
            toggleField("minimumSpend", checked)
          }
        />
      </div>
      {showFields.minimumSpend && (
        <div>
          <Controller
            name="minimumSpend"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                {...field}
                placeholder="e.g. 500"
                className={errors.minimumSpend ? "border-red-500" : ""}
              />
            )}
          />
          {errors.minimumSpend && (
            <p className="mt-1 text-sm text-red-500">
              {errors.minimumSpend.message}
            </p>
          )}
        </div>
      )}

      {/* Minimum Quantity */}
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-medium">Minimum Quantity</h6>
          <p className="text-muted-foreground text-xs">
            Enable to set minimum items needed in cart.
          </p>
        </div>
        <Checkbox
          checked={showFields.minimumQuantity}
          onCheckedChange={(checked: boolean) =>
            toggleField("minimumQuantity", checked)
          }
        />
      </div>
      {showFields.minimumQuantity && (
        <div>
          <Controller
            name="minimumQuantity"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                {...field}
                placeholder="e.g. 2"
                className={errors.minimumQuantity ? "border-red-500" : ""}
              />
            )}
          />
          {errors.minimumQuantity && (
            <p className="mt-1 text-sm text-red-500">
              {errors.minimumQuantity.message}
            </p>
          )}
        </div>
      )}

      {/* Max Discount Value */}
      {discountType !== "fixed_amount" && (
        <div className="flex items-center justify-between">
          <div>
            <h6 className="font-medium">Max Discount Value</h6>
            <p className="text-muted-foreground text-xs">
              Enable to cap the maximum discount value.
            </p>
          </div>
          <Checkbox
            checked={showFields.maxDiscountValue}
            onCheckedChange={(checked: boolean) =>
              toggleField("maxDiscountValue", checked)
            }
          />
        </div>
      )}
      {showFields.maxDiscountValue && (
        <div>
          <Controller
            name="maxDiscountValue"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                {...field}
                placeholder="e.g. 200"
                className={errors.maxDiscountValue ? "border-red-500" : ""}
              />
            )}
          />
          {errors.maxDiscountValue && (
            <p className="mt-1 text-sm text-red-500">
              {errors.maxDiscountValue.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Default values function with parameters
const getDefaultValues = (couponData?: Coupon | null): CouponFormData => {
  // Map API types back to form types
  const reverseTypeMapping = {
    product: "amount_off_products",
    cart: "amount_off_order",
    bogo: "buy_x_get_y",
  };

  return {
    code: couponData?.code || "",
    title: couponData?.title || "",
    description: couponData?.description || "",
    type: (couponData?.type
      ? reverseTypeMapping[couponData.type as keyof typeof reverseTypeMapping]
      : "amount_off_products") as
      | "amount_off_products"
      | "amount_off_order"
      | "buy_x_get_y",
    discountType: couponData?.discountType || "percentage",
    discountValue: couponData?.discountValue
      ? String(couponData.discountValue)
      : "0",
    selectedProducts: couponData?.selectedProducts || [],
    freeProducts: couponData?.freeProducts || [],
    usageLimit: couponData?.usageLimit ? String(couponData.usageLimit) : "1",
    validFrom: couponData?.validFrom
      ? typeof couponData.validFrom === "string"
        ? couponData.validFrom
        : (couponData.validFrom as Date).toISOString().split("T")[0]
      : "",
    expiresAt: couponData?.expiresAt
      ? typeof couponData.expiresAt === "string"
        ? couponData.expiresAt
        : (couponData.expiresAt as Date).toISOString().split("T")[0]
      : "",
    isActive: couponData?.isActive ?? false,
    // Usage toggles
    enableUsageLimit: couponData?.enableUsageLimit ?? false,
    enableMinimumSpend: couponData?.enableMinimumSpend ?? false,
    enableMinimumQuantity: couponData?.enableMinimumQuantity ?? false,
    enableMaxDiscountValue: couponData?.enableMaxDiscountValue ?? false,
    // Usage values
    minimumSpend: couponData?.minimumSpend
      ? String(couponData.minimumSpend)
      : "",
    minimumQuantity: couponData?.minimumQuantity
      ? String(couponData.minimumQuantity)
      : "",
    maxDiscountValue: couponData?.maxDiscountValue
      ? String(couponData.maxDiscountValue)
      : "",
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
  // const _mode = isView ? MODE.VIEW : isEdit ? MODE.EDIT : MODE.ADD;

  // Product selection modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFreeProductModalOpen, setIsFreeProductModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [selectedFreeProducts, setSelectedFreeProducts] = useState<
    SelectedProduct[]
  >([]);

  // Fetch products for dropdown
  const { data: productsResponse, error } = useQuery({
    queryKey: ["products-for-dropdown"],
    queryFn: () =>
      apiGetProductsForDropdown({
        limit: 10,
      }),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("🔍 Query Status:", { error, productsResponse });

  // Format products for dropdown
  // interface Product {
  //   _id: string;
  //   name?: string;
  //   productName?: string;
  //   title?: string;
  //   slug?: string;
  // }

  // Debug API response
  console.log("🔍 Products API Response:", productsResponse);

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

  // Initialize selected products from form data
  useEffect(() => {
    if (initialData?.selectedProducts) {
      // Convert selected product IDs to SelectedProduct objects
      // This is a simplified version - you might need to fetch full product details
      const products = initialData.selectedProducts.map(
        (productId: string) => ({
          productId,
          variantIds: [],
          productName: `Product ${productId}`,
          variants: [],
        }),
      );
      setSelectedProducts(products);
    }
    if (initialData?.freeProducts) {
      const freeProducts = initialData.freeProducts.map(
        (productId: string) => ({
          productId,
          variantIds: [],
          productName: `Product ${productId}`,
          variants: [],
        }),
      );
      setSelectedFreeProducts(freeProducts);
    }
  }, [initialData]);

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

      // Transform selected products to API format
      const applyToProducts = selectedProducts.map((product) => ({
        id: product.productId,
        variantIds: product.variantIds,
      }));

      // Transform free products for BOGO discounts
      const freeProducts = selectedFreeProducts.map((product) => ({
        id: product.productId,
        variantIds: product.variantIds,
      }));

      // Map form types to API types
      const typeMapping = {
        amount_off_products: "product",
        amount_off_order: "cart",
        buy_x_get_y: "bogo",
      };

      const requestData = {
        code: validatedData.code,
        title: validatedData.title,
        description: validatedData.description,
        type: typeMapping[validatedData.type as keyof typeof typeMapping] as
          | "product"
          | "cart"
          | "bogo",
        discountType: validatedData.discountType,
        discountValue: Number(validatedData.discountValue),
        usageLimit: Number(validatedData.usageLimit),
        isActive: validatedData.isActive,
        minimumSpend: validatedData.minimumSpend
          ? Number(validatedData.minimumSpend)
          : 0,
        minimumQuantity: validatedData.minimumQuantity
          ? Number(validatedData.minimumQuantity)
          : 0,
        maxDiscountValue: validatedData.maxDiscountValue
          ? Number(validatedData.maxDiscountValue)
          : 0,
        validFrom:
          validatedData.validFrom || new Date().toISOString().split("T")[0],
        expiresAt:
          validatedData.expiresAt ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        applyTo: {
          products: applyToProducts,
          ...(validatedData.type === "buy_x_get_y" &&
            freeProducts.length > 0 && { freeProducts }),
        },
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

      // Transform selected products to API format
      const applyToProducts = selectedProducts.map((product) => ({
        id: product.productId,
        variantIds: product.variantIds,
      }));

      // Transform free products for BOGO discounts
      const freeProducts = selectedFreeProducts.map((product) => ({
        id: product.productId,
        variantIds: product.variantIds,
      }));

      // Map form types to API types
      const typeMapping = {
        amount_off_products: "product",
        amount_off_order: "cart",
        buy_x_get_y: "bogo",
      };

      return apiUpdateCoupon(id, {
        _id: id,
        code: validatedData.code,
        title: validatedData.title,
        description: validatedData.description,
        type: typeMapping[validatedData.type as keyof typeof typeMapping] as
          | "product"
          | "cart"
          | "bogo",
        discountType: validatedData.discountType,
        discountValue: Number(validatedData.discountValue),
        usageLimit: Number(validatedData.usageLimit),
        isActive: validatedData.isActive,
        minimumSpend: validatedData.minimumSpend
          ? Number(validatedData.minimumSpend)
          : 0,
        minimumQuantity: validatedData.minimumQuantity
          ? Number(validatedData.minimumQuantity)
          : 0,
        maxDiscountValue: validatedData.maxDiscountValue
          ? Number(validatedData.maxDiscountValue)
          : 0,
        validFrom:
          validatedData.validFrom || new Date().toISOString().split("T")[0],
        expiresAt:
          validatedData.expiresAt ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        applyTo: {
          products: applyToProducts,
          ...(validatedData.type === "buy_x_get_y" &&
            freeProducts.length > 0 && { freeProducts }),
        },
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
  const errors = form.formState.errors;

  const watchType = useWatch({ control: form.control, name: "type" });
  const watchDiscountType = useWatch({
    control: form.control,
    name: "discountType",
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex h-full w-full"
      >
        <div className="flex w-full flex-col justify-between">
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex flex-auto flex-col gap-4">
              {/* General Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle>General Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="code"
                      className="mb-2 block text-sm font-medium"
                    >
                      Discount Code *
                    </label>
                    <Controller
                      name="code"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g. SAVE20"
                          className={errors.code ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-medium"
                    >
                      Title *
                    </label>
                    <Controller
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Discount title"
                          className={errors.title ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-medium"
                    >
                      Description
                    </label>
                    <Controller
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Enter description"
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          rows={5}
                        />
                      )}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Discount Type Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Discount type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="type"
                      className="mb-2 block text-sm font-medium"
                    >
                      Type
                    </label>
                    <Controller
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select discount type"
                          options={[
                            {
                              label: "Amount off products",
                              value: "amount_off_products",
                            },
                            {
                              label: "Amount off order",
                              value: "amount_off_order",
                            },
                            { label: "Buy X get Y", value: "buy_x_get_y" },
                          ]}
                        />
                      )}
                    />
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  {(watchType === "amount_off_products" ||
                    watchType === "buy_x_get_y") && (
                    <div>
                      <label
                        htmlFor="selectedProducts"
                        className="mb-2 block text-sm font-medium"
                      >
                        Select Products
                      </label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() => setIsProductModalOpen(true)}
                          className="w-full justify-start"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          {selectedProducts.length > 0
                            ? `${selectedProducts.length} product${selectedProducts.length !== 1 ? "s" : ""} selected`
                            : "Search and select products"}
                        </Button>
                        {selectedProducts.length > 0 && (
                          <div className="space-y-1">
                            {selectedProducts.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded bg-gray-50 p-2"
                              >
                                <span className="text-sm">
                                  {product.productName}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newProducts = selectedProducts.filter(
                                      (_, i) => i !== index,
                                    );
                                    setSelectedProducts(newProducts);
                                    form.setValue(
                                      "selectedProducts",
                                      newProducts.map((p) => p.productId),
                                    );
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.selectedProducts && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.selectedProducts.message}
                        </p>
                      )}
                    </div>
                  )}

                  {watchType === "buy_x_get_y" && (
                    <div>
                      <label
                        htmlFor="freeProducts"
                        className="mb-2 block text-sm font-medium"
                      >
                        Select Free Products
                      </label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={() => setIsFreeProductModalOpen(true)}
                          className="w-full justify-start"
                        >
                          <Search className="mr-2 h-4 w-4" />
                          {selectedFreeProducts.length > 0
                            ? `${selectedFreeProducts.length} product${selectedFreeProducts.length !== 1 ? "s" : ""} selected`
                            : "Search and select free products"}
                        </Button>
                        {selectedFreeProducts.length > 0 && (
                          <div className="space-y-1">
                            {selectedFreeProducts.map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded bg-gray-50 p-2"
                              >
                                <span className="text-sm">
                                  {product.productName}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newProducts =
                                      selectedFreeProducts.filter(
                                        (_, i) => i !== index,
                                      );
                                    setSelectedFreeProducts(newProducts);
                                    form.setValue(
                                      "freeProducts",
                                      newProducts.map((p) => p.productId),
                                    );
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.freeProducts && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.freeProducts.message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Discount Value Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Discount value</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="discountType"
                      className="mb-2 block text-sm font-medium"
                    >
                      Discount Type
                    </label>
                    <Controller
                      name="discountType"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select discount type"
                          options={[
                            { label: "Percentage", value: "percentage" },
                            { label: "Fixed Amount", value: "fixed_amount" },
                            { label: "Free Product", value: "free_product" },
                          ]}
                        />
                      )}
                    />
                    {errors.discountType && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.discountType.message}
                      </p>
                    )}
                  </div>

                  {watchDiscountType !== "free_product" && (
                    <div>
                      <label
                        htmlFor="discountValue"
                        className="mb-2 block text-sm font-medium"
                      >
                        Discount Value
                      </label>
                      <Controller
                        name="discountValue"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            placeholder="e.g. 20"
                            min={0}
                            className={
                              errors.discountValue ? "border-red-500" : ""
                            }
                            onChange={(e) => {
                              console.log("🔍 Discount Value onChange:", {
                                targetValue: e.target.value,
                                fieldValue: field.value,
                                event: e,
                              });
                              field.onChange(e);
                            }}
                          />
                        )}
                      />
                      {errors.discountValue && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.discountValue.message}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UsageRulesSection control={form.control} errors={errors} />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4 lg:min-w-[440px] 2xl:w-[500px]">
              {/* Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-start justify-between gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        ⚠️ Turning this off will remove this Coupon to every
                        section.
                      </p>
                    </div>
                    <Controller
                      name="isActive"
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Validity Period */}
              <Card>
                <CardHeader>
                  <CardTitle>Duration of Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label
                      htmlFor="validFrom"
                      className="mb-2 block text-sm font-medium"
                    >
                      Valid From
                    </label>
                    <Controller
                      name="validFrom"
                      control={form.control}
                      render={({ field }) => (
                        <DatePicker
                          mode="single"
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : "",
                            )
                          }
                          placeholder="Select valid from date"
                          calendarProps={{
                            disabled: (date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0)),
                          }}
                        />
                      )}
                    />
                    {errors.validFrom && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.validFrom.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="expiresAt"
                      className="mb-2 block text-sm font-medium"
                    >
                      Expires At
                    </label>
                    <Controller
                      name="expiresAt"
                      control={form.control}
                      render={({ field }) => (
                        <DatePicker
                          mode="single"
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) =>
                            field.onChange(
                              date ? date.toISOString().split("T")[0] : "",
                            )
                          }
                          placeholder="Select expiry date"
                          calendarProps={{
                            disabled: (date) => {
                              const today = new Date(
                                new Date().setHours(0, 0, 0, 0),
                              );
                              const validFrom = form.getValues("validFrom");
                              const minDate = validFrom
                                ? new Date(validFrom)
                                : today;
                              return date < minDate;
                            },
                          }}
                        />
                      )}
                    />
                    {errors.expiresAt && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.expiresAt.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions */}
          {!isView && (
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(PANEL_ROUTES.MASTER.DISCOUNT_COUPON)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} variant="contained">
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </form>

      {/* Product Selection Modals */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onConfirm={(products) => {
          setSelectedProducts(products);
          form.setValue(
            "selectedProducts",
            products.map((p) => p.productId),
          );
        }}
        selectedProducts={selectedProducts}
        title="All Products"
        subtitle="Select products or variants to add."
      />

      <ProductSelectionModal
        isOpen={isFreeProductModalOpen}
        onClose={() => setIsFreeProductModalOpen(false)}
        onConfirm={(products) => {
          setSelectedFreeProducts(products);
          form.setValue(
            "freeProducts",
            products.map((p) => p.productId),
          );
        }}
        selectedProducts={selectedFreeProducts}
        title="All Products"
        subtitle="Select free products or variants to add."
      />
    </FormProvider>
  );
}
