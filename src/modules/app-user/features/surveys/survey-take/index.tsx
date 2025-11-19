import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { PageContent } from "@/core/components/ui/structure";
import { Progress } from "@/core/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { Label } from "@/core/components/ui/label";
import { Slider } from "@/core/components/ui/slider";
import { Textarea } from "@/core/components/ui/textarea";
import { useParams, useNavigate } from "react-router";
import {
  useRespondentAction,
  useSurveyAttempt,
  useAvailableSurveys,
} from "@/modules/survey/hooks";
import { APP_USER_SURVEY_ROUTES } from "@/modules/app-user/routes/constants";
import { FullLoader } from "@/core/components/ui/loader";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Question, SurveyAnswer } from "@/modules/survey/types/survey.types";
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";

const SurveyTake = () => {
  const { id: surveyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const { data: availableData } = useAvailableSurveys({});
  const survey = availableData?.data?.surveys?.find((s) => s._id === surveyId);
  const inProgressAttemptId = survey?.inProgressAttemptId;

  const { data: attemptData, isLoading: isLoadingAttempt } = useSurveyAttempt(
    inProgressAttemptId || undefined,
    !!inProgressAttemptId,
  );

  const respondentAction = useRespondentAction();

  const handleStartSurvey = async () => {
    if (!surveyId) return;

    try {
      const response = await respondentAction.mutateAsync({
        action: "start",
        surveyId,
      });
      if (response.data.attempt) {
        setAttemptId(response.data.attempt._id);
        setCurrentQuestionIndex(0);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start survey");
      navigate(APP_USER_SURVEY_ROUTES.AVAILABLE);
    }
  };

  useEffect(() => {
    if (attemptData?.data?.data) {
      const attempt = attemptData.data.data;
      setAttemptId(attempt._id);
      setCurrentQuestionIndex(attempt.currentQuestionIndex || 0);
      // Load existing answers
      const existingAnswers: Record<string, any> = {};
      attempt.answers.forEach((ans: SurveyAnswer) => {
        existingAnswers[ans.questionId] = ans.answer;
      });
      setAnswers(existingAnswers);
    } else if (surveyId && !inProgressAttemptId && !attemptId) {
      // Start new survey
      handleStartSurvey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptData, surveyId, inProgressAttemptId]);

  const questions = attemptData?.data?.data?.questions || survey?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswer = async (questionId: string, answer: any) => {
    if (!attemptId) return;

    try {
      await respondentAction.mutateAsync({
        action: "submit_answer",
        attemptId,
        questionId,
        answer,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit answer");
    }
  };

  const handleNext = async () => {
    if (!currentQuestion || !attemptId) return;

    const answer = answers[currentQuestion._id || ""];
    if (currentQuestion.isRequired && (answer === undefined || answer === "")) {
      toast.error("This question is required");
      return;
    }

    // Submit current answer
    if (answer !== undefined) {
      await handleSubmitAnswer(currentQuestion._id || "", answer);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - complete survey
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!attemptId) return;

    try {
      await respondentAction.mutateAsync({
        action: "complete",
        attemptId,
      });
      // Navigate to success/completion page
      navigate(APP_USER_SURVEY_ROUTES.MY_ATTEMPTS);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete survey");
    }
  };

  const handleAbandon = async () => {
    if (!attemptId) return;

    try {
      await respondentAction.mutateAsync({
        action: "abandon",
        attemptId,
      });
      navigate(APP_USER_SURVEY_ROUTES.AVAILABLE);
    } catch (error: any) {
      toast.error(error.message || "Failed to abandon survey");
    }
    setShowAbandonDialog(false);
  };

  if (isLoadingAttempt || !currentQuestion) {
    return <FullLoader />;
  }

  const currentAnswer = answers[currentQuestion._id || ""];

  return (
    <>
      <PageContent
        header={{
          title: survey?.title || "Taking Survey",
          description: `Question ${currentQuestionIndex + 1} of ${questions.length}`,
        }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {currentQuestion.questionText}
                {currentQuestion.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Render question based on type */}
              {currentQuestion.type === "MCQ" && (
                <RadioGroup
                  value={currentAnswer}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion._id || "", value)
                  }
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "Yes/No" && (
                <RadioGroup
                  value={currentAnswer?.toString()}
                  onValueChange={(value) =>
                    handleAnswerChange(
                      currentQuestion._id || "",
                      value === "true",
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="no" />
                    <Label htmlFor="no" className="cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              )}

              {currentQuestion.type === "Scaling" && (
                <div className="space-y-4">
                  <Slider
                    value={[currentAnswer || currentQuestion.scaleMin || 1]}
                    min={currentQuestion.scaleMin || 1}
                    max={currentQuestion.scaleMax || 10}
                    step={1}
                    onValueChange={([value]) =>
                      handleAnswerChange(currentQuestion._id || "", value)
                    }
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{currentQuestion.scaleLabel?.min || currentQuestion.scaleMin || 1}</span>
                    <span>{currentAnswer || currentQuestion.scaleMin || 1}</span>
                    <span>{currentQuestion.scaleLabel?.max || currentQuestion.scaleMax || 10}</span>
                  </div>
                </div>
              )}

              {currentQuestion.type === "Descriptive" && (
                <Textarea
                  value={currentAnswer || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id || "", e.target.value)
                  }
                  placeholder="Enter your answer..."
                  rows={5}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAbandonDialog(true)}
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Exit Survey
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={respondentAction.isPending}
              >
                {currentQuestionIndex === questions.length - 1
                  ? "Complete"
                  : "Next"}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </PageContent>

      {/* Abandon Dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandon Survey?</AlertDialogTitle>
            <AlertDialogDescription>
              If you exit now, this survey will be marked as abandoned and you
              may not receive rewards. Do you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbandon}>
              Yes, Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SurveyTake;

