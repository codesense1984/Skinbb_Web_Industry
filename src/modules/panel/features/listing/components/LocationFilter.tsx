import { useMemo } from "react";
import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Option } from "@/core/types";

interface LocationFilterProps {
  companyId?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LocationFilter = ({
  companyId,
  value,
  onValueChange,
  placeholder = "Select Location",
  disabled = false,
}: LocationFilterProps) => {
  // Memoize the fetcher to prevent recreating it on every render
  const locationFetcher = useMemo(() => {
    if (!companyId || companyId === "all" || companyId === "") {
      return null;
    }
    return createSimpleFetcher(
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
  }, [companyId]);

  // Don't render the component if companyId is not valid
  if (
    !companyId ||
    companyId === "all" ||
    companyId === "" ||
    !locationFetcher
  ) {
    return (
      <div className="flex h-10 w-[150px] items-center rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500">
        {placeholder}
      </div>
    );
  }

  return (
    <PaginationComboBox
      apiFunction={locationFetcher}
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

interface LocationTableFilterProps {
  companyId?: string;
  value?: string;
  onValueChange: (option: Option) => void;
  placeholder?: string;
  disabled?: boolean;
}
export const LocationTableFilter = ({
  companyId,
  value,
  onValueChange,
  placeholder = "Select Location",
  disabled = false,
}: LocationTableFilterProps) => {
  // Memoize the fetcher to prevent recreating it on every render
  const locationFetcher = useMemo(() => {
    if (!companyId || companyId === "all" || companyId === "") {
      return null;
    }
    return createSimpleFetcher(
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
  }, [companyId]);

  // Don't render the component if companyId is not valid
  if (
    !companyId ||
    companyId === "all" ||
    companyId === "" ||
    !locationFetcher
  ) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500">
        {placeholder}
        <ChevronDownIcon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <PaginationComboBox
      apiFunction={locationFetcher}
      transform={(location: CompanyLocation) => ({
        label: `${location.addressLine1} - ${location.city}`,
        value: location._id,
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
        // console.log("🚀 ~ CompanyTableFilter ~ rest:", item);
        // const stringValue = Array.isArray(selectedValue)
        //   ? selectedValue[0]
        //   : selectedValue;
        onValueChange(option as Option);
      }}
      // className="w-[150px]"
      disabled={disabled || !companyId}
      enabled={!!companyId}
      queryKey={["company-locations", companyId]}
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
