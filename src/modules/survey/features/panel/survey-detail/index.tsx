import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { PageContent } from "@/core/components/ui/structure";
import { useParams, useNavigate, useLocation } from "react-router";
import { useSurvey } from "@/modules/survey/hooks";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";
import { FullLoader } from "@/core/components/ui/loader";
import SurveyDetailsTab from "./tabs/SurveyDetailsTab";
import SurveyStatsTab from "./tabs/SurveyStatsTab";
import SurveyPaymentTab from "./tabs/SurveyPaymentTab";
import { Button } from "@/core/components/ui/button";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

const SurveyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: surveyData, isLoading, error } = useSurvey(id);

  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");
  const listRoute = isSellerRoute 
    ? SELLER_ROUTES.MARKETING.SURVEYS.LIST 
    : SURVEY_ROUTES.LIST;
  const editRoute = isSellerRoute && id
    ? SELLER_ROUTES.MARKETING.SURVEYS.EDIT(id)
    : id ? SURVEY_ROUTES.EDIT(id) : undefined;

  if (isLoading) {
    return <FullLoader />;
  }

  // Handle error state
  if (error) {
    console.error("Error loading survey:", error);
    return (
      <PageContent
        header={{
          title: "Error Loading Survey",
          description: error instanceof Error ? error.message : "Failed to load survey data.",
        }}
      >
        <Button onClick={() => navigate(listRoute)}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Surveys
        </Button>
      </PageContent>
    );
  }

  // Handle missing data - check multiple possible response structures
  // API response structure: { statusCode, success, message, data: { survey: Survey, questions: Question[] } }
  // React Query returns the API response directly, so surveyData = { statusCode, data: { survey: Survey, questions: Question[] } }
  // So: surveyData.data = { survey: Survey, questions: Question[] }, surveyData.data.survey = Survey
  // Also handle case where data is Survey directly: surveyData.data = Survey
  const apiData = surveyData?.data;
  const survey = apiData?.survey || apiData;
  // Questions are in data.questions, not survey.questions
  const questions = apiData?.questions || survey?.questions || [];
  
  if (!survey || (!survey._id && !survey.id)) {
    console.error("Survey data not found. Response structure:", {
      surveyData,
      apiData,
      extractedSurvey: survey,
    });
    return (
      <PageContent
        header={{
          title: "Survey Not Found",
          description: "The survey you're looking for doesn't exist or you don't have permission to view it.",
        }}
      >
        <Button onClick={() => navigate(listRoute)}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Surveys
        </Button>
      </PageContent>
    );
  }
  
  // Normalize survey ID (handle both _id and id)
  const surveyId = survey._id || survey.id;
  const isPaid = survey.paymentStatus === "paid";
  const canEdit = survey.status === "draft" && !isPaid;
  
  // Merge questions into survey object for the component
  const surveyWithQuestions = {
    ...survey,
    questions: questions.length > 0 ? questions : survey.questions || [],
  };

  return (
    <PageContent
      header={{
        title: survey.title,
        description: survey.description || "Survey details and management",
        actions: (
          <div className="flex gap-2">
            {canEdit && editRoute && (
              <Button
                color="primary"
                onClick={() => navigate(editRoute)}
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Edit Survey
              </Button>
            )}
            {!isSellerRoute && (
              <Button
                color="primary"
                onClick={() => navigate(SURVEY_ROUTES.RESPOND(surveyId))}
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Respond to Survey
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(listRoute)}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
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
          <SurveyDetailsTab survey={surveyWithQuestions} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <SurveyStatsTab surveyId={surveyId} />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <SurveyPaymentTab survey={survey} />
        </TabsContent>
      </Tabs>
    </PageContent>
  );
};

export default SurveyDetail;

