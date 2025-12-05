import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import type { FormSectionBaseProps } from "../../../types/product.types";

type PricingSectionProps = FormSectionBaseProps;

const PricingSection = ({ control, errors }: PricingSectionProps) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Pricing</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          control={control}
          name="price"
          type={INPUT_TYPES.NUMBER}
          label="Price"
          placeholder="Enter price"
          inputProps={{ step: "0.01", min: "0" }}
        />

        <FormInput
          control={control}
          name="salePrice"
          type={INPUT_TYPES.NUMBER}
          label="Sale Price"
          placeholder="Enter sale price"
          inputProps={{ step: "0.01", min: "0" }}
        />
      </div>
    </div>
  );
};

export default PricingSection;
