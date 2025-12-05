import { MODE } from "@/core/types/base.type";
import {
  UnifiedSurveyForm,
  useSurveyCreateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useNavigate, useParams } from "react-router";
import { PANEL_ROUTES } from "../../routes/constant";

const SurveyCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const surveyMutation = useSurveyCreateMutation(undefined, true); // Skip navigation for payment flow

  const handleSubmit = async ({ data }: SurveySubmitRequest) => {
    return new Promise<{ surveyId: string; survey?: any }>(
      (resolve, reject) => {
        surveyMutation.mutate(
          {
            data,
          },
          {
            onSuccess: (response) => {
              resolve({
                surveyId: response.surveyId || response.data.survey._id,
                survey: response.survey || response.data.survey,
              });
              navigate(PANEL_ROUTES.SURVEY.LIST);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      },
    );
  };

  const mode = MODE.ADD;

  return (
    <UnifiedSurveyForm
      mode={mode}
      title="Create New Survey"
      description="Design your survey, define your audience, and gather insights"
      surveyId={id || undefined}
      onSubmit={handleSubmit}
      submitting={surveyMutation.isPending}
      enablePayment={false}
      onPaymentSuccess={(survey) => {
        // Navigate after successful payment
        // You can customize this navigation
        console.log("Payment successful for survey:", survey);
      }}
    />
  );
};

export default SurveyCreate;
