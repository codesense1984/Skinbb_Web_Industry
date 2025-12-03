import { MODE } from "@/core/types";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useParams } from "react-router";
import {
  UnifiedSurveyForm,
  useSurveyUpdateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";

const SurveyEdit = () => {
  const { id: surveyId } = useParams();
  const surveyMutation = useSurveyUpdateMutation();

  const handleSubmit = ({ surveyId, data }: SurveySubmitRequest) => {
    if (!surveyId) {
      console.error("Missing surveyId");
      return;
    }
    surveyMutation.mutate({
      surveyId,
      data,
    });
  };

  return (
    <UnifiedSurveyForm
      mode={MODE.EDIT}
      title="Edit Survey"
      description="Update survey information and details"
      surveyId={surveyId}
      onSubmit={handleSubmit}
      submitting={surveyMutation.isPending}
    />
  );
};

export default SurveyEdit;

