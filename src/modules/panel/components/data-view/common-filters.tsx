import { FilterDataItem } from "@/core/components/dynamic-filter";
import { STATUS_MAP } from "@/core/config/status";
import type { Brand, Company } from "@/modules/panel/types";
import type { CompanyLocation } from "@/modules/panel/types/company-location.type";
import type { Customer } from "@/modules/panel/types/customer.type";
import { useMemo } from "react";
import { DEFAULT_PAGE_SIZE, createBrandFilter, companyFilter, createLocationFilter, customerFilter } from "./filters";

// Filter keys constants
export const FILTER_KEYS = {
  STATUS: "status",
  COMPANY: "company",
  BRAND: "brand",
  LOCATION: "location",
  PAYMENT_METHOD: "paymentMethod",
  CUSTOMER: "customer",
} as const;

// Status filter component
interface StatusFilterProps {
  dataKey?: string;
  module: "order" | "product";
  placeholder?: string;
}

export const StatusFilter = ({
  dataKey = FILTER_KEYS.STATUS,
  module,
  placeholder = "Select status...",
}: StatusFilterProps) => {
  const statusOptions =
    module === "order"
      ? Object.values(STATUS_MAP.order)
      : Object.values(STATUS_MAP.product);

  return (
    <FilterDataItem
      dataKey={dataKey}
      type="dropdown"
      mode="single"
      options={statusOptions}
      placeholder={placeholder}
    />
  );
};

// Company filter component
interface CompanyFilterProps {
  dataKey?: string;
  placeholder?: string;
}

export const CompanyFilter = ({
  dataKey = FILTER_KEYS.COMPANY,
  placeholder = "Select company...",
}: CompanyFilterProps) => {
  return (
    <FilterDataItem<"pagination", undefined, Company>
      dataKey={dataKey}
      type="pagination"
      mode="single"
      placeholder={placeholder}
      elementProps={{
        apiFunction: companyFilter,
        transform: (item) => ({
          label: item.companyName,
          value: item._id ?? "",
        }),
        queryKey: ["company-list-filter"],
        pageSize: DEFAULT_PAGE_SIZE,
      }}
    />
  );
};

// Brand filter component (depends on company selection)
interface BrandFilterProps {
  dataKey?: string;
  selectedCompanyId?: string;
  placeholder?: string;
}

export const BrandFilter = ({
  dataKey = FILTER_KEYS.BRAND,
  selectedCompanyId,
  placeholder = "Select brand...",
}: BrandFilterProps) => {
  const brandFilter = useMemo(
    () => createBrandFilter(selectedCompanyId),
    [selectedCompanyId],
  );

  return (
    <FilterDataItem<"pagination", undefined, Brand>
      dataKey={dataKey}
      type="pagination"
      mode="single"
      placeholder={placeholder}
      elementProps={{
        apiFunction: brandFilter,
        transform: (item) => ({
          label: item.name,
          value: item._id ?? "",
        }),
        queryKey: [
          "company-brand-filter",
          ...(selectedCompanyId ? [selectedCompanyId] : []),
        ],
        pageSize: DEFAULT_PAGE_SIZE,
      }}
    />
  );
};

// Location filter component (depends on company selection)
interface LocationFilterProps {
  dataKey?: string;
  selectedCompanyId?: string;
  placeholder?: string;
}

export const LocationFilter = ({
  dataKey = FILTER_KEYS.LOCATION,
  selectedCompanyId,
  placeholder = "Select location...",
}: LocationFilterProps) => {
  const locationFilter = useMemo(
    () => createLocationFilter(selectedCompanyId),
    [selectedCompanyId],
  );

  return (
    <FilterDataItem<"pagination", undefined, CompanyLocation>
      dataKey={dataKey}
      type="pagination"
      mode="single"
      placeholder={placeholder}
      elementProps={{
        apiFunction: locationFilter,
        transform: (item) => ({
          label: `${item.addressLine1} - ${item.city}`,
          value: item._id ?? "",
        }),
        queryKey: [
          "company-location-filter",
          ...(selectedCompanyId ? [selectedCompanyId] : []),
        ],
        pageSize: DEFAULT_PAGE_SIZE,
      }}
    />
  );
};

// Customer filter component
interface CustomerFilterProps {
  dataKey?: string;
  placeholder?: string;
}

export const CustomerFilter = ({
  dataKey = FILTER_KEYS.CUSTOMER,
  placeholder = "Select customer...",
}: CustomerFilterProps) => {
  return (
    <FilterDataItem<"pagination", undefined, Customer>
      dataKey={dataKey}
      type="pagination"
      mode="single"
      placeholder={placeholder}
      elementProps={{
        apiFunction: customerFilter,
        transform: (item) => ({
          label: item.name || item.email || item.phoneNumber || "Unknown Customer",
          value: item._id ?? "",
        }),
        queryKey: ["customer-list-filter"],
        pageSize: DEFAULT_PAGE_SIZE,
      }}
    />
  );
};
