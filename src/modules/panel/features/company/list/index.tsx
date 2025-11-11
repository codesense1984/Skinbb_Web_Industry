import {
  DataView,
  type ServerDataFetcher,
} from "@/core/components/data-view";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { columns } from "./data";
import { CompanyCard } from "./CompanyCard";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { WithAccess } from "@/modules/auth/components/guard";
import { PAGE, PERMISSION } from "@/modules/auth/types/permission.type.";
import {
  DEFAULT_PAGE_SIZE,
  StatusFilter,
} from "@/modules/panel/components/data-view";
import type { CompanyListItem } from "@/modules/panel/types/company.type";
import type { PaginationParams } from "@/core/types";
import { useMemo } from "react";

// Company fetcher for DataView component
const createCompanyFetcher = (): ServerDataFetcher<CompanyListItem> => {
  return async ({
    pageIndex,
    pageSize,
    sorting,
    globalFilter,
    filters,
    signal,
  }) => {
    const params: PaginationParams = {
      page: pageIndex + 1, // API uses 1-based pagination
      limit: pageSize,
    };

    if (globalFilter) {
      params.search = globalFilter;
    }

    if (sorting.length > 0) {
      params.sortBy = sorting[0].id;
      params.order = sorting[0].desc ? "desc" : "asc";
    }

    // Map filters to API params
    if (filters.status?.[0]?.value) {
      params.companyStatus = filters.status[0].value;
    }

    const response = await apiGetCompanyList(params, signal);

    if (response && typeof response === "object" && "data" in response) {
      const responseData = response.data as {
        items?: CompanyListItem[];
        totalRecords?: number;
      };
      return {
        rows: responseData?.items || [],
        total: responseData?.totalRecords || 0,
      };
    }

    return { rows: [], total: 0 };
  };
};

const CompanyList = () => {
  const companyFetcher = useMemo(() => createCompanyFetcher(), []);

  return (
    <PageContent
      header={{
        title: "Company",
        description: "Discover top brands from around the world.",
        actions: (
          <WithAccess page={PAGE.COMPANIES} actions={PERMISSION.CREATE}>
            <Button
              variant="contained"
              color={"secondary"}
              startIcon={<PlusIcon />}
              aria-label="Add Company"
              asChild
            >
              <Link to={PANEL_ROUTES.ONBOARD.COMPANY_CREATE}>Add Company</Link>
            </Button>
          </WithAccess>
        ),
      }}
    >
      <DataView<CompanyListItem>
        fetcher={companyFetcher}
        columns={columns}
        renderCard={(company) => <CompanyCard company={company} />}
        gridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        filters={<StatusFilter module="company" />}
        defaultViewMode="table"
        defaultPageSize={DEFAULT_PAGE_SIZE}
        enableUrlSync={false}
        queryKeyPrefix={PANEL_ROUTES.COMPANY.LIST}
        searchPlaceholder="Search companies..."
      />
    </PageContent>
  );
};

export default CompanyList;
