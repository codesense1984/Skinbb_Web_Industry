import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useSurveyStats, useEligibleRespondents } from "@/modules/survey/hooks";
import { FullLoader } from "@/core/components/ui/loader";
import { formatNumber } from "@/core/utils/number";

interface SurveyStatsTabProps {
  surveyId: string;
}

const SurveyStatsTab = ({ surveyId }: SurveyStatsTabProps) => {
  const { data: statsData, isLoading: isLoadingStats } = useSurveyStats(surveyId);
  const { data: eligibleData, isLoading: isLoadingEligible } =
    useEligibleRespondents(surveyId);

  if (isLoadingStats || isLoadingEligible) {
    return <FullLoader />;
  }

  // API response structure: { statusCode, success, message, data: { totalAttempts, completedAttempts, ... } }
  // React Query returns the API response directly, so statsData = { statusCode, data: { totalAttempts, ... } }
  const stats = statsData?.data;
  // Eligible respondents response: { statusCode, data: { count: number } }
  const eligibleCount = eligibleData?.data?.count || eligibleData?.data?.data?.count || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Attempts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats?.totalAttempts || 0)}</p>
          </CardContent>
        </Card>

        {/* Completed Attempts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(stats?.completedAttempts || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Partial Attempts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Partial Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {formatNumber(stats?.partialAttempts || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.completionRate
                ? `${stats.completionRate.toFixed(1)}%`
                : "0%"}
            </p>
          </CardContent>
        </Card>

        {/* Average Completion Time */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.averageCompletionTime
                ? formatTime(stats.averageCompletionTime)
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Eligible Respondents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Eligible Respondents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(eligibleCount)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyStatsTab;

