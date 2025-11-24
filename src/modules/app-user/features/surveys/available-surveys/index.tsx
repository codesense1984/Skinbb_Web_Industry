import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { useAvailableSurveys } from "@/modules/survey/hooks";
import { APP_USER_SURVEY_ROUTES } from "@/modules/app-user/routes/constants";
import { FullLoader } from "@/core/components/ui/loader";
import { formatCurrency } from "@/core/utils/number";
import { useNavigate } from "react-router";
import { StatusBadge } from "@/core/components/ui/badge";
import { CurrencyDollarIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AvailableSurveys = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAvailableSurveys({ page, limit: 10 });

  if (isLoading) {
    return <FullLoader />;
  }

  const surveys = data?.data?.surveys || [];
  const pagination = data?.data?.pagination;

  return (
    <PageContent
      header={{
        title: "Available Surveys",
        description: "Take surveys and earn rewards",
      }}
    >
      <div className="space-y-4">
        {surveys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No surveys available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {surveys.map((survey) => (
                <Card key={survey._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{survey.title}</CardTitle>
                      <StatusBadge module="survey" status={survey.status} variant="badge">
                        {survey.status}
                      </StatusBadge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {survey.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {survey.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        Earn {survey.reward} coins
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500 capitalize">
                        {survey.type} Survey
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            survey.isInProgress && survey.inProgressAttemptId
                              ? APP_USER_SURVEY_ROUTES.TAKE(survey._id)
                              : APP_USER_SURVEY_ROUTES.TAKE(survey._id),
                          )
                        }
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        {survey.isInProgress ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageContent>
  );
};

export default AvailableSurveys;




