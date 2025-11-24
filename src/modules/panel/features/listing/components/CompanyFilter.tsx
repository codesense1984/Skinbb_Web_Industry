import { PaginationComboBox } from "@/core/components/ui/pagination-combo-box";
import { createSimpleFetcher } from "@/core/components/data-table";
import { apiGetCompaniesForFilter } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { Select } from "@/core/components/ui/select";

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
