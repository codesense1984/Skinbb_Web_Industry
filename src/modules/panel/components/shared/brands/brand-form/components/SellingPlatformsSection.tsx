import { Alert } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { FormFieldsRenderer } from "@/core/components/ui/form-input";
import { MODE } from "@/core/types";
import type { Control } from "react-hook-form";
import { useSellingPlatforms } from "../hooks/useSellingPlatforms";
import type { BrandFormData } from "../brand.schema";

interface SellingPlatformsSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
}

export const SellingPlatformsSection: React.FC<
  SellingPlatformsSectionProps
> = ({ control, mode }) => {
  const {
    sellingOn,
    hasDuplicatePlatforms,
    getAvailablePlatformOptions,
    addPlatform,
    removePlatform,
  } = useSellingPlatforms({ control });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Selling Platforms
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Add the platforms where you sell your products
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={addPlatform}
          disabled={mode === MODE.VIEW}
          className="px-4 py-2 text-sm"
        >
          + Add Platform
        </Button>
      </div>

      {sellingOn.map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <FormFieldsRenderer<BrandFormData>
            control={control}
            fieldConfigs={[
              {
                type: "select",
                name: `sellingOn.${index}.platform`,
                label: "Platform",
                placeholder: "Select platform",
                options: getAvailablePlatformOptions(index),
                disabled: mode === MODE.VIEW,
              },
              {
                type: "text",
                name: `sellingOn.${index}.url`,
                label: "URL",
                placeholder: "Enter platform URL",
                disabled: mode === MODE.VIEW,
              },
            ]}
            className="!sm:grid-cols-2 !grid !grid-cols-1 !gap-4"
          />
          {mode !== MODE.VIEW && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outlined"
                color="destructive"
                onClick={() => removePlatform(index)}
                className="px-3 py-1 text-sm"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ))}

      {sellingOn.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>
            No platforms added yet. Click &quot;Add Platform&quot; to get
            started.
          </p>
        </div>
      )}

      {hasDuplicatePlatforms && (
        <Alert
          variant="destructive"
          title="Duplicate Platforms"
          description="You have selected the same platform multiple times. Please choose different platforms for each entry."
        />
      )}

      <Alert
        variant="info"
        title="URL Tips:"
        description={
          <ul className="mt-2 space-y-1">
            <li>
              • Platform URLs: Enter full URLs (e.g.,
              &quot;https://amazon.in&quot;, &quot;https://flipkart.com&quot;)
            </li>
            <li>
              • Social Media URLs: Enter full URLs (e.g.,
              &quot;https://instagram.com/yourbrand&quot;)
            </li>
          </ul>
        }
      />
    </div>
  );
};
