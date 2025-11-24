import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { PageContent } from "@/core/components/ui/structure";
import { StatusBadge } from "@/core/components/ui/badge";
import { useSurveyAttempt } from "@/modules/survey/hooks";
import { APP_USER_SURVEY_ROUTES } from "@/modules/app-user/routes/constants";
import { FullLoader } from "@/core/components/ui/loader";
import { formatDate } from "@/core/utils/date";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const AttemptDetail = () => {
  const { id: attemptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useSurveyAttempt(attemptId);

  if (isLoading) {
    return <FullLoader />;
  }

  if (!data?.data?.data) {
    return (
      <PageContent
        header={{
          title: "Attempt Not Found",
          description: "The survey attempt you're looking for doesn't exist.",
        }}
      >
        <Button onClick={() => navigate(APP_USER_SURVEY_ROUTES.MY_ATTEMPTS)}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to My Attempts
        </Button>
      </PageContent>
    );
  }

  const attempt = data.data.data;
  const survey = attempt.survey;
  const questions = attempt.questions || [];

  return (
    <PageContent
      header={{
        title: survey?.title || "Survey Attempt Details",
        description: "View your survey responses",
        actions: (
          <Button
            variant="outline"
            onClick={() => navigate(APP_USER_SURVEY_ROUTES.MY_ATTEMPTS)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Attempt Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Attempt Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge
                    module="survey"
                    status={attempt.status === "completed" ? "completed" : "active"}
                    variant="badge"
                  >
                    {attempt.status}
                  </StatusBadge>
                </div>
              </div>
              {attempt.reward > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reward</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{attempt.reward} coins</span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Started At</label>
                <p className="text-sm font-medium">{formatDate(attempt.startedAt)}</p>
              </div>
              {attempt.completedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Completed At</label>
                  <p className="text-sm font-medium">
                    {formatDate(attempt.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Your Answers ({attempt.answers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const answer = attempt.answers.find(
                  (a) => a.questionId === question._id,
                );
                return (
                  <div key={question._id || index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        Q{index + 1}. {question.questionText}
                      </h4>
                      <span className="text-xs text-gray-500 capitalize">
                        {question.type}
                      </span>
                    </div>
                    <div className="mt-2">
                      {answer ? (
                        <div className="text-sm">
                          {question.type === "Yes/No" ? (
                            <span className="font-medium">
                              {answer.answer ? "Yes" : "No"}
                            </span>
                          ) : (
                            <span className="font-medium">{String(answer.answer)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not answered</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
};

export default AttemptDetail;




