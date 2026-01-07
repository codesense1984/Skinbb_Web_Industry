import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import type { FormSectionBaseProps, ProductAttribute } from "../../../types/product.types";

type MetaFieldSectionProps = FormSectionBaseProps & {
  metaFields: ProductAttribute[];
  selectOptions: Record<string, { label: string; value: string }[]>;
  setSelectOptions: React.Dispatch<
    React.SetStateAction<Record<string, { label: string; value: string }[]>>
  >;
};

const allowedSlugs = [
  "how-to-use",
  "gender",
  "safety-precaution",
  "shelf-life",
  "license-no",
  "claims",
  "certification-applicable",
  "formulation",
];

const MetaFieldSection = ({
  control,
  errors,
  metaFields,
  selectOptions,
  setSelectOptions,
}: MetaFieldSectionProps) => {
  const filteredMetaFields = metaFields.filter((field) =>
    allowedSlugs.includes(field.slug),
  );

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Additional Information</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput

            control={control}
            name="manufacturingDate"
            type={INPUT_TYPES.DATEPICKER}
            label="Manufacturing Date"
            placeholder="Select manufacturing date"
            inputProps={{ mode: "single" }}
          />

          <FormInput
            control={control}
            name="expiryDate"
            type={INPUT_TYPES.DATEPICKER}
            label="Expiry Date"
            placeholder="Select expiry date"
            inputProps={{ mode: "single" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormInput
            control={control}
            name="dimensions.length"
            type={INPUT_TYPES.NUMBER}
            label="Length (cm)"
            placeholder="Enter length"
            inputProps={{ step: "0.01", min: "0" }}
          />

          <FormInput
            control={control}
            name="dimensions.width"
            type={INPUT_TYPES.NUMBER}
            label="Width (cm)"
            placeholder="Enter width"
            inputProps={{ step: "0.01", min: "0" }}
          />

          <FormInput
            control={control}
            name="dimensions.height"
            type={INPUT_TYPES.NUMBER}
            label="Height (cm)"
            placeholder="Enter height"
            inputProps={{ step: "0.01", min: "0" }}
          />
        </div>

        {filteredMetaFields.map((field) => {
          const fieldType = field.fieldType;
          let inputType = INPUT_TYPES.TEXT;
          let multi = false;

          if (fieldType === "single-select") {
            inputType = INPUT_TYPES.SELECT;
          } else if (fieldType === "multi-select") {
            inputType = INPUT_TYPES.SELECT;
            multi = true;
          } else if (fieldType === "rich-textbox") {
            inputType = INPUT_TYPES.RICH_TEXT;
          }

          return (
            <FormInput
              key={field._id}
              control={control}
              name={field.slug}
              type={inputType}
              label={field.name}
              placeholder={
                field.placeholder || `Enter ${field.name.toLowerCase()}`
              }
              required={field.isRequired}
              options={selectOptions[field._id] || []}
              multi={multi}
            />
          );
        })}

        <FormInput
          control={control}
          name="tags"
          type={INPUT_TYPES.COMBOBOX}
          label="Tags"
          placeholder="Select or create tags"
          multi={true}
          options={[]} // Will be populated from API
        />
      </div>
    </div>
  );
};

export default MetaFieldSection;
