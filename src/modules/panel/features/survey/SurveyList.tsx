import { Button } from "@/core/components/ui/button";
import { DatePicker } from "@/core/components/ui/date-picker";
import { PageContent } from "@/core/components/ui/structure";
import { CalendarDateRangeIcon } from "@heroicons/react/24/outline";
import { NavLink, useLocation, useNavigate } from "react-router";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import type { Survey } from "@/modules/panel/types/survey.types";
import { apiDeleteSurvey } from "@/modules/panel/services/survey.service";
import { SELLER_ROUTES } from "@/modules/seller";
import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SurveyList as CommonSurveyList,
  SurveyCard,
  createSurveyColumns,
} from "@/modules/panel/components/shared/survey/survey-list";

const SurveyList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're in seller routes
  const isSellerRoute = location.pathname.includes("/marketing/surveys");
  const listRoute = isSellerRoute
    ? SELLER_ROUTES.MARKETING.SURVEYS.LIST
    : PANEL_ROUTES.SURVEY.LIST;

  const deleteSurveyMutation = useMutation({
    mutationFn: (surveyId: string) => apiDeleteSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.SURVEY.LIST] });
      toast.success("Survey deleted successfully!");
      navigate(listRoute);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete survey");
    },
  });

  const handleDeleteSurvey = useCallback(
    (id: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this survey? This action cannot be undone.",
        )
      ) {
        deleteSurveyMutation.mutate(id);
      }
    },
    [deleteSurveyMutation],
  );

  const getEditRoute = useCallback(
    (id: string) =>
      isSellerRoute
        ? SELLER_ROUTES.MARKETING.SURVEYS.EDIT(id)
        : PANEL_ROUTES.SURVEY.EDIT(id),
    [isSellerRoute],
  );

  const getDetailRoute = useCallback(
    (id: string) =>
      isSellerRoute
        ? SELLER_ROUTES.MARKETING.SURVEYS.VIEW(id)
        : PANEL_ROUTES.SURVEY.DETAIL(id),
    [isSellerRoute],
  );

  const columns = useMemo(
    () =>
      createSurveyColumns(
        handleDeleteSurvey,
        isSellerRoute,
        getEditRoute,
        getDetailRoute,
      ),
    [handleDeleteSurvey, isSellerRoute, getEditRoute, getDetailRoute],
  );

  const renderCard = useMemo(
    () => (survey: Survey) => (
      <SurveyCard
        survey={survey}
        getEditRoute={getEditRoute}
        getDetailRoute={getDetailRoute}
      />
    ),
    [getEditRoute, getDetailRoute],
  );

  return (
    <PageContent
      header={{
        title: "Brand Surveys",
        description: "View and manage your surveys.",
        actions: (
          <div className="flex gap-2 md:gap-5">
            <DatePicker
              className="max-w-69"
              startIcon={<CalendarDateRangeIcon />}
              mode="range"
            />
            <Button color={"primary"} asChild>
              <NavLink to={PANEL_ROUTES.SURVEY.CREATE}>
                Add Brand Survey
              </NavLink>
            </Button>
          </div>
        ),
      }}
    >
      <CommonSurveyList
        showStatusFilter
        defaultViewMode="grid"
        columns={columns}
        renderCard={renderCard}
      />
    </PageContent>
  );
};

export default SurveyList;

