import { createSimpleFetcher, DataTable } from "@/core/components/data-table";
import { PageContent } from "@/core/components/ui/structure";
import { apiGetCompanyList } from "@/modules/panel/services/http/company.service";
import { columns } from "./data";

// const CompanyForm = lazy(() => import("../components/AddCompanyForm"));

// Super simple! Just pass the API function and data paths
const fetcher = () =>
  createSimpleFetcher(apiGetCompanyList, {
    dataPath: "data.data",
    totalPath: "data.totalRecords",
  });

const CompanyList = () => {
  return (
    <PageContent
      header={{
        title: "Company",
        description: "Discover top brands from around the world.",
        // actions: (
        // <EntityDialog
        //   title="Add Company"
        //   description="Fill in the details below to add a new company."
        //   triggerLabel="Add Company"
        //   FormComponent={CompanyForm}
        // />
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
        queryKeyPrefix="company-list-table"
      />
    </PageContent>
  );
};

export default CompanyList;
