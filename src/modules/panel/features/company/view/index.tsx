import { StatusBadge } from "@/core/components/ui/badge";
import { Card, CardContent } from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { ENDPOINTS } from "@/modules/panel/config/endpoint.config";
import { apiGetCompanyDetailById } from "@/modules/panel/services/http/company.service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const CompanyView = () => {
  const { id } = useParams();

  const {
    data: companyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [ENDPOINTS.COMPANY.DETAIL(id!)],
    queryFn: () => apiGetCompanyDetailById(id!),
    enabled: !!id,
  });

  const company = companyData?.data;

  return (
    <PageContent
      header={{
        title: "Company Details",
        description: "View company details",
        // actions: (
        //   <Button variant="outlined" color="secondary">
        //     Edit Company
        //   </Button>
        // ),
      }}
      error={error}
      loading={isLoading}
    >
      {company && (
        <Card>
          <CardContent>
            <div className="flex items-start gap-6">
              {/* {company?.brandLogo && (
                <div className="flex-shrink-0">
                  <img
                    src={company?.brandLogo}
                    alt={`${company?.companyName} logo`}
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                </div>
              )} */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-foreground text-2xl font-bold">
                    {company.companyName}
                  </h1>
                  {/* <StatusBadge
                    module={"company"}
                    variant="contained"
                    status={currentLocation?.status}
                  /> */}
                </div>

                {/* {company.companyDescription && (
                  <p className="mt-2 text-sm text-gray-600">
                    {company.companyDescription}
                  </p>
                )} */}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContent>
  );
};

export default CompanyView;
