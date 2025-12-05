import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import { useFormContext, useWatch } from "react-hook-form";
import type { FormSectionBaseProps } from "../../../types/product.types";

type VendorSectionProps = FormSectionBaseProps;

const VendorSection = ({ control, errors }: VendorSectionProps) => {
  const { setValue, getValues } = useFormContext();

  const importedByValue = useWatch({ control, name: "importedBy" });
  const marketedByValue = useWatch({ control, name: "marketedBy" });
  const manufacturedByValue = useWatch({ control, name: "manufacturedBy" });

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Vendor Information</h3>

      <div className="space-y-4">
        <FormInput
          control={control}
          name="brand"
          type={INPUT_TYPES.COMBOBOX}
          label="Brand"
          placeholder="Select a brand"
          options={[]} // Will be populated from API
        />

        <FormInput
          control={control}
          name="aboutTheBrand"
          type={INPUT_TYPES.RICH_TEXT}
          label="About The Brand"
          placeholder="Enter brand description"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            control={control}
            name="marketedBy"
            type={INPUT_TYPES.COMBOBOX}
            label="Marketed By"
            placeholder="Select marketed by"
            options={[]} // Will be populated from API
          />

          <FormInput
            control={control}
            name="marketedByAddress"
            type={INPUT_TYPES.TEXT}
            label="Marketed By Address"
            placeholder="Enter marketed by address"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            control={control}
            name="manufacturedBy"
            type={INPUT_TYPES.COMBOBOX}
            label="Manufactured By"
            placeholder="Select manufactured by"
            options={[]} // Will be populated from API
          />

          <FormInput
            control={control}
            name="manufacturedByAddress"
            type={INPUT_TYPES.TEXT}
            label="Manufactured By Address"
            placeholder="Enter manufactured by address"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            control={control}
            name="importedBy"
            type={INPUT_TYPES.COMBOBOX}
            label="Imported By"
            placeholder="Select imported by"
            options={[]} // Will be populated from API
          />

          <FormInput
            control={control}
            name="importedByAddress"
            type={INPUT_TYPES.TEXT}
            label="Imported By Address"
            placeholder="Enter imported by address"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            control={control}
            name="capturedBy"
            type={INPUT_TYPES.COMBOBOX}
            label="Captured By"
            placeholder="Select captured by"
            options={[]} // Will be populated from API
            disabled
          />

          <FormInput
            control={control}
            name="capturedDate"
            type={INPUT_TYPES.DATEPICKER}
            label="Captured Date"
            placeholder="Select captured date"
            inputProps={{ mode: "single" }}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default VendorSection;
