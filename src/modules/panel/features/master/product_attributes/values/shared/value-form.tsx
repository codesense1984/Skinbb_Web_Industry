import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Form } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import {
  productAttributeValueFormSchema,
  generateValue,
  type ProductAttributeValueFormData,
} from "./formSchema";
import { useState } from "react";

interface ProductAttributeValueFormProps {
  initialData?: Partial<ProductAttributeValueFormData>;
  onSubmit: (data: ProductAttributeValueFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
  attributeName?: string;
}

export default function ProductAttributeValueForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Value",
  attributeName,
}: ProductAttributeValueFormProps) {
  const [isGeneratingValue, setIsGeneratingValue] = useState(false);

  const form = useForm<ProductAttributeValueFormData>({
    resolver: zodResolver(productAttributeValueFormSchema),
    defaultValues: {
      label: initialData?.label || "",
      value: initialData?.value || "",
    },
  });

  const handleGenerateValue = () => {
    const label = form.getValues("label");
    if (label) {
      setIsGeneratingValue(true);
      const value = generateValue(label);
      form.setValue("value", value);
      setIsGeneratingValue(false);
    }
  };

  const handleSubmit = (data: ProductAttributeValueFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {attributeName ? `${attributeName} Attribute` : "Attribute Value"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Label Field */}
              <div className="space-y-2">
                <label htmlFor="label" className="text-sm font-medium">
                  Attribute Label *
                </label>
                <Input
                  id="label"
                  {...form.register("label")}
                  placeholder="Enter attribute label"
                />
                {form.formState.errors.label && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.label.message}
                  </p>
                )}
              </div>

              {/* Value Field */}
              <div className="space-y-2">
                <label htmlFor="value" className="text-sm font-medium">
                  Attribute Value *
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="value"
                    {...form.register("value")}
                    placeholder="Enter attribute value"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleGenerateValue}
                    disabled={isGeneratingValue || !form.watch("label")}
                  >
                    {isGeneratingValue ? "Generating..." : "Create Value"}
                  </Button>
                </div>
                {form.formState.errors.value && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.value.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
