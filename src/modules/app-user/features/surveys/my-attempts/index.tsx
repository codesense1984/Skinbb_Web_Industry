import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { StatusBadge } from "@/core/components/ui/badge";
import { useMySurveyAttempts } from "@/modules/survey/hooks";
import { APP_USER_SURVEY_ROUTES } from "@/modules/app-user/routes/constants";
import { FullLoader } from "@/core/components/ui/loader";
import { formatDate } from "@/core/utils/date";
import { useNavigate } from "react-router";
import { CurrencyDollarIcon, EyeIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const MyAttempts = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMySurveyAttempts({ page, limit: 10 });

  if (isLoading) {
    return <FullLoader />;
  }

  const attempts = data?.data?.attempts || [];
  const pagination = data?.data?.pagination;

  const groupedAttempts = {
    completed: attempts.filter((a) => a.status === "completed"),
    in_progress: attempts.filter((a) => a.status === "in_progress"),
    abandoned: attempts.filter((a) => a.status === "abandoned"),
  };

  return (
    <PageContent
      header={{
        title: "My Survey Attempts",
        description: "View your survey history and continue incomplete surveys",
      }}
    >
      <div className="space-y-6">
        {/* In Progress */}
        {groupedAttempts.in_progress.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">In Progress</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedAttempts.in_progress.map((attempt) => (
                <Card key={attempt._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {attempt.survey?.title || "Survey"}
                      </CardTitle>
                      <StatusBadge
                        module="survey"
                        status="active"
                        variant="badge"
                      >
                        In Progress
                      </StatusBadge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Started: {formatDate(attempt.startedAt)}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            APP_USER_SURVEY_ROUTES.TAKE(attempt.surveyId),
                          )
                        }
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {groupedAttempts.completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Completed</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedAttempts.completed.map((attempt) => (
                <Card key={attempt._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {attempt.survey?.title || "Survey"}
                      </CardTitle>
                      <StatusBadge
                        module="survey"
                        status="completed"
                        variant="badge"
                      >
                        Completed
                      </StatusBadge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        Earned {attempt.reward} coins
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed: {formatDate(attempt.completedAt || "")}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            APP_USER_SURVEY_ROUTES.ATTEMPT_DETAIL(attempt._id),
                          )
                        }
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Abandoned */}
        {groupedAttempts.abandoned.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Abandoned</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedAttempts.abandoned.map((attempt) => (
                <Card key={attempt._id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">
                        {attempt.survey?.title || "Survey"}
                      </CardTitle>
                      <StatusBadge
                        module="survey"
                        status="paused"
                        variant="badge"
                      >
                        Abandoned
                      </StatusBadge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Abandoned: {formatDate(attempt.abandonedAt || "")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {attempts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">
                You haven't taken any surveys yet.
              </p>
              <Button onClick={() => navigate(APP_USER_SURVEY_ROUTES.AVAILABLE)}>
                Browse Available Surveys
              </Button>
            </CardContent>
          </Card>
        )}

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
      </div>
    </PageContent>
  );
};

export default MyAttempts;



