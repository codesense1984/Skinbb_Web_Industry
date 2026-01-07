import { useNavigate, useParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/core/components/ui/structure";
import ProductAttributeValueForm from "../shared/value-form";
import { apiCreateProductAttributeValue } from "@/modules/panel/services/http/product-attribute-value.service";
import type { ProductAttributeValueFormData } from "../shared/formSchema";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

export default function CreateProductAttributeValue() {
  const navigate = useNavigate();
  const { id, name } = useParams<{ id: string; name: string }>();

  if (!id || !name) {
    return (
      <PageContent
        header={{
          title: "Create Attribute Value",
          description: "Add a new attribute value",
        }}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Invalid attribute
            </h3>
            <p className="text-gray-500">
              The attribute ID or name is missing.
            </p>
          </div>
        </div>
      </PageContent>
    );
  }

  const createMutation = useMutation({
    mutationFn: (data: ProductAttributeValueFormData) =>
      apiCreateProductAttributeValue(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Attribute value created successfully");
      navigate(PANEL_ROUTES.MASTER.PRODUCT_ATTRIBUTE_VALUES(id, name));
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create attribute value");
    },
  });

  const handleSubmit = (data: ProductAttributeValueFormData) => {
    // Add default values for required API fields
    const apiData = {
      ...data,
      colorCode: "",
      isActive: true,
    };
    createMutation.mutate(apiData);
  };

  return (
    <PageContent
      header={{
        title: "Create Attribute Value",
        description: `Add a new value for ${name} attribute`,
      }}
    >
      <div className="max-w-4xl">
        <ProductAttributeValueForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          submitLabel="Create Value"
          attributeName={name}
        />
      </div>
    </PageContent>
  );
}
