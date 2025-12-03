import { MODE } from "@/core/types/base.type";
import type { SurveySubmitRequest } from "@/modules/panel/components/shared/survey/survey-form/types";
import { useParams } from "react-router";
import {
  UnifiedSurveyForm,
  useSurveyCreateMutation,
} from "@/modules/panel/components/shared/survey/survey-form";

const SurveyCreate = () => {
  const { id } = useParams();
  const surveyMutation = useSurveyCreateMutation();

  const handleSubmit = ({ data }: SurveySubmitRequest) => {
    surveyMutation.mutate({
      data,
    });
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
    />
  );
};

export default SurveyCreate;
