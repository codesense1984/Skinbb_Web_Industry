import { FormInput, INPUT_TYPES } from '@/core/components/ui/form-input';
import type { FormSectionBaseProps } from '../types';

type StatusSectionProps = FormSectionBaseProps;

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

const StatusSection = ({ control, errors }: StatusSectionProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Status</h3>
      
      <FormInput
        control={control}
        name="status"
        type={INPUT_TYPES.SELECT}
        label="Product Status"
        placeholder="Select status"
        options={statusOptions}
      />
    </div>
  );
};

export default StatusSection;

