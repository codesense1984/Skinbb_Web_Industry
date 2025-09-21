import { FormInput, INPUT_TYPES } from '@/core/components/ui/form-input';
import type { FormSectionBaseProps } from '../types';

type PricingSectionProps = FormSectionBaseProps;

const PricingSection = ({ control, errors }: PricingSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Pricing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="price"
          type={INPUT_TYPES.NUMBER}
          label="Price"
          placeholder="Enter price"
          inputProps={{ step: '0.01', min: '0' }}
        />

        <FormInput
          control={control}
          name="salePrice"
          type={INPUT_TYPES.NUMBER}
          label="Sale Price"
          placeholder="Enter sale price"
          inputProps={{ step: '0.01', min: '0' }}
        />
      </div>
    </div>
  );
};

export default PricingSection;

