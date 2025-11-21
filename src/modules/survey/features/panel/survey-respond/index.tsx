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
  useSurvey,
  useAvailableSurveys,
} from "@/modules/survey/hooks";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
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

const SurveyRespond = () => {
  const { id: surveyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyInfo, setSurveyInfo] = useState<Survey | null>(null);

  const { data: surveyData, isLoading: isLoadingSurvey, error: surveyError } = useSurvey(surveyId);
  // Handle API response structure: { statusCode, success, message, data: { survey: Survey } }
  // React Query returns the API response directly, so surveyData = { statusCode, data: { survey: Survey } }
  // So: surveyData.data = { survey: Survey }, surveyData.data.survey = Survey
  // Also handle case where data is Survey directly: surveyData.data = Survey
  const survey = surveyData?.data?.survey || surveyData?.data;

  // Check if there's an in-progress attempt for this survey
  const { data: availableData } = useAvailableSurveys({});
  const availableSurvey = availableData?.data?.surveys?.find((s) => s._id === surveyId);
  const inProgressAttemptId = availableSurvey?.inProgressAttemptId;

  const { data: attemptData, isLoading: isLoadingAttempt } = useSurveyAttempt(
    inProgressAttemptId || undefined,
    !!inProgressAttemptId,
  );

  const respondentAction = useRespondentAction();

  const handleStartSurvey = async () => {
    if (!surveyId) return;

    // Check if there's already an in-progress attempt
    if (inProgressAttemptId) {
      // Resume existing attempt instead of starting a new one
      console.log("Resuming existing attempt:", inProgressAttemptId);
      return;
    }

    try {
      const response = await respondentAction.mutateAsync({
        action: "start",
        surveyId,
        // No sessionId needed for authenticated admin users
      });
      
      // Handle response according to API spec
      // Response: { attempt: {...}, survey: {...}, questions: [...] }
      if (response.data.attempt) {
        setAttemptId(response.data.attempt._id);
        setCurrentQuestionIndex(0);
      }
      
      // Questions come from the "start" response, not from survey detail
      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
      } else {
        // Fallback: try to use questions from survey if available
        if (survey?.questions && survey.questions.length > 0) {
          setQuestions(survey.questions);
        } else {
          toast.error("No questions found in survey");
          navigate(SURVEY_ROUTES.DETAIL(surveyId));
          return;
        }
      }
      
      // Store survey info from response
      if (response.data.survey) {
        setSurveyInfo(response.data.survey);
      } else if (survey) {
        setSurveyInfo(survey);
      }
    } catch (error: any) {
      // Handle duplicate key error (already has in-progress attempt)
      if (error?.response?.data?.message?.includes("duplicate key") || 
          error?.response?.data?.message?.includes("in_progress")) {
        toast.error("You already have an in-progress attempt. Please continue from where you left off.");
        // Try to fetch the existing attempt
        if (inProgressAttemptId) {
          // The attempt data should load via useSurveyAttempt hook
          return;
        }
      }
      toast.error(error.message || "Failed to start survey");
      console.error("Error starting survey:", error);
    }
  };

  useEffect(() => {
    // If we have attempt data, load it
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
      
      // Use questions from attempt if available
      if (attempt.questions && attempt.questions.length > 0) {
        setQuestions(attempt.questions);
      } else if (survey?.questions && survey.questions.length > 0) {
        setQuestions(survey.questions);
      }
      
      if (attempt.survey) {
        setSurveyInfo(attempt.survey);
      } else if (survey) {
        setSurveyInfo(survey);
      }
    } 
    // If we have an in-progress attempt ID but no attempt data yet, wait for it to load
    else if (inProgressAttemptId && isLoadingAttempt) {
      // Still loading attempt data, do nothing
      return;
    }
    // If we have survey but no attempt (and not loading), start the survey
    else if (survey && surveyId && !inProgressAttemptId && !attemptId && !isLoadingAttempt) {
      // Set survey info first
      setSurveyInfo(survey);
      // Then start the survey
      handleStartSurvey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptData, surveyId, inProgressAttemptId, survey, isLoadingAttempt, attemptId]);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : undefined;
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAnswer = async (questionId: string, answer: any) => {
    if (!attemptId) return;

    try {
      const response = await respondentAction.mutateAsync({
        action: "submit_answer",
        attemptId,
        questionId,
        answer,
        // No sessionId needed for authenticated admin users
      });
      
      // Update answers from response
      // Note: Don't update currentQuestionIndex here - let handleNext handle navigation
      // The response.currentQuestionIndex is the index of the question just answered
      if (response.data.answers) {
        const updatedAnswers: Record<string, any> = {};
        response.data.answers.forEach((ans: SurveyAnswer) => {
          updatedAnswers[ans.questionId] = ans.answer;
        });
        setAnswers(updatedAnswers);
      }
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

    try {
      // Submit current answer first
      if (answer !== undefined) {
        await handleSubmitAnswer(currentQuestion._id || "", answer);
      }

      // Move to next question after successful submission
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // Last question - complete survey
        await handleComplete();
      }
    } catch (error) {
      // Error already handled in handleSubmitAnswer
      console.error("Error in handleNext:", error);
      // Don't navigate to next question if submission failed
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
      const response = await respondentAction.mutateAsync({
        action: "complete",
        attemptId,
        // No sessionId needed for authenticated admin users
      });
      
      // Response: { _id, status, completedAt, reward, rewardCredited }
      const reward = response.data.reward || 0;
      const rewardCredited = response.data.rewardCredited || false;
      
      if (rewardCredited) {
        toast.success(`Survey completed successfully! You earned ${reward} coins!`);
      } else {
        toast.success("Survey completed successfully!");
      }
      
      // Navigate back to survey detail page
      navigate(SURVEY_ROUTES.DETAIL(surveyId || ""));
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
      navigate(SURVEY_ROUTES.DETAIL(surveyId || ""));
    } catch (error: any) {
      toast.error(error.message || "Failed to abandon survey");
    }
    setShowAbandonDialog(false);
  };

  // Show loading only if we're actually loading data
  if (isLoadingSurvey || isLoadingAttempt) {
    return <FullLoader />;
  }

  // If survey failed to load or has error, show error
  if (surveyError || (!survey && !isLoadingSurvey)) {
    console.error("Survey load error:", surveyError, "Survey data:", surveyData);
    return (
      <PageContent
        header={{
          title: "Survey Not Found",
          description: surveyError?.message || "The survey you're looking for doesn't exist or you don't have permission to view it.",
        }}
      >
        <Button onClick={() => navigate(SURVEY_ROUTES.LIST)}>
          Back to Surveys
        </Button>
      </PageContent>
    );
  }

  // If we're starting the survey, show loading (questions will come from start response)
  if (respondentAction.isPending && !attemptId) {
    return <FullLoader />;
  }

  // If we have survey but no questions yet and not starting, show loading
  // Questions come from the "start" action response, not from survey detail
  if (survey && questions.length === 0 && !respondentAction.isPending && !attemptId) {
    return <FullLoader />;
  }

  // If we have survey but no questions after starting, show error
  if (survey && questions.length === 0 && attemptId && !respondentAction.isPending) {
    return (
      <PageContent
        header={{
          title: "Survey Not Available",
          description: "This survey has no questions available.",
        }}
      >
        <Button onClick={() => navigate(SURVEY_ROUTES.DETAIL(surveyId || ""))}>
          Back to Survey Details
        </Button>
      </PageContent>
    );
  }

  // If we still don't have a current question after loading, show error
  if (!currentQuestion && questions.length > 0) {
    return (
      <PageContent
        header={{
          title: "Error Loading Question",
          description: "Unable to load the current question.",
        }}
      >
        <Button onClick={() => navigate(SURVEY_ROUTES.DETAIL(surveyId || ""))}>
          Back to Survey Details
        </Button>
      </PageContent>
    );
  }

  // Final check - if we still don't have currentQuestion, show loading
  if (!currentQuestion) {
    return <FullLoader />;
  }

  const currentAnswer = answers[currentQuestion._id || ""];

  return (
    <>
      <PageContent
        header={{
          title: surveyInfo?.title || survey?.title || "Responding to Survey",
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
              If you exit now, this survey will be marked as abandoned. Do you want to exit?
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

export default SurveyRespond;

