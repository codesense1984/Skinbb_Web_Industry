import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import type { FormSectionBaseProps } from "../types";

type InventorySectionProps = FormSectionBaseProps;

const InventorySection = ({ control, errors }: InventorySectionProps) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Inventory</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          control={control}
          name="sku"
          type={INPUT_TYPES.TEXT}
          label="SKU"
          placeholder="Enter SKU"
        />

        <FormInput
          control={control}
          name="quantity"
          type={INPUT_TYPES.NUMBER}
          label="Quantity"
          placeholder="Enter quantity"
          inputProps={{ min: "0" }}
        />
      </div>

      <div className="mt-4">
        <FormInput
          control={control}
          name="barcodeImage"
          type={INPUT_TYPES.FILE}
          label="Barcode Image"
          placeholder="Choose barcode image"
          inputProps={{ accept: "image/*" }}
        />
      </div>
    </div>
  );
};

export default InventorySection;
