import {
  useForm,
  FormProvider,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import {
  promotionFormInputSchema,
  promotionFormSchema,
  promotionSchema,
  type PromotionFormData,
} from "./formSchema";
import {
  apiCreatePromotion,
  apiUpdatePromotion,
} from "@/modules/panel/services/http/promotion.service";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import {
  apiGetProductsForDropdown,
  apiGetCategoriesForDropdown,
  apiGetTagsForDropdown,
} from "@/modules/panel/services/http/product.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { parseDateFromAPI } from "../utils/date.utils";
import type { Promotion } from "@/modules/panel/types/promotion.type";
import { MODE } from "@/core/types";

interface PromotionFormProps {
  initialData?: Promotion;
  isEdit?: boolean;
  isView?: boolean;
  listRoute?: string; // Optional route to navigate to after success (defaults to PANEL_ROUTES.PROMOTION.LIST)
}

export function PromotionForm({
  initialData,
  isEdit = false,
  isView = false,
  listRoute,
}: PromotionFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const mode = isView ? MODE.VIEW : isEdit ? MODE.EDIT : MODE.ADD;
  const defaultListRoute = PANEL_ROUTES.PROMOTION.LIST;
  const navigateToList = listRoute || defaultListRoute;

  // Fetch options for dropdowns
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brands-for-promotion"],
    queryFn: () => apiGetBrands({ limit: 1000, page: 1 }),
    enabled: !isView,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-for-promotion"],
    queryFn: () => apiGetProductsForDropdown({ limit: 1000, page: 1 }),
    enabled: !isView,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories-for-promotion"],
    queryFn: () => apiGetCategoriesForDropdown(),
    enabled: !isView,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags-for-promotion"],
    queryFn: () => apiGetTagsForDropdown(),
    enabled: !isView,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform data to options format with error handling
  const brandOptions =
    brandsData?.data?.brands
      ?.filter((brand) => brand?._id && brand?.name)
      .map((brand) => ({
        value: brand._id,
        label: brand.name,
      })) || [];

  const productOptions =
    productsData?.data?.products
      ?.filter((product: any) => product?._id && (product?.productName || product?.name))
      .map((product: any) => ({
        value: product._id,
        label: product.productName || product.name || "Unknown Product",
      })) || [];

  // Categories might be in a different structure (hierarchy or flat array)
  const categoryOptions = (() => {
    if (categoriesData?.data?.categories) {
      return categoriesData.data.categories
        .filter((category: any) => category?._id && category?.name)
        .map((category: any) => ({
          value: category._id,
          label: category.name,
        }));
    }
    if (Array.isArray(categoriesData?.data)) {
      return categoriesData.data
        .filter((category: any) => category?._id && category?.name)
        .map((category: any) => ({
          value: category._id,
          label: category.name,
        }));
    }
    return [];
  })();

  // Tags might be in a different structure
  const tagOptions = (() => {
    if (tagsData?.data?.tags) {
      return tagsData.data.tags
        .filter((tag: any) => tag?._id && tag?.name)
        .map((tag: any) => ({
          value: tag._id,
          label: tag.name,
        }));
    }
    if (Array.isArray(tagsData?.data)) {
      return tagsData.data
        .filter((tag: any) => tag?._id && tag?.name)
        .map((tag: any) => ({
          value: tag._id,
          label: tag.name,
        }));
    }
    return [];
  })();

  // Initialize form
  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormInputSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      redirectUrl: initialData?.redirectUrl || "",
      linkType: (initialData?.linkType as any) || "shelf",
      promotionType: (initialData?.promotionType as any) || "banner",
      brandIds: Array.isArray(initialData?.brand)
        ? initialData.brand.map((b) =>
            typeof b === "string" ? b : b._id,
          )
        : [],
      productIds: Array.isArray(initialData?.product)
        ? initialData.product.map((p) =>
            typeof p === "string" ? p : p._id,
          )
        : [],
      categoryIds: Array.isArray(initialData?.category)
        ? initialData.category.map((c) =>
            typeof c === "string" ? c : c._id,
          )
        : [],
      tagIds: Array.isArray(initialData?.tag)
        ? initialData.tag.map((t) => (typeof t === "string" ? t : t._id))
        : [],
      placement: (initialData?.placement as any) || "home-hero",
      priority: initialData?.priority || 100,
      startAt: initialData?.startAt
        ? (() => {
            try {
              const date = parseDateFromAPI(initialData.startAt);
              date.setHours(0, 0, 0, 0);
              return date;
            } catch {
              return new Date();
            }
          })()
        : new Date(),
      endAt: initialData?.endAt
        ? (() => {
            try {
              const date = parseDateFromAPI(initialData.endAt);
              date.setHours(23, 59, 0, 0);
              return date;
            } catch {
              const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              defaultEnd.setHours(23, 59, 0, 0);
              return defaultEnd;
            }
          })()
        : (() => {
            const defaultEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            defaultEnd.setHours(23, 59, 0, 0);
            return defaultEnd;
          })(),
      isActive: initialData?.isActive ?? true,
      allowOverlap: initialData?.allowOverlap ?? false,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PromotionFormData) => {
      if (!userId) {
        throw new Error("User ID is required. Please log in and try again.");
      }
      try {
        const output = promotionFormSchema.parse(data);
        return apiCreatePromotion(userId, output);
      } catch (validationError: any) {
        // Handle Zod validation errors
        if (validationError.errors) {
          validationError.errors.forEach((err: any) => {
            const fieldName = err.path?.[0] as keyof PromotionFormData;
            if (fieldName) {
              form.setError(fieldName, {
                type: "validation",
                message: err.message,
              });
            }
          });
        }
        throw validationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.PROMOTION.LIST],
      });
      toast.success("Promotion created successfully");
      navigate(navigateToList);
    },
    onError: (error: any) => {
      // Handle API errors
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          const fieldName = err.field as keyof PromotionFormData;
          if (fieldName) {
            form.setError(fieldName, {
              type: "server",
              message: err.message || "Validation error",
            });
          }
        });
        toast.error(error.response.data.message || "Please fix the errors and try again");
      } else {
        toast.error(error?.message || "Failed to create promotion. Please try again.");
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: PromotionFormData) => {
      if (!initialData?._id) {
        throw new Error("Promotion ID is required. Please refresh the page and try again.");
      }
      try {
        const output = promotionFormSchema.parse(data);
        return apiUpdatePromotion(initialData._id, output);
      } catch (validationError: any) {
        // Handle Zod validation errors
        if (validationError.errors) {
          validationError.errors.forEach((err: any) => {
            const fieldName = err.path?.[0] as keyof PromotionFormData;
            if (fieldName) {
              form.setError(fieldName, {
                type: "validation",
                message: err.message,
              });
            }
          });
        }
        throw validationError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.PROMOTION.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [ENDPOINTS.PROMOTION.GET_BY_ID(initialData!._id)],
      });
      toast.success("Promotion updated successfully");
      navigate(navigateToList);
    },
    onError: (error: any) => {
      // Handle API errors
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          const fieldName = err.field as keyof PromotionFormData;
          if (fieldName) {
            form.setError(fieldName, {
              type: "server",
              message: err.message || "Validation error",
            });
          }
        });
        toast.error(error.response.data.message || "Please fix the errors and try again");
      } else {
        toast.error(error?.message || "Failed to update promotion. Please try again.");
      }
    },
  });

  // Refs to prevent infinite loops when setting date times
  const startAtProcessedRef = useRef<number | null>(null);
  const endAtProcessedRef = useRef<number | null>(null);

  // Watch date fields and set time automatically (only once per date change)
  const startAt = useWatch({ control: form.control, name: "startAt" });
  const endAt = useWatch({ control: form.control, name: "endAt" });

  useEffect(() => {
    if (startAt instanceof Date) {
      const currentTime = startAt.getTime();
      // Only process if this is a new date (not already processed)
      if (startAtProcessedRef.current !== currentTime) {
        const newDate = new Date(startAt);
        newDate.setHours(0, 0, 0, 0);
        const newTime = newDate.getTime();
        if (currentTime !== newTime) {
          startAtProcessedRef.current = newTime;
          form.setValue("startAt", newDate, { shouldValidate: false, shouldDirty: false });
        } else {
          startAtProcessedRef.current = currentTime;
        }
      }
    } else {
      startAtProcessedRef.current = null;
    }
  }, [startAt, form]);

  useEffect(() => {
    if (endAt instanceof Date) {
      const currentTime = endAt.getTime();
      // Only process if this is a new date (not already processed)
      if (endAtProcessedRef.current !== currentTime) {
        const newDate = new Date(endAt);
        newDate.setHours(23, 59, 0, 0);
        const newTime = newDate.getTime();
        if (currentTime !== newTime) {
          endAtProcessedRef.current = newTime;
          form.setValue("endAt", newDate, { shouldValidate: false, shouldDirty: false });
        } else {
          endAtProcessedRef.current = currentTime;
        }
      }
    } else {
      endAtProcessedRef.current = null;
    }
  }, [endAt, form]);

  const onSubmit = (data: PromotionFormData) => {
    // Ensure dates have correct time (create new Date objects to avoid mutation)
    const processedData = { ...data };
    if (processedData.startAt instanceof Date) {
      const newStartDate = new Date(processedData.startAt);
      newStartDate.setHours(0, 0, 0, 0);
      processedData.startAt = newStartDate;
    }
    if (processedData.endAt instanceof Date) {
      const newEndDate = new Date(processedData.endAt);
      newEndDate.setHours(23, 59, 0, 0);
      processedData.endAt = newEndDate;
    }

    // Ensure arrays are not undefined
    processedData.brandIds = processedData.brandIds || [];
    processedData.productIds = processedData.productIds || [];
    processedData.categoryIds = processedData.categoryIds || [];
    processedData.tagIds = processedData.tagIds || [];

    // Handle image file - file input stores in image_files, extract it
    const imageFiles = (data as any).image_files;
    if (Array.isArray(imageFiles) && imageFiles.length > 0 && imageFiles[0] instanceof File) {
      // File input component stored the file in image_files, use that
      (processedData as any).image_files = imageFiles;
      // Also set image to the File object for consistency
      processedData.image = imageFiles[0];
    } else if (processedData.image) {
      // If image is a File or valid ObjectId string, keep it
      if (processedData.image instanceof File) {
        // Keep the File object
      } else if (typeof processedData.image === "string") {
        // Validate it's a valid ObjectId (24 hex chars) or URL
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        const isUrl = processedData.image.startsWith("http://") || processedData.image.startsWith("https://");
        if (!objectIdPattern.test(processedData.image) && !isUrl) {
          // If it's not a valid ObjectId or URL (likely a file path), remove it
          delete processedData.image;
        }
      }
    }

    if (isEdit) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  // Get field configurations
  const basicFields = promotionSchema.basic_information({ mode });
  const promotionFields = promotionSchema.promotion_details({ mode });
  const linkFields = promotionSchema.link_settings({ mode });
  const targetingFields = promotionSchema.targeting({
    mode,
    brandOptions,
    productOptions,
    categoryOptions,
    tagOptions,
  });
  const scheduleFields = promotionSchema.schedule({ mode });
  const statusFields = promotionSchema.status({ mode });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {basicFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Promotion Details */}
          <Card>
            <CardHeader>
              <CardTitle>Promotion Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {promotionFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Link Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Link Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {linkFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Targeting (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {targetingFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {scheduleFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {statusFields.map((field) => (
                  <FormInput
                    key={field.name}
                    {...field}
                    control={form.control}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isView && (
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(navigateToList)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Promotion"
                    : "Create Promotion"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

