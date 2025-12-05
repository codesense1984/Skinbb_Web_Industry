import { MODE } from "@/core/types";
import {
  UnifiedSurveyForm,
  useSurveyUpdateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useNavigate, useParams } from "react-router";
import { PANEL_ROUTES } from "../../routes/constant";

const SurveyEdit = () => {
  const { id: surveyId } = useParams();
  const surveyMutation = useSurveyUpdateMutation();
  const navigate = useNavigate();

  const handleSubmit = async ({ surveyId, data }: SurveySubmitRequest) => {
    return new Promise<{ surveyId: string; survey?: any }>(
      (resolve, reject) => {
        if (!surveyId) {
          console.error("Missing surveyId");
          reject(new Error("Missing surveyId"));
          return;
        }
        surveyMutation.mutate(
          {
            surveyId,
            data,
          },
          {
            onSuccess: (response) => {
              resolve({
                surveyId: surveyId,
                survey: response.survey,
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

  return (
    <UnifiedSurveyForm
      mode={MODE.EDIT}
      title="Edit Survey"
      description="Update survey information and details"
      surveyId={surveyId}
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

export default SurveyEdit;
