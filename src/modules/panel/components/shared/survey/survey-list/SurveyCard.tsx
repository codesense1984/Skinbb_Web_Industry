import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency, formatDate } from "@/core/utils";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Survey } from "@/modules/panel/types/survey.types";
import type { FC } from "react";
import { NavLink } from "react-router";

interface SurveyCardProps {
  survey: Survey;
  getEditRoute?: (id: string) => string;
  getDetailRoute?: (id: string) => string;
}

export const SurveyCard: FC<SurveyCardProps> = ({
  survey,
  getEditRoute,
  getDetailRoute,
}) => {
  const editRoute =
    getEditRoute || ((id: string) => PANEL_ROUTES.SURVEY.EDIT(id));
  const detailRoute =
    getDetailRoute || ((id: string) => PANEL_ROUTES.SURVEY.DETAIL(id));
  const canEdit = survey.status === "draft";
  const route = canEdit ? editRoute(survey._id) : detailRoute(survey._id);

  return (
    <NavLink to={route}>
      <article className="bg-card hover:ring-primary w-full rounded-xl p-5 shadow-md transition hover:ring-3">
        <h3 className="text-lg leading-snug font-semibold text-gray-900">
          {survey.title}
        </h3>
        <p className="mt-1 line-clamp-2">{survey.description}</p>

        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-2">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Category</div>
            <div className="font-medium">{survey.type}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Start Date</div>
            <div className="font-medium">
              {formatDate(survey.startDate || "")}
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-3">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Respondents</div>
            <div className="font-medium">
              {survey?.eligibleRespondentsCount || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Cost</div>
            <div className="font-medium">
              {formatCurrency(survey?.totalPrice || 0)}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Status
            </div>
            <StatusBadge status={survey.status} module="survey" />
          </div>
        </div>
      </article>
    </NavLink>
  );
};
