import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";

interface LocationFilterProps {
  companyId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const locationFilter = (companyId: string) =>
  createSimpleFetcher(
    (params: Record<string, unknown>) => {
      return apiGetCompanyLocations(companyId, {
        page: (params.pageIndex as number) + 1,
        limit: params.pageSize as number,
      });
    },
    {
      dataPath: "data.items",
      totalPath: "data.total",
    },
  );

export const LocationFilter = ({
  companyId,
  value,
  onValueChange,
  placeholder = "Select Location",
  disabled = false,
}: LocationFilterProps) => {
  // Don't render the component if companyId is not valid
  if (!companyId || companyId === "all" || companyId === "") {
    return (
      <div className="flex h-10 w-[150px] items-center rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500">
        {placeholder}
      </div>
    );
  }

  return (
    <PaginationComboBox
      apiFunction={locationFilter(companyId)}
      transform={(location: CompanyLocation) => ({
        label: `${location.addressLine1} - ${location.city}`,
        value: location._id,
      })}
      placeholder={placeholder}
      value={value === "all" ? "" : value}
      onChange={(selectedValue: string | string[]) => {
        const stringValue = Array.isArray(selectedValue)
          ? selectedValue[0]
          : selectedValue;
        onValueChange(stringValue || "all");
      }}
      className="w-[150px]"
      disabled={disabled || !companyId}
      enabled={!!companyId}
      queryKey={["company-locations", companyId]}
    />
  );
};
