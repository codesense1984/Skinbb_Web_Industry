import { FormInput, INPUT_TYPES } from "@/core/components/ui/form-input";
import type { FormSectionBaseProps } from "../types";

type StatusSectionProps = FormSectionBaseProps;

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const StatusSection = ({ control, errors }: StatusSectionProps) => {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Status</h3>

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
