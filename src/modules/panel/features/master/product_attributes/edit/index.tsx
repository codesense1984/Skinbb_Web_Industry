import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/core/components/ui/structure";
import ProductAttributeForm from "../shared/attribute-form";
import { 
  apiGetProductAttributeById, 
  apiUpdateProductAttribute 
} from "@/modules/panel/services/http/product-attribute.service";
import type { ProductAttributeFormData } from "../shared/formSchema";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export default function EditProductAttribute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: attribute, isLoading: isLoadingAttribute } = useQuery({
    queryKey: ["product-attribute", id],
    queryFn: () => apiGetProductAttributeById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductAttributeFormData> }) =>
      apiUpdateProductAttribute(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Product attribute updated successfully");
      navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update product attribute");
    },
  });

  const handleSubmit = (data: ProductAttributeFormData) => {
    if (id) {
      // Add default values for required API fields
      const apiData = {
        ...data,
        dataType: "array" as const,
        fieldType: "multi-select" as const,
        isFilterable: true,
        isRequired: true,
        isVariantField: true,
        placeholder: "",
        sortOrder: 1,
      };
      updateMutation.mutate({ id, data: apiData });
    }
  };

  if (isLoadingAttribute) {
    return (
      <PageContent
        header={{
          title: "Edit Product Attribute",
          description: "Update product attribute details",
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading...</div>
        </div>
      </PageContent>
    );
  }

  if (!attribute?.data) {
    return (
      <PageContent
        header={{
          title: "Edit Product Attribute",
          description: "Update product attribute details",
        }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Attribute not found</h3>
            <p className="text-gray-500">The product attribute you're looking for doesn't exist.</p>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent
      header={{
        title: "Edit Product Attribute",
        description: "Update product attribute details",
      }}
    >
      <div className="max-w-4xl">
        <ProductAttributeForm
          initialData={attribute.data}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          submitLabel="Update Attribute"
          isCreateMode={true}
        />
      </div>
    </PageContent>
  );
}