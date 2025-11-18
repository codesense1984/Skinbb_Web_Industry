import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate, useLocation } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { PageContent } from "@/core/components/ui/structure";
import {
  apiGetProductCategories,
  apiCreateProductCategory,
  apiUpdateProductCategory,
  apiUploadMedia,
  apiGetProductCategoryById,
} from "@/modules/panel/services/http/product.service";
import { categoryFormSchema, type CategoryFormData } from "./formSchema";
import { MODE } from "@/core/types/base.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import {
  FormFieldsRenderer,
  type FormFieldConfig,
} from "@/core/components/ui/form-input";

interface CategoryFormProps {
  mode?: MODE;
  categoryId?: string;
  onSuccess?: () => void;
}

export default function CategoryForm({
  mode: propMode,
  categoryId: propCategoryId,
  onSuccess,
}: CategoryFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const queryClient = useQueryClient();
  
  // Store the uploaded media ID
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  // Track the last uploaded file to prevent re-uploading
  const lastUploadedFileRef = useRef<File | null>(null);

  // Determine mode based on URL path (like brand form)
  let mode = MODE.ADD;
  if (id || propCategoryId) {
    if (pathname.endsWith("/view")) {
      mode = MODE.VIEW;
    } else if (pathname.endsWith("/edit")) {
      mode = MODE.EDIT;
    } else {
      mode = MODE.EDIT; // fallback
    }
  }

  // Use prop mode if provided, otherwise use detected mode
  const finalMode = propMode || mode;
  const finalCategoryId = propCategoryId || id;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentCategory: "none",
      isActive: true,
      image: null,
      image_files: null,
    },
  });

  const { handleSubmit, watch, setValue, control } = form;

  // Image preview setup
  const profileData = watch("image_files")?.[0];
  const existingImageUrl = watch("image");
  const imageFiles = watch("image_files");

  const { element } = useImagePreview(profileData, existingImageUrl, {
    clear: () => {
      setValue("image_files", undefined);
      setValue("image", "");
      setUploadedMediaId(null);
      lastUploadedFileRef.current = null;
    },
  });

  // Upload category image function
  const uploadCategoryImage = async (file: File): Promise<{ mediaId: string; url: string }> => {
    const response = await apiUploadMedia(file, "image");
    
    if (response.success && response.data.media.length > 0) {
      const media = response.data.media[0];
      return {
        mediaId: media._id,
        url: media.url,
      };
    }
    throw new Error("Failed to upload image");
  };

  // Handle image upload when file is selected
  useEffect(() => {
    const handleImageUpload = async () => {
      if (imageFiles && imageFiles.length > 0) {
        const file = imageFiles[0];
        if (file instanceof File) {
          // Check if this is the same file we already uploaded
          if (lastUploadedFileRef.current === file) {
            return; // Already uploaded, skip
          }
          
          try {
            toast.loading("Uploading image...", { id: "upload-image" });
            const { mediaId, url } = await uploadCategoryImage(file);
            
            // Store the media ID and update form immediately with uploaded URL
            setUploadedMediaId(mediaId);
            setValue("image", url);
            lastUploadedFileRef.current = file; // Track this file as uploaded
            toast.success("Image uploaded successfully", { id: "upload-image" });
            
            // If in edit mode, fetch category data to get preview after upload
            // This ensures we have the latest category data including the uploaded image
            if (finalMode === MODE.EDIT && finalCategoryId) {
              try {
                const categoryResponse = await apiGetProductCategoryById(finalCategoryId);
                // API response structure: { data: { data: { ...category } } } or { data: { ...category } }
                const categoryData = categoryResponse?.data?.data || categoryResponse?.data;
                if (categoryData) {
                  // Extract thumbnail URL from the fetched category data
                  let thumbnailUrl = url; // Default to uploaded URL
                  if (categoryData.thumbnail) {
                    if (typeof categoryData.thumbnail === "string") {
                      thumbnailUrl = categoryData.thumbnail.startsWith("http") 
                        ? categoryData.thumbnail 
                        : url; // Use uploaded URL if thumbnail is just an ID
                    } else if (categoryData.thumbnail?.url) {
                      thumbnailUrl = categoryData.thumbnail.url;
                    }
                  }
                  
                  // Update the form with the fetched thumbnail URL to ensure preview is correct
                  setValue("image", thumbnailUrl);
                  console.log("Category preview fetched and updated:", categoryData);
                  
                  // Invalidate the query cache to ensure fresh data on next load
                  queryClient.invalidateQueries({ queryKey: ["product-category", finalCategoryId] });
                }
              } catch (error) {
                console.error("Error fetching category preview:", error);
                // Continue with the uploaded URL if preview fetch fails
              }
            }
          } catch (error: any) {
            console.error("Error uploading image:", error);
            toast.error(
              error?.response?.data?.message || "Failed to upload image",
              { id: "upload-image" }
            );
            // Clear the file input on error
            setValue("image_files", undefined);
            lastUploadedFileRef.current = null;
          }
        }
      } else {
        // Reset when files are cleared
        lastUploadedFileRef.current = null;
      }
    };

    handleImageUpload();
  }, [imageFiles, setValue, finalMode, finalCategoryId]);

  // Fetch parent categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiGetProductCategories({ page: 1, limit: 1000 }),
    enabled: true, // Enable to fetch parent categories
  });

  const parentCategories = useMemo(() => {
    try {
      if (!(categoriesData as any)?.data?.productCategories) return [];
      return (categoriesData as any).data.productCategories.filter(
        (cat: any) => cat.isActive,
      );
    } catch (error) {
      console.error("Error processing parent categories:", error);
      return [];
    }
  }, [categoriesData]);

  // Fetch category data for edit/view mode
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["product-category", finalCategoryId],
    queryFn: () => apiGetProductCategoryById(finalCategoryId!),
    enabled:
      !!finalCategoryId && (finalMode === MODE.EDIT || finalMode === MODE.VIEW),
    select: (data: any) => {
      // API response structure: { data: { data: { ...category } } } or { data: { ...category } }
      return data?.data?.data || data?.data || null;
    },
  });

  // Populate form for edit/view mode
  useEffect(() => {
    if (categoryData) {
      console.log("Populating form with category data:", categoryData);
      
      // Extract image URL - check thumbnail (object or string), image, imageUrl, or logo
      let imageUrl = "";
      if (categoryData.thumbnail) {
        if (typeof categoryData.thumbnail === "string") {
          // Thumbnail is a string - could be URL or media ID
          // If it looks like a URL (starts with http), use it directly
          // Otherwise, it might be a media ID that needs to be resolved
          if (categoryData.thumbnail.startsWith("http://") || categoryData.thumbnail.startsWith("https://")) {
            imageUrl = categoryData.thumbnail;
          } else {
            // It's likely a media ID, but we'll try to use it as-is for now
            // The API might return it as a populated object in some cases
            imageUrl = categoryData.thumbnail;
          }
        } else if (categoryData.thumbnail?.url) {
          // Thumbnail is an object with url property
          imageUrl = categoryData.thumbnail.url;
        } else if (categoryData.thumbnail?._id) {
          // Thumbnail is an object with _id (media ID)
          // If it also has url, prefer url, otherwise use _id
          imageUrl = categoryData.thumbnail.url || categoryData.thumbnail._id;
        }
      }
      
      // Fallback to other image fields
      if (!imageUrl) {
        imageUrl = categoryData.image || categoryData.imageUrl || categoryData.logo || "";
      }
      
      console.log("Extracted image URL:", imageUrl, "from categoryData:", categoryData);

      form.reset({
        name: categoryData.name || "",
        slug: categoryData.slug || "",
        description: categoryData.description || "",
        parentCategory: categoryData.parentCategory || "none",
        isActive: categoryData.isActive ?? true,
        image: imageUrl,
        image_files: null,
      });

      if (imageUrl) {
        setValue("image", imageUrl);
      }
    }
  }, [categoryData, form, setValue]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: FormData | any) => {
      console.log("Creating category with data:", data);
      return apiCreateProductCategory(data);
    },
    onSuccess: (response) => {
      console.log("Category created successfully:", response);
      toast.success("Category created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY);
      }
    },
    onError: (error: any) => {
      console.error("Error creating category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create category",
      );
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (data: FormData | any) => {
      console.log("Updating category with data:", data);
      return apiUpdateProductCategory(finalCategoryId!, data);
    },
    onSuccess: (response) => {
      console.log("Category updated successfully:", response);
      toast.success("Category updated successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY);
      }
    },
    onError: (error: any) => {
      console.error("Error updating category:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update category",
      );
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Form data received:", data);
    console.log("Mode:", mode);

    if (!data.name || data.name.trim() === "") {
      toast.error("Category name is required");
      return;
    }

    const jsonData: any = {
      name: data.name,
      slug: data.slug || "",
      description: data.description || "",
      parentCategory:
        data.parentCategory === "none" ? "" : data.parentCategory || "",
      isActive: data.isActive,
    };

    // Send thumbnail ID if available (from upload on file select or existing), otherwise send image URL as fallback
    if (uploadedMediaId) {
      jsonData.thumbnail = uploadedMediaId;
    } else if (data.image) {
      jsonData.image = data.image;
    }

    console.log("Sending JSON data:", jsonData);

    if (finalMode === MODE.ADD) {
      createCategoryMutation.mutate(jsonData);
    } else if (finalMode === MODE.EDIT) {
      updateCategoryMutation.mutate(jsonData);
    }
  };

  // Form field configurations
  const formFields = {
    imageUpload: [
      {
        name: "image_files" as const,
        type: "file" as const,
        label: "Category Image",
        placeholder: "Choose image file",
        accept: "image/*",
        disabled: finalMode === MODE.VIEW,
      },
    ],
    basicInfo: [
      {
        name: "name" as const,
        type: "text" as const,
        label: "Category Name",
        placeholder: "Enter category name",
        required: true,
        disabled: finalMode === MODE.VIEW,
      },
      {
        name: "slug" as const,
        type: "text" as const,
        label: "Slug",
        placeholder: "auto-generated-slug",
        disabled: true,
      },
      {
        name: "description" as const,
        type: "textarea" as const,
        label: "Description",
        placeholder: "Enter category description",
        rows: 3,
        disabled: finalMode === MODE.VIEW,
      },
      {
        name: "parentCategory" as const,
        type: "select" as const,
        label: "Parent Category",
        placeholder: "Select parent category",
        options: [
          { label: "No Parent Category", value: "none" },
          ...parentCategories.map((cat: any) => ({
            label: cat.name,
            value: cat._id,
          })),
        ],
        disabled: finalMode === MODE.VIEW,
      },
      {
        name: "isActive" as const,
        type: "checkbox" as const,
        label: "Active",
        description: "Enable this category",
        disabled: finalMode === MODE.VIEW,
      },
    ],
  };

  if (isLoading && (finalMode === MODE.EDIT || finalMode === MODE.VIEW)) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Fetching category data",
        }}
      >
        <div className="w-full">
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Loading category data...</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  const pageTitle =
    finalMode === MODE.VIEW
      ? "View Product Category"
      : finalMode === MODE.EDIT
        ? "Edit Product Category"
        : "Create Product Category";

  const pageDescription =
    finalMode === MODE.VIEW
      ? "Category details"
      : finalMode === MODE.EDIT
        ? "Update category information"
        : "Add a new product category";

  return (
    <Form {...form}>
      <PageContent
        header={{
          title: pageTitle,
          description: pageDescription,
          actions: (
            <Button
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY)}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          ),
        }}
      >
        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 rounded-xl border bg-white p-8 shadow-sm">
              {/* Category Image Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Category Image
                </h2>
                <div className="flex items-center justify-start gap-6">
                  <div className="flex-shrink-0">{element}</div>
                  <div className="flex-1">
                    <FormFieldsRenderer<CategoryFormData>
                      control={control}
                      fieldConfigs={
                        formFields.imageUpload.map((field) => ({
                          ...field,
                          disabled: finalMode === MODE.VIEW,
                        })) as FormFieldConfig<CategoryFormData>[]
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Category Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Category Information
                </h2>

                <div className="space-y-6">
                  <FormFieldsRenderer<CategoryFormData>
                    control={control}
                    fieldConfigs={
                      formFields.basicInfo.map((field) => ({
                        ...field,
                        disabled: finalMode === MODE.VIEW,
                      })) as FormFieldConfig<CategoryFormData>[]
                    }
                  />
                </div>
              </div>
            </div>
          </form>

          {finalMode !== MODE.VIEW && (
            <div className="mt-6 flex space-x-4">
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
                className="flex-1"
              >
                {createCategoryMutation.isPending
                  ? "Creating..."
                  : updateCategoryMutation.isPending
                    ? "Updating..."
                    : finalMode === MODE.ADD
                      ? "Create Category"
                      : "Update Category"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate(PANEL_ROUTES.MASTER.PRODUCT_CATEGORY)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </PageContent>
    </Form>
  );
}
