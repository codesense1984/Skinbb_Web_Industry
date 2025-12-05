import { MODE } from "@/core/types";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useParams, useNavigate } from "react-router";
import {
  UnifiedSurveyForm,
  useSurveyUpdateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";

const SurveyEdit = () => {
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const surveyMutation = useSurveyUpdateMutation(undefined, true); // Skip navigation for payment flow

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
      enablePayment={true}
      disableStatusInEdit={true}
      onPaymentSuccess={() => {
        // Navigate to survey list after successful payment
        navigate(SELLER_ROUTES.MARKETING.SURVEYS.LIST);
      }}
    />
  );
};

export default SurveyEdit;
