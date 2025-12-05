import { MODE } from "@/core/types/base.type";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useParams, useNavigate } from "react-router";
import {
  UnifiedSurveyForm,
  useSurveyCreateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";
import { SELLER_ROUTES } from "@/modules/seller/routes/constant";

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
                survey: response.survey || response.data,
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

  const mode = MODE.ADD;

  return (
    <UnifiedSurveyForm
      mode={mode}
      title="Create New Survey"
      description="Design your survey, define your audience, and gather insights"
      surveyId={id || undefined}
      onSubmit={handleSubmit}
      submitting={surveyMutation.isPending}
      enablePayment={true}
      onPaymentSuccess={() => {
        // Navigate to survey list after successful payment
        navigate(SELLER_ROUTES.MARKETING.SURVEYS.LIST);
      }}
    />
  );
};

export default SurveyCreate;
