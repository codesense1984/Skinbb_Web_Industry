import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate, useLocation } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { PageContent } from "@/core/components/ui/structure";
import {
  apiGetProductCategories,
  apiCreateProductCategory,
  apiUpdateProductCategory,
} from "@/modules/panel/services/http/product.service";
import { categoryFormSchema, type CategoryFormData } from "./formSchema";
import { MODE } from "@/core/types/base.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useImagePreview } from "@/core/hooks/useImagePreview";
import { FormFieldsRenderer, type FormFieldConfig } from "@/core/components/ui/form-input";

interface CategoryFormProps {
  mode?: MODE;
  categoryId?: string;
  onSuccess?: () => void;
}

export default function CategoryForm({ mode: propMode, categoryId: propCategoryId, onSuccess }: CategoryFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Determine mode based on URL path (like brand form)
  let mode = MODE.ADD;
  if (id || propCategoryId) {
    if (pathname.endsWith('/view')) {
      mode = MODE.VIEW;
    } else if (pathname.endsWith('/edit')) {
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

  const { element } = useImagePreview(profileData, existingImageUrl, {
    clear: () => {
      setValue("image_files", undefined);
      setValue("image", "");
    },
  });

  // Fetch parent categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiGetProductCategories({ page: 1, limit: 1000 }),
    enabled: true, // Enable to fetch parent categories
  });

  const parentCategories = useMemo(() => {
    try {
      if (!(categoriesData as any)?.data?.productCategories) return [];
      return (categoriesData as any).data.productCategories.filter((cat: any) => cat.isActive);
    } catch (error) {
      console.error("Error processing parent categories:", error);
      return [];
    }
  }, [categoriesData]);

  // Fetch category data for edit/view mode
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["product-category", finalCategoryId],
    queryFn: () => apiGetProductCategories({ page: 1, limit: 1000 }),
    enabled: !!finalCategoryId && (finalMode === MODE.EDIT || finalMode === MODE.VIEW),
    select: (data: any) => {
      if (!data?.data?.productCategories) return null;
      return data.data.productCategories.find((cat: any) => cat._id === finalCategoryId);
    },
  });

  // Populate form for edit/view mode
  useEffect(() => {
    if (categoryData) {
      console.log("Populating form with category data:", categoryData);
      const imageUrl = categoryData.image || categoryData.imageUrl || categoryData.logo || "";
      
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
      toast.error(error?.response?.data?.message || "Failed to create category");
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
      toast.error(error?.response?.data?.message || "Failed to update category");
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
    
    const jsonData = {
      name: data.name,
      slug: data.slug || "",
      description: data.description || "",
      parentCategory: data.parentCategory === "none" ? "" : (data.parentCategory || ""),
      isActive: data.isActive,
    };

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
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading category data...</p>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    );
  }

  const pageTitle = finalMode === MODE.VIEW ? "View Product Category" : 
                   finalMode === MODE.EDIT ? "Edit Product Category" : 
                   "Create Product Category";

  const pageDescription = finalMode === MODE.VIEW ? "Category details" :
                         finalMode === MODE.EDIT ? "Update category information" :
                         "Add a new product category";

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
            <div className="bg-white rounded-xl border shadow-sm p-8 space-y-8">
              {/* Category Image Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Category Image
                </h2>
                <div className="flex items-center justify-start gap-6">
                  <div className="flex-shrink-0">
                    {element}
                  </div>
                  <div className="flex-1">
                    <FormFieldsRenderer<CategoryFormData>
                      control={control}
                      fieldConfigs={
                        formFields.imageUpload.map(field => ({
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
                      formFields.basicInfo.map(field => ({
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
                    : finalMode === MODE.ADD ? "Create Category" : "Update Category"}
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

