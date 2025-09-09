import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetProductTags, apiCreateProductTag, apiUpdateProductTag } from "@/modules/panel/services/http/product.service";
import { tagFormSchema, type TagFormData } from "./formSchema";
import { MODE } from "@/core/types/base.type";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  FormInput,
  INPUT_TYPES,
} from "@/core/components/ui/form-input";

export default function TagForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const isView = window.location.pathname.includes('/view');
  const mode = isView ? MODE.VIEW : (isEdit ? MODE.EDIT : MODE.ADD);

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
    },
  });

  const { handleSubmit, watch, setValue, control } = form;

  // Auto-generate slug from name
  const watchedName = watch("name");
  useEffect(() => {
    if (watchedName && !isEdit) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [watchedName, setValue, isEdit]);

  // Fetch tag data for edit mode
  const { data: tagData, isLoading } = useQuery({
    queryKey: ["product-tag", id],
    queryFn: () => apiGetProductTags({ page: 1, limit: 1000 }),
    enabled: isEdit || isView,
    select: (data: any) => {
      if (!data?.data?.productTags) return null;
      return data.data.productTags.find((tag: any) => tag._id === id);
    },
  });

  // Populate form for edit/view mode
  useEffect(() => {
    if (tagData && (isEdit || isView)) {
      form.reset({
        name: tagData.name || "",
        slug: tagData.slug || "",
        description: tagData.description || "",
        color: tagData.color || "#3B82F6",
        isActive: tagData.isActive ?? true,
      });
    }
  }, [tagData, isEdit, isView, form]);

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: (data: TagFormData) => apiCreateProductTag(data),
    onSuccess: () => {
      toast.success("Tag created successfully");
      navigate(PANEL_ROUTES.MASTER.PRODUCT_TAG);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create tag");
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: (data: TagFormData) => apiUpdateProductTag(id!, data),
    onSuccess: () => {
      toast.success("Tag updated successfully");
      navigate(PANEL_ROUTES.MASTER.PRODUCT_TAG);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update tag");
    },
  });

  const onSubmit = (data: TagFormData) => {
    if (isEdit) {
      updateTagMutation.mutate(data);
    } else {
      createTagMutation.mutate(data);
    }
  };

  const pageTitle = isView ? "View Tag" : (isEdit ? "Edit Tag" : "Add Tag");
  const submitText = isEdit ? "Update Tag" : "Create Tag";

  if (isLoading) {
    return (
      <PageContent
        header={{
          title: "Loading...",
          description: "Loading tag details",
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: pageTitle,
        description: isEdit ? "Edit tag details" : "Create a new product tag",
        actions: (
          <Button
            variant="outlined"
            onClick={() => navigate(PANEL_ROUTES.MASTER.PRODUCT_TAG)}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Tags
          </Button>
        ),
      }}
    >
      <div className="w-full">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Tag Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  name="name"
                  type={INPUT_TYPES.TEXT}
                  control={control}
                  label="Tag Name"
                  placeholder="Enter tag name"
                  disabled={mode === MODE.VIEW}
                  required
                />

                <div className="space-y-2">
                  <FormInput
                    name="slug"
                    type={INPUT_TYPES.TEXT}
                    control={control}
                    label="Tag Slug"
                    placeholder="tag-slug"
                    disabled={mode === MODE.VIEW}
                    required
                  />
                  {mode !== MODE.VIEW && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      onClick={() => {
                        const name = watch("name");
                        if (name) {
                          const slug = name
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();
                          setValue("slug", slug);
                        }
                      }}
                    >
                      Generate from Name
                    </Button>
                  )}
                </div>
              </div>

              <FormInput
                name="description"
                type={INPUT_TYPES.TEXTAREA}
                control={control}
                label="Description"
                placeholder="Enter tag description"
                disabled={mode === MODE.VIEW}
                inputProps={{ rows: 3 }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormInput
                    name="color"
                    type={INPUT_TYPES.TEXT}
                    control={control}
                    label="Color"
                    placeholder="#3B82F6"
                    disabled={mode === MODE.VIEW}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={watch("color")}
                      onChange={(e) => setValue("color", e.target.value)}
                      disabled={mode === MODE.VIEW}
                      className="w-8 h-8 rounded border"
                    />
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: watch("color") }}
                    />
                    <span className="text-sm text-gray-500">
                      Color preview
                    </span>
                  </div>
                </div>

                <div className="flex items-center">
                  <FormInput
                    name="isActive"
                    type={INPUT_TYPES.CHECKBOX}
                    control={control}
                    label="Active Status"
                    disabled={mode === MODE.VIEW}
                    description="Turning this off will remove this tag from every section."
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>

        {mode !== MODE.VIEW && (
          <div className="flex space-x-4 mt-6">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createTagMutation.isPending || updateTagMutation.isPending}
              className="flex-1"
            >
              {createTagMutation.isPending ? "Creating..." : 
               updateTagMutation.isPending ? "Updating..." : 
               submitText}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(PANEL_ROUTES.MASTER.PRODUCT_TAG)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </PageContent>
  );
}
