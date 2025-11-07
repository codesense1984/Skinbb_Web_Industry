import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetBrands } from "@/modules/panel/services/http/brand.service";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Option } from "@/core/types";

interface BrandFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  companyId?: string;
}

// Create a dynamic fetcher that includes companyId when provided
const createBrandFilter = (companyId?: string) => {
  return createSimpleFetcher(
    (params: Record<string, unknown>) => {
      const filterParams = {
        ...params,
        ...(companyId && { companyId }),
      };
      return apiGetBrands(filterParams);
    },
    {
      dataPath: "data.brands",
      totalPath: "data.totalRecords",
    },
  );
};

export const BrandFilter = ({
  value,
  onValueChange,
  placeholder = "Select Brand",
  companyId,
}: BrandFilterProps) => {
  const brandFilter = createBrandFilter(companyId);

  return (
    <PaginationComboBox
      apiFunction={brandFilter}
      transform={(brand: { _id: string; name: string }) => ({
        label: brand.name,
        value: brand._id, // Use brand ID instead of name
      })}
      placeholder={placeholder}
      value={value === "all" ? "" : value}
      onChange={(selectedValue: string | string[]) => {
        const stringValue = Array.isArray(selectedValue)
          ? selectedValue[0]
          : selectedValue;
        onValueChange(stringValue || "all");
      }}
      // className="w-[150px]"
      queryKey={["brands-filter", companyId || "all"]}
      emptyMessage="No brands found"
      enabled={true} // Always enabled, but will filter by companyId if provided
      renderButton={() => {
        return (
          <div className="flex w-full items-center justify-between gap-2">
            {placeholder}
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        );
      }}
    />
  );
};

interface BrandTableFilterProps {
  value?: string;
  onValueChange: (option: Option) => void;
  placeholder?: string;
  companyId?: string;
}

export const BrandTableFilter = ({
  value,
  onValueChange,
  placeholder = "Select Brand",
  companyId,
}: BrandTableFilterProps) => {
  const brandFilter = createBrandFilter(companyId);

  return (
    <PaginationComboBox
      apiFunction={brandFilter}
      transform={(brand: { _id: string; name: string }) => ({
        label: brand.name,
        value: brand._id, // Use brand ID instead of name
      })}
      placeholder={placeholder}
      value={value === "all" ? "" : value}
      // onChange={(selectedValue: string | string[]) => {
      //   const stringValue = Array.isArray(selectedValue)
      //     ? selectedValue[0]
      //     : selectedValue;
      //   onValueChange(stringValue || "all");
      // }}
      onChange={(_selectedValue, option) => {
        onValueChange(option as Option);
      }}
      // className="w-[150px]"
      queryKey={["brands-filter", companyId || "all"]}
      emptyMessage="No brands found"
      enabled={true} // Always enabled, but will filter by companyId if provided
      renderButton={() => {
        return (
          <div className="flex w-full items-center justify-between gap-2">
            {placeholder}
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        );
      }}
    />
  );
};
