import { FormInput, INPUT_TYPES } from '@/core/components/ui/form-input';
import type { FormSectionBaseProps } from '../types';

type InventorySectionProps = FormSectionBaseProps;

const InventorySection = ({ control, errors }: InventorySectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Inventory</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          inputProps={{ min: '0' }}
        />
      </div>

      <div className="mt-4">
        <FormInput
          control={control}
          name="barcodeImage"
          type={INPUT_TYPES.FILE}
          label="Barcode Image"
          placeholder="Choose barcode image"
          inputProps={{ accept: 'image/*' }}
        />
      </div>
    </div>
  );
};

export default InventorySection;

