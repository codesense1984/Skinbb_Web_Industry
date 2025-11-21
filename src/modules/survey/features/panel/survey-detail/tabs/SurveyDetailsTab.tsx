import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { StatusBadge } from "@/core/components/ui/badge";
import { formatCurrency } from "@/core/utils/number";
import { formatDate } from "@/core/utils/date";
import type { Survey } from "@/modules/survey/types/survey.types";
import { Button } from "@/core/components/ui/button";
import { useNavigate } from "react-router";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { PencilIcon } from "@heroicons/react/24/outline";

interface SurveyDetailsTabProps {
  survey: Survey;
}

const SurveyDetailsTab = ({ survey }: SurveyDetailsTabProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Survey Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Survey Information</CardTitle>
            {survey.status === "draft" && (
              <Button
                variant="outline"
                onClick={() => navigate(SURVEY_ROUTES.EDIT(survey._id))}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Survey
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-sm font-medium">{survey.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-sm font-medium capitalize">{survey.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <StatusBadge module="survey" status={survey.status} variant="badge">
                  {survey.status}
                </StatusBadge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Payment Status
              </label>
              <div className="mt-1">
                <StatusBadge
                  module="payment"
                  status={survey.paymentStatus}
                  variant="badge"
                >
                  {survey.paymentStatus}
                </StatusBadge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Location Target
              </label>
              <p className="text-sm font-medium">
                {survey.locationTarget}
                {survey.locationTarget === "City" && survey.targetCity
                  ? `: ${survey.targetCity}`
                  : ""}
                {survey.locationTarget === "Metro" && survey.targetMetro
                  ? `: ${survey.targetMetro}`
                  : ""}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reward</label>
              <p className="text-sm font-medium">{survey.reward} coins</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Total Price
              </label>
              <p className="text-sm font-medium">
                {formatCurrency(survey.totalPrice)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Price Multiplier
              </label>
              <p className="text-sm font-medium">
                {survey.priceMultiplier ?? 1.0}x
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created At
              </label>
              <p className="text-sm font-medium">
                {formatDate(survey.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Updated At
              </label>
              <p className="text-sm font-medium">
                {formatDate(survey.updatedAt)}
              </p>
            </div>
          </div>

          {survey.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Description
              </label>
              <p className="text-sm mt-1">{survey.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({survey.questions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {survey.questions && survey.questions.length > 0 ? (
              survey.questions
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((question, index) => (
                  <div
                    key={question._id || index}
                    className="border rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Question Header */}
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded">
                            Q{question.order || index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-base font-semibold text-gray-900">
                                {question.questionText}
                              </p>
                              {question.isRequired && (
                                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                  *Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Question Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">
                              Question Type
                            </label>
                            <p className="text-sm font-medium text-gray-900 capitalize mt-1">
                              {question.type}
                            </p>
                          </div>
                          {question.basePrice && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase">
                                Base Price
                              </label>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatCurrency(question.basePrice)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Options/Details based on question type */}
                        {question.type === "MCQ" && question.options && question.options.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                              Options
                            </label>
                            <div className="space-y-2">
                              {question.options.map((opt, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200"
                                >
                                  <span className="text-xs font-medium text-gray-400 w-6">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span className="text-sm text-gray-900">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === "Yes/No" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                              Options
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                <span className="text-sm font-medium text-gray-900">Yes</span>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                <span className="text-sm font-medium text-gray-900">No</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {question.type === "Scaling" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                              Scale Range
                            </label>
                            <div className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Minimum</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {question.scaleMin || 1}
                                  </p>
                                  {question.scaleLabel?.min && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {question.scaleLabel.min}
                                    </p>
                                  )}
                                </div>
                                <div className="flex-1 mx-4">
                                  <div className="h-1 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Maximum</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {question.scaleMax || 10}
                                  </p>
                                  {question.scaleLabel?.max && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {question.scaleLabel.max}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {question.type === "Descriptive" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                              Answer Type
                            </label>
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <span className="text-sm text-gray-900">Text/Descriptive Answer</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No questions found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDetailsTab;

