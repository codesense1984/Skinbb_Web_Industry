import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { PageContent } from "@/core/components/ui/structure";
import { useParams, useNavigate } from "react-router";
import { useSurvey } from "@/modules/survey/hooks";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { FullLoader } from "@/core/components/ui/loader";
import SurveyDetailsTab from "./tabs/SurveyDetailsTab";
import SurveyStatsTab from "./tabs/SurveyStatsTab";
import SurveyPaymentTab from "./tabs/SurveyPaymentTab";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const SurveyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surveyData, isLoading } = useSurvey(id);

  if (isLoading) {
    return <FullLoader />;
  }

  if (!surveyData?.data?.data) {
    return (
      <PageContent
        header={{
          title: "Survey Not Found",
          description: "The survey you're looking for doesn't exist.",
        }}
      >
        <Button onClick={() => navigate(SURVEY_ROUTES.LIST)}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Surveys
        </Button>
      </PageContent>
    );
  }

  const survey = surveyData.data.data;

  return (
    <PageContent
      header={{
        title: survey.title,
        description: survey.description || "Survey details and management",
        actions: (
          <Button
            variant="outline"
            onClick={() => navigate(SURVEY_ROUTES.LIST)}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        ),
      }}
    >
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details & Questions</TabsTrigger>
          <TabsTrigger value="stats">Stats & Analytics</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <SurveyDetailsTab survey={survey} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <SurveyStatsTab surveyId={survey._id} />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <SurveyPaymentTab survey={survey} />
        </TabsContent>
      </Tabs>
    </PageContent>
  );
};

export default SurveyDetail;

