import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/core/components/ui/structure";
import ProductAttributeForm from "../shared/attribute-form";
import { apiCreateProductAttribute } from "@/modules/panel/services/http/product-attribute.service";
import type { ProductAttributeFormData } from "../shared/formSchema";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export default function CreateProductAttribute() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: apiCreateProductAttribute,
    onSuccess: (response) => {
      toast.success(response.message || "Product attribute created successfully");
      navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create product attribute");
    },
  });

  const handleSubmit = (data: ProductAttributeFormData) => {
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
    createMutation.mutate(apiData);
  };

  return (
    <PageContent
      header={{
        title: "Create Product Attribute",
        description: "Add a new product attribute to the system",
      }}
    >
      <div className="max-w-4xl">
        <ProductAttributeForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="Create Attribute"
          isCreateMode={true}
        />
      </div>
    </PageContent>
  );
}