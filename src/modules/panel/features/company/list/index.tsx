import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { PageContent } from "@/core/components/ui/structure";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { columns } from "./data";
import { Button } from "@/core/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { WithAccess } from "@/modules/auth/components/guard";
import { PAGE, PERMISSION } from "@/modules/auth/types/permission.type.";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";

// const CompanyForm = lazy(() => import("../components/AddCompanyForm"));

// Super simple! Just pass the API function and data paths
const fetcher = createSimpleFetcher(apiGetCompanyList, {
  dataPath: "data.items",
  totalPath: "data.totalRecords",
  filterMapping: {
    companyStatus: "companyStatus", // Map the status column filter to the status API parameter
  },
});

const CompanyList = () => {
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
      {/* <section
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4"
        aria-label="Company Statistics"
      >
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
          />
        ))}
      </section> */}

      <DataTable
        columns={columns}
        isServerSide={true}
        fetcher={fetcher}
        queryKeyPrefix={ENDPOINTS.COMPANY.MAIN}
        actionProps={(tableState) => ({
          children: (
            <StatusFilter
              tableState={tableState}
              module="company"
              multi={true}
              name="companyStatus"
            />
          ),
        })}
      />
    </PageContent>
  );
};

export default CompanyList;
