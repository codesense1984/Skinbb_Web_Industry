import { Button } from "@/core/components/ui/button";
import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import { generateSlug } from "@/modules/panel/features/master/product_attributes/shared/formSchema";
import { useFormContext, useWatch } from "react-hook-form";
import type { FormSectionBaseProps } from "../../../types/product.types";

type GeneralSectionProps = FormSectionBaseProps;

const GeneralSection = ({ control, errors }: GeneralSectionProps) => {
  const nameValue = useWatch({
    control,
    name: "productName",
  });

  const { setValue, getValues } = useFormContext();

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>

      <div className="space-y-4">
        <FormInput
          control={control}
          name="productName"
          type={INPUT_TYPES.TEXT}
          label="Product Name"
          placeholder="Enter product name"
          required
        />

        <div className="space-y-2">
          <FormInput
            control={control}
            name="slug"
            type={INPUT_TYPES.TEXT}
            label="Product Slug"
            placeholder="Enter product slug"
            required
          />
          <Button
            type="button"
            variant="outlined"
            size="sm"
            onClick={() => {
              const slug = generateSlug(nameValue || "");
              setValue("slug", slug);
            }}
          >
            Generate Slug
          </Button>
        </div>

        <FormInput
          control={control}
          name="description"
          type={INPUT_TYPES.RICH_TEXT}
          label="Description"
          placeholder="Enter product description"
        />

        <FormInput
          control={control}
          name="productCategory"
          type={INPUT_TYPES.COMBOBOX}
          label="Category"
          placeholder="Select categories"
          multi={true}
          options={[]} // Will be populated from API
        />

        <FormInput
          control={control}
          name="thumbnail"
          type={INPUT_TYPES.FILE}
          label="Thumbnail"
          placeholder="Choose thumbnail image"
          inputProps={{ accept: "image/*" }}
        />
      </div>
    </div>
  );
};

export default GeneralSection;
