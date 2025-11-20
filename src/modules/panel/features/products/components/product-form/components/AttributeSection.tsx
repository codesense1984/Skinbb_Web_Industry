import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import type { FormSectionBaseProps } from "../types";

type AttributeSectionProps = FormSectionBaseProps;

const AttributeSection = ({ control, errors }: AttributeSectionProps) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Key Information</h3>

      <div className="space-y-4">
        <FormInput
          control={control}
          name="ingredients"
          type={INPUT_TYPES.COMBOBOX}
          label="Ingredients"
          placeholder="Select or create ingredients"
          multi={true}
          options={[]} // Will be populated from API
        />

        <FormInput
          control={control}
          name="keyIngredients"
          type={INPUT_TYPES.COMBOBOX}
          label="Key Ingredients"
          placeholder="Select or create key ingredients"
          multi={true}
          options={[]} // Will be populated from API
        />

        <FormInput
          control={control}
          name="benefit"
          type={INPUT_TYPES.COMBOBOX}
          label="Benefits"
          placeholder="Select benefits"
          multi={true}
          options={[]} // Will be populated from API
        />
      </div>
    </div>
  );
};

export default AttributeSection;
