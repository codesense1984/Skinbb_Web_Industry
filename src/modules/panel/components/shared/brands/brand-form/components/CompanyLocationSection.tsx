import { FormInput } from "@/core/components/ui/form-input";
import PaginationComboBox from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { MODE } from "@/core/types";
import {
  apiGetCompaniesForFilter,
  apiGetCompanyLocations,
} from "@/modules/panel/services/http/company.service";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { BrandFormData } from "../brand.schema";

interface CompanyLocationSectionProps {
  control: Control<BrandFormData>;
  mode: MODE;
  companyId?: string;
  locationId?: string;
}

export const CompanyLocationSection: React.FC<CompanyLocationSectionProps> = ({
  control,
  mode,
  companyId: propCompanyId,
  locationId: propLocationId,
}) => {
  const watchedCompanyId = useWatch({ control, name: "company_id" });

  if (mode === MODE.ADD) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Company & Location
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            control={control}
            name="company_id"
            type="custom"
            label="Company"
            placeholder="Select company"
            required
            render={({ field }) => (
              <PaginationComboBox
                apiFunction={createSimpleFetcher(apiGetCompaniesForFilter, {
                  dataPath: "data.items",
                  totalPath: "data.totalRecords",
                })}
                transform={(company: { _id: string; companyName: string }) => ({
                  label: company.companyName,
                  value: company._id,
                })}
                placeholder="Select company"
                value={field.value || ""}
                queryKey={["companies-for-brand-form"]}
                pageSize={100}
                disabled={!!propCompanyId}
                onChange={(value) => {
                  const newValue = value as string;
                  field.onChange(newValue);
                  field.onBlur();
                }}
              />
            )}
          />
          <FormInput
            control={control}
            name="location_id"
            type="custom"
            label="Location"
            placeholder="Select location"
            required
            render={({ field }) => (
              <PaginationComboBox
                apiFunction={createSimpleFetcher(
                  (params: Record<string, unknown>) =>
                    apiGetCompanyLocations(watchedCompanyId!, {
                      page: (params.pageIndex as number) + 1,
                      limit: params.pageSize as number,
                    }),
                  {
                    dataPath: "data.items",
                    totalPath: "data.totalRecords",
                  },
                )}
                pageSize={100}
                enabled={!!watchedCompanyId}
                transform={(company: {
                  _id: string;
                  addressLine1: string;
                  city: string;
                }) => ({
                  label: `${company.addressLine1} - ${company.city}`,
                  value: company._id,
                })}
                placeholder="Select location"
                value={field.value || ""}
                queryKey={[
                  "company-locations-for-brand-form",
                  watchedCompanyId,
                ]}
                disabled={!!propCompanyId && !!propLocationId}
                onChange={(value) => {
                  const newValue = value as string;
                  field.onChange(newValue);
                  field.onBlur();
                }}
              />
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Company & Location
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          control={control}
          name="companyName"
          type="text"
          label="Company"
          placeholder="Enter company"
          disabled
          required
        />
        <FormInput
          control={control}
          name="locationAddress"
          type="text"
          label="Location"
          placeholder="Enter location"
          disabled
          required
        />
      </div>
    </div>
  );
};
