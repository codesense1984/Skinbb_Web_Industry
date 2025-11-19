import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { PageContent } from "@/core/components/ui/structure";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router";
import { useSurvey, useCreateSurvey, useUpdateSurvey, useMetroCities } from "@/modules/survey/hooks";
import { SURVEY_ROUTES } from "@/modules/survey/routes/constant";
import { FullLoader } from "@/core/components/ui/loader";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import type { Question, CreateSurveyRequest } from "@/modules/survey/types/survey.types";
import {
  SURVEY_TYPES,
  LOCATION_TARGETS,
  QUESTION_TYPES,
  SURVEY_CONSTRAINTS,
  SURVEY_DEFAULTS,
} from "@/modules/survey/constants/survey.constants";

// Form Schema
const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  type: z.enum(QUESTION_TYPES as [string, ...string[]]),
  basePrice: z.number().optional(),
  isRequired: z.boolean().default(SURVEY_DEFAULTS.isRequired),
  options: z.array(z.string()).optional(),
  scaleMin: z.number().optional(),
  scaleMax: z.number().optional(),
  scaleLabel: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional(),
  defaultAnswer: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const surveyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(SURVEY_TYPES as [string, ...string[]]),
  priceMultiplier: z
    .number()
    .min(SURVEY_CONSTRAINTS.priceMultiplierMin, "Price multiplier must be at least 0.1")
    .optional(),
  reward: z
    .number()
    .min(SURVEY_CONSTRAINTS.rewardMin, "Reward must be non-negative")
    .optional(),
  locationTarget: z.enum(LOCATION_TARGETS as [string, ...string[]]),
  targetCity: z.string().optional(),
  targetMetro: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "completed"] as [string, ...string[]]).optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
}).refine((data) => {
  if (data.locationTarget === "City" && !data.targetCity) {
    return false;
  }
  if (data.locationTarget === "Metro" && !data.targetMetro) {
    return false;
  }
  return true;
}, {
  message: "Target city/metro is required when location target is City/Metro",
  path: ["targetCity"],
}).refine((data) => {
  if (data.type === "flash" && data.questions.length > SURVEY_CONSTRAINTS.flashSurveyMaxQuestions) {
    return false;
  }
  return true;
}, {
  message: `Flash surveys can have maximum ${SURVEY_CONSTRAINTS.flashSurveyMaxQuestions} questions`,
  path: ["questions"],
});

type SurveyFormData = z.infer<typeof surveyFormSchema>;

const SurveyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const { data: surveyData, isLoading: isLoadingSurvey } = useSurvey(id, isEdit);
  const { data: metroCitiesData } = useMetroCities();
  const createMutation = useCreateSurvey();
  const updateMutation = useUpdateSurvey();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: SURVEY_DEFAULTS.surveyType,
      priceMultiplier: SURVEY_DEFAULTS.priceMultiplier,
      reward: SURVEY_DEFAULTS.reward,
      locationTarget: SURVEY_DEFAULTS.locationTarget,
      status: SURVEY_DEFAULTS.surveyStatus,
      questions: [
        {
          questionText: "",
          type: "MCQ",
          isRequired: SURVEY_DEFAULTS.isRequired,
          options: ["", ""],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const surveyType = form.watch("type");
  const locationTarget = form.watch("locationTarget");

  // Load survey data for edit
  useEffect(() => {
    if (isEdit && surveyData?.data?.data) {
      const survey = surveyData.data.data;
      form.reset({
        title: survey.title,
        description: survey.description || "",
        type: survey.type,
        priceMultiplier: survey.priceMultiplier ?? SURVEY_DEFAULTS.priceMultiplier,
        reward: survey.reward ?? SURVEY_DEFAULTS.reward,
        locationTarget: survey.locationTarget,
        targetCity: survey.targetCity,
        targetMetro: survey.targetMetro,
        status: survey.status,
        questions: survey.questions?.map((q: Question) => ({
          questionText: q.questionText,
          type: q.type,
          basePrice: q.basePrice,
          isRequired: q.isRequired ?? SURVEY_DEFAULTS.isRequired,
          options: q.options || [],
          scaleMin: q.scaleMin ?? SURVEY_DEFAULTS.scaleMin,
          scaleMax: q.scaleMax ?? SURVEY_DEFAULTS.scaleMax,
          scaleLabel: q.scaleLabel,
          defaultAnswer: q.defaultAnswer,
        })) || [],
      });
    }
  }, [isEdit, surveyData, form]);

  const onSubmit = async (data: SurveyFormData) => {
    try {
      const payload: CreateSurveyRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        priceMultiplier: data.priceMultiplier,
        reward: data.reward,
        locationTarget: data.locationTarget,
        targetCity: data.targetCity,
        targetMetro: data.targetMetro,
        status: data.status || "draft",
        questions: data.questions.map((q, index) => ({
          order: index + 1,
          questionText: q.questionText,
          type: q.type,
          basePrice: q.basePrice,
          isRequired: q.isRequired,
          options: q.type === "MCQ" ? q.options : undefined,
          scaleMin: q.type === "Scaling" ? q.scaleMin : undefined,
          scaleMax: q.type === "Scaling" ? q.scaleMax : undefined,
          scaleLabel: q.type === "Scaling" ? q.scaleLabel : undefined,
          defaultAnswer: q.defaultAnswer,
        })),
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ surveyId: id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Error saving survey:", error);
    }
  };

  if (isEdit && isLoadingSurvey) {
    return <FullLoader />;
  }

  const metroCities = metroCitiesData?.data?.data?.metroCities || [];
  const maxQuestions =
    surveyType === "flash"
      ? SURVEY_CONSTRAINTS.flashSurveyMaxQuestions
      : Infinity;

  return (
    <PageContent
      header={{
        title: isEdit ? "Edit Survey" : "Create Survey",
        description: isEdit
          ? "Update survey details and questions"
          : "Create a new survey with questions",
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter survey title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter survey description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select survey type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="flash">
                            Flash (Max {SURVEY_CONSTRAINTS.flashSurveyMaxQuestions} questions)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Target *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location target" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Metro">Metro</SelectItem>
                          <SelectItem value="City">City</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {locationTarget === "Metro" && (
                <FormField
                  control={form.control}
                  name="targetMetro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Metro *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select metro city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metroCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {locationTarget === "City" && (
                <FormField
                  control={form.control}
                  name="targetCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter price multiplier"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward (coins)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter reward amount"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Questions</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Add up to {maxQuestions === Infinity ? "∞" : maxQuestions} questions that align with your survey's goals.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {fields.length}/{maxQuestions === Infinity ? "∞" : maxQuestions} Questions
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fields.length < maxQuestions) {
                        append({
                          questionText: "",
                          type: "MCQ",
                          isRequired: SURVEY_DEFAULTS.isRequired,
                          options: ["", ""],
                        });
                      } else {
                        toast.error(
                          `Flash surveys can have maximum ${SURVEY_CONSTRAINTS.flashSurveyMaxQuestions} questions`,
                        );
                      }
                    }}
                    disabled={fields.length >= maxQuestions}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {fields.map((field, index) => (
                <QuestionFormItem
                  key={field.id}
                  index={index}
                  control={form.control}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(SURVEY_ROUTES.LIST)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Survey"
                  : "Create Survey"}
            </Button>
          </div>
        </form>
      </Form>
    </PageContent>
  );
};

// Question Form Item Component
interface QuestionFormItemProps {
  index: number;
  control: any;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionFormItem = ({
  index,
  control,
  onRemove,
  canRemove,
}: QuestionFormItemProps) => {
  const questionType = useForm({
    control,
    name: `questions.${index}.type` as const,
  }).watch(`questions.${index}.type`);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options` as const,
  });

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">Q{index + 1}</span>
            </div>
            <h4 className="text-lg font-semibold">Question {index + 1}</h4>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <FormField
          control={control}
          name={`questions.${index}.questionText`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Text *</FormLabel>
              <FormControl>
                <Input placeholder="Enter question" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MCQ">Multiple Choice</SelectItem>
                    <SelectItem value="Yes/No">Yes / No</SelectItem>
                    <SelectItem value="Scaling">Scaling</SelectItem>
                    <SelectItem value="Descriptive">Text Entry</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-end gap-4">
            <FormField
              control={control}
              name={`questions.${index}.basePrice`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Base price"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`questions.${index}.isRequired`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 pb-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">Required</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {questionType === "MCQ" && (
          <div className="space-y-3">
            <FormLabel className="text-sm font-medium">Options *</FormLabel>
            <div className="space-y-2">
              {fields.map((field, optIndex) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <Input
                    placeholder="Enter text..."
                    className="flex-1"
                    {...control.register(
                      `questions.${index}.options.${optIndex}` as const,
                    )}
                  />
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(optIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append("")}
              className="text-primary hover:text-primary/80"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
        )}

        {questionType === "Scaling" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`questions.${index}.scaleMin`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Value *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Min"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`questions.${index}.scaleMax`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Value *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Max"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveyForm;

