import { createSimpleFetcher } from "@/core/components/data-table";
import { Select } from "@/core/components/ui/select";
import {
  apiGetCompaniesForFilter,
  apiGetCompanyList,
} from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";

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

const companyFilter = createSimpleFetcher(apiGetCompanyList, {
  dataPath: "data.items",
  totalPath: "data.total",
});

export const CompanyFilter = ({
  value,
  onValueChange,
  placeholder = "Select Company",
}: CompanyFilterProps) => {
  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies-filter"],
    queryFn: () =>
      apiGetCompaniesForFilter<
        {
          statusCode: number;
          data: {
            items: Company[];
            page: number;
            limit: number;
            total: number;
          };
          message: string;
        },
        {
          page: number;
          limit: number;
          search?: string;
        }
      >({
        page: 1,
        limit: 100,
      }),
    select: (data) => data?.data?.items || [],
    retry: 1,
  });

  // Format data for Select component
  const options = [
    { value: "all", label: "All Companies" },
    ...(isLoading
      ? [{ value: "loading", label: "Loading...", disabled: true }]
      : error
        ? [{ value: "error", label: "Error loading companies", disabled: true }]
        : companiesData?.map((company) => ({
            value: company._id,
            label: company.companyName,
          })) || []),
  ];

  return (
    <>
      {/* <PaginationComboBoxSimpleTest /> */}
      {/* <PaginationComboBoxExample /> */}

      <Select
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder={placeholder}
        className="w-[150px]"
      />
    </>
  );
};
