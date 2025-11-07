import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCompaniesForFilter } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { Select } from "@/core/components/ui/select";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Option } from "@/core/types";

interface Company {
  _id: string;
  companyName: string;
  status: string;
}

interface CompanyFilterProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const companyFilter = createSimpleFetcher(apiGetCompaniesForFilter, {
  dataPath: "data.items",
  totalPath: "data.total",
});

export const CompanyFilter = ({
  value,
  onValueChange,
  placeholder = "Select Company",
}: CompanyFilterProps) => {
  return (
    <PaginationComboBox
      apiFunction={companyFilter}
      transform={(company: Company) => ({
        label: company.companyName,
        value: company._id,
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
      queryKey={["companies-filter"]}
    />
  );
};

interface CompanyTableFilterProps {
  value?: string;
  onValueChange: (option: Option) => void;
  placeholder?: string;
}

export const CompanyTableFilter = ({
  value,
  onValueChange,
  placeholder = "Select Company",
}: CompanyTableFilterProps) => {
  return (
    <PaginationComboBox
      apiFunction={companyFilter}
      transform={(company: Company) => ({
        label: company.companyName,
        value: company._id,
      })}
      placeholder={placeholder}
      value={value === "all" ? "" : value}
      onChange={(_selectedValue, option) => {
        // console.log("🚀 ~ CompanyTableFilter ~ rest:", item);
        // const stringValue = Array.isArray(selectedValue)
        //   ? selectedValue[0]
        //   : selectedValue;
        onValueChange(option as Option);
      }}
      // className="w-[150px]"
      queryKey={["companies-filter"]}
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
