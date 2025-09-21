import { FormInput, INPUT_TYPES } from '@/core/components/ui/form-input';
import type { FormSectionBaseProps } from '../types';

type ImageSectionProps = FormSectionBaseProps;

const ImageSection = ({ control, errors }: ImageSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Images</h3>
      
      <div className="space-y-4">
        <FormInput
          control={control}
          name="images"
          type={INPUT_TYPES.FILE}
          label="Product Images"
          placeholder="Choose product images"
          inputProps={{ accept: 'image/*', multiple: true }}
        />

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

export default ImageSection;

