import { Select } from "@/core/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiGetCompanyLocations } from "@/modules/panel/services/http/company.service";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";

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
  const {
    data: locationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company-locations", companyId],
    queryFn: () =>
      apiGetCompanyLocations<{
        statusCode: number;
        data: {
          items: CompanyLocation[];
          page: number;
          limit: number;
          total: number;
        };
        message: string;
      }>(companyId!, {
        page: 1,
        limit: 100,
      }),
    select: (data) => {
      if (Array.isArray(data?.data?.items)) {
        return data.data.items;
      }
      return [];
    },
    enabled: !!companyId,
    retry: 1,
  });

  const options = [
    { value: "all", label: "All Locations" },
    ...(isLoading
      ? [{ value: "loading", label: "Loading...", disabled: true }]
      : error
        ? [{ value: "error", label: "Error loading locations", disabled: true }]
        : Array.isArray(locationsData)
          ? locationsData.map((location) => ({
              value: location._id,
              label: `${location.addressLine1} - ${location.city}`,
            }))
          : []),
  ];

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      className="w-[150px]"
      disabled={disabled || !companyId}
    />
  );
};
