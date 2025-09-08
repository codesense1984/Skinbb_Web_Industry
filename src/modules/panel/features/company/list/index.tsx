import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { StatusFilter } from "@/core/components/data-table/components/table-filter";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { columns } from "./data";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";

// const CompanyForm = lazy(() => import("../components/AddCompanyForm"));

// Super simple! Just pass the API function and data paths
const fetcher = () =>
  createSimpleFetcher(apiGetCompanyList, {
    dataPath: "data.items",
    totalPath: "data.total",
    filterMapping: {
      status: "status", // Map the status column filter to the status API parameter
    },
  });

const CompanyList = () => {
  return (
    <PageContent
      header={{
        title: "Company",
        description: "Discover top brands from around the world.",
        // actions: (
        //   <Button variant="contained" color={"secondary"} startIcon={<PlusIcon/>} aria-label="Add Company">
        //     Add Company
        //   </Button>
        //   // <EntityDialog
        //   //   title="Add Company"
        //   //   description="Fill in the details below to add a new company."
        //   //   triggerLabel="Add Company"
        //   //   FormComponent={CompanyForm}
        //   // />
        // ),
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
        isServerSide
        fetcher={fetcher()}
        queryKeyPrefix={PANEL_ROUTES.COMPANY.LIST}
        actionProps={(tableState) => ({
          children: (
            <StatusFilter
              tableState={tableState}
              module="company"
              multi={false} // Single selection mode
            />
          ),
        })}
      />
    </PageContent>
  );
};

export default CompanyList;
