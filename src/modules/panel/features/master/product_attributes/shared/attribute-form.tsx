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
import { FormInput } from "@/core/components/ui/form-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Input } from "@/core/components/ui/input";
import {
  productAttributeFormSchema,
  generateSlug,
  type ProductAttributeFormData,
} from "./formSchema";
import { useState } from "react";

interface ProductAttributeFormProps {
  initialData?: Partial<ProductAttributeFormData>;
  onSubmit: (data: ProductAttributeFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
  isCreateMode?: boolean;
}

export default function ProductAttributeForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Attribute",
  isCreateMode = false,
}: ProductAttributeFormProps) {
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  const form = useForm<ProductAttributeFormData>({
    resolver: zodResolver(productAttributeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      dataType: initialData?.dataType || "array",
      fieldType: initialData?.fieldType || "multi-select",
      isFilterable: initialData?.isFilterable || false,
      isRequired: initialData?.isRequired || false,
      isVariantField: initialData?.isVariantField || true,
      placeholder: initialData?.placeholder || "",
      sortOrder: initialData?.sortOrder || 1,
    },
  });

  const handleGenerateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      setIsGeneratingSlug(true);
      const slug = generateSlug(name);
      form.setValue("slug", slug);
      setIsGeneratingSlug(false);
    }
  };

  const handleSubmit = (data: ProductAttributeFormData) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attribute Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name Field */}
              <FormInput
                control={form.control}
                name="name"
                label="Attribute Name"
                placeholder="Enter attribute name"
                required
              />

              {/* Slug Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug *</label>
                <div className="flex space-x-2">
                  <Input
                    {...form.register("slug")}
                    placeholder="Enter attribute slug"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleGenerateSlug}
                    disabled={isGeneratingSlug || !form.watch("name")}
                  >
                    {isGeneratingSlug ? "Generating..." : "Create Slug"}
                  </Button>
                </div>
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              {/* Only show other fields if not in create mode */}
              {!isCreateMode && (
                <>
                  {/* Data Type */}
                  <FormInput
                    control={form.control}
                    name="dataType"
                    label="Data Type"
                    required
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {/* Field Type */}
                  <FormInput
                    control={form.control}
                    name="fieldType"
                    label="Field Type"
                    required
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multi-select">
                            Multi Select
                          </SelectItem>
                          <SelectItem value="single-select">
                            Single Select
                          </SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {/* Placeholder */}
                  <FormInput
                    control={form.control}
                    name="placeholder"
                    label="Placeholder"
                    placeholder="Enter placeholder text"
                  />

                  {/* Sort Order */}
                  <FormInput
                    control={form.control}
                    name="sortOrder"
                    label="Sort Order"
                    type="number"
                    min="0"
                  />
                </>
              )}
            </div>

            {/* Only show checkboxes if not in create mode */}
            {!isCreateMode && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFilterable"
                    checked={form.watch("isFilterable")}
                    onCheckedChange={(checked) =>
                      form.setValue("isFilterable", !!checked)
                    }
                  />
                  <label htmlFor="isFilterable" className="text-sm font-medium">
                    Is Filterable
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRequired"
                    checked={form.watch("isRequired")}
                    onCheckedChange={(checked) =>
                      form.setValue("isRequired", !!checked)
                    }
                  />
                  <label htmlFor="isRequired" className="text-sm font-medium">
                    Is Required
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVariantField"
                    checked={form.watch("isVariantField")}
                    onCheckedChange={(checked) =>
                      form.setValue("isVariantField", !!checked)
                    }
                  />
                  <label
                    htmlFor="isVariantField"
                    className="text-sm font-medium"
                  >
                    Is Variant Field
                  </label>
                </div>
              </div>
            )}

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
