import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import {
  SurveyList as CommonSurveyList,
  SurveyCard,
  createSurveyColumns,
} from "@/modules/panel/components/shared/survey/survey-list";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { apiDeleteSurvey } from "@/modules/panel/services/survey.service";
import type { Survey } from "@/modules/panel/types/survey.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

const SurveyList = () => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Detect if we're in seller routes
  const deleteSurveyMutation = useMutation({
    mutationFn: (surveyId: string) => apiDeleteSurvey(surveyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PANEL_ROUTES.SURVEY.LIST] });
      toast.success("Survey deleted successfully!");
      navigate(PANEL_ROUTES.SURVEY.LIST);
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

  const columns = useMemo(
    () =>
      createSurveyColumns({
        handleDeleteSurvey,
        viewUrl: (id: string) => PANEL_ROUTES.SURVEY.VIEW(id),
        editUrl: (id: string) => PANEL_ROUTES.SURVEY.EDIT(id),
        isAdmin: true,
      }),
    [handleDeleteSurvey],
  );

  const renderCard = useMemo(
    () => (survey: Survey) => <SurveyCard survey={survey} />,
    [],
  );

  return (
    <PageContent
      header={{
        title: "Brand Surveys",
        description: "View and manage your surveys.",
        actions: (
          <div className="flex gap-2 md:gap-5">
            <Button color={"primary"} asChild>
              <NavLink to={PANEL_ROUTES.SURVEY.CREATE}>Add Survey</NavLink>
            </Button>
          </div>
        ),
      }}
    >
      <CommonSurveyList
        showCompanyFilter={!companyId}
        companyId={companyId || undefined}
        defaultViewMode="grid"
        columns={columns}
        renderCard={renderCard}
      />
    </PageContent>
  );
};

export default SurveyList;
