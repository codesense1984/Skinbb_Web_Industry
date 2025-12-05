import { StatusBadge } from "@/core/components/ui/badge";
import { formatDate } from "@/core/utils";
import type { Survey } from "@/modules/panel/types/survey.types";
import type { FC } from "react";
import { SurveyActions } from "./surveyColumns";

interface SurveyCardProps {
  survey: Survey;
  viewUrl?: (id: string) => string;
  editUrl?: (id: string) => string;
  handleDeleteSurvey?: (id: string) => void;
  isAdmin?: boolean;
}

export const SurveyCard: FC<SurveyCardProps> = ({
  survey,
  handleDeleteSurvey,
  viewUrl,
  editUrl,
  isAdmin = false,
}) => {
  return (
    <article className="bg-card ring-primary/50 hover:ring-primary flex h-full w-full flex-col rounded-xl p-5 shadow-md ring-1 transition hover:ring-1">
      <div className="flex items-start justify-between">
        <h3 className="text-lg leading-snug font-semibold text-gray-900">
          {survey.title}
        </h3>
        <SurveyActions
          survey={survey}
          handleDeleteSurvey={handleDeleteSurvey}
          viewUrl={viewUrl}
          editUrl={editUrl}
          isAdmin={isAdmin}
        />
      </div>

      <p className="mt-1 line-clamp-2 grow">{survey.description}</p>

      <div>
        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-2">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Start Date</div>
            <div className="font-medium">
              {formatDate(survey.startDate || "")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Start Date</div>
            <div className="font-medium">
              {formatDate(survey.endDate || "")}
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-3">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Type</div>
            <div className="font-medium capitalize">
              {survey?.type?.toLowerCase() || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Respondents</div>
            <div className="font-medium">
              {survey?.eligibleRespondentsCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Questions</div>
            <div className="font-medium">{survey?.questionCount || 0}</div>
          </div>
        </div>
        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-2">
          <div className="flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Status
            </div>
            <StatusBadge status={survey.status} module="survey" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Payment Status
            </div>
            <StatusBadge status={survey.paymentStatus} module="payment" />
          </div>
        </div>
      </div>
    </article>
  );
};
