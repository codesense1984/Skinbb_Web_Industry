import { MODE } from "@/core/types";
import { useParams } from "react-router";
import { UnifiedSurveyForm } from "@/modules/panel/components/shared/survey/survey-form";

const SurveyView = () => {
  const { id: surveyId } = useParams();

  return (
    <UnifiedSurveyForm
      mode={MODE.VIEW}
      title="View Survey"
      description="View survey information and details"
      surveyId={surveyId}
    />
  );
};

export default SurveyView;

