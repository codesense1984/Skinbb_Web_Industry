import { useFieldArray, useWatch, useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { SURVEY_CONSTRAINTS, SURVEY_DEFAULTS, QUESTION_TYPES, QUESTION_TYPE_BASE_PRICES } from "@/modules/survey/constants/survey.constants";
import { toast } from "sonner";
import { formatCurrency } from "@/core/utils/number";
import type { SurveyFormData } from "../index";

interface Step2SelectQuestionsProps {
  form: ReturnType<typeof useForm<SurveyFormData>>;
}

const Step2SelectQuestions = ({ form }: Step2SelectQuestionsProps) => {
  const { fields, append, remove, swap } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const surveyType = form.watch("type");
  const maxQuestions =
    surveyType === "flash"
      ? SURVEY_CONSTRAINTS.flashSurveyMaxQuestions
      : Infinity;

  const handleAddQuestion = () => {
    if (fields.length < maxQuestions) {
      append({
        questionText: "",
        type: "MCQ",
        isRequired: SURVEY_DEFAULTS.isRequired,
        options: ["", ""],
        basePrice: QUESTION_TYPE_BASE_PRICES.MCQ,
      });
    } else {
      toast.error(
        `Flash surveys can have maximum ${SURVEY_CONSTRAINTS.flashSurveyMaxQuestions} questions`,
      );
    }
  };

  const handleDuplicate = (index: number) => {
    const question = fields[index];
    const questionType = form.getValues(`questions.${index}.type`) as keyof typeof QUESTION_TYPE_BASE_PRICES;
    const basePrice = form.getValues(`questions.${index}.basePrice`) || 
                     (questionType ? QUESTION_TYPE_BASE_PRICES[questionType] : 0);
    
    append({
      questionText: form.getValues(`questions.${index}.questionText`),
      type: questionType,
      isRequired: form.getValues(`questions.${index}.isRequired`),
      options: form.getValues(`questions.${index}.options`) || [],
      basePrice: basePrice,
      scaleMin: form.getValues(`questions.${index}.scaleMin`),
      scaleMax: form.getValues(`questions.${index}.scaleMax`),
      scaleLabel: form.getValues(`questions.${index}.scaleLabel`),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Survey Questions</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add up to {maxQuestions === Infinity ? "∞" : maxQuestions} questions that align with your survey's goals.
          </p>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {fields.length}/{maxQuestions === Infinity ? "∞" : maxQuestions} Questions
        </span>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <QuestionCard
            key={field.id}
            index={index}
            form={form}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            onMoveUp={index > 0 ? () => swap(index, index - 1) : undefined}
            onMoveDown={index < fields.length - 1 ? () => swap(index, index + 1) : undefined}
            onDuplicate={() => handleDuplicate(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddQuestion}
        disabled={fields.length >= maxQuestions}
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
};

interface QuestionCardProps {
  index: number;
  form: ReturnType<typeof useForm<SurveyFormData>>;
  onRemove: () => void;
  canRemove: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate: () => void;
}

const QuestionCard = ({
  index,
  form,
  onRemove,
  canRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: QuestionCardProps) => {
  const questionType = useWatch({
    control: form.control,
    name: `questions.${index}.type`,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `questions.${index}.options`,
  });

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-lg font-semibold">Question{index + 1}</h4>
          </div>
          <div className="flex items-center gap-2">
            {onMoveUp && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
              >
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
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
        </div>

        <FormField
          control={form.control}
          name={`questions.${index}.type`}
          render={({ field }) => {
            const selectedType = field.value as keyof typeof QUESTION_TYPE_BASE_PRICES;
            const basePrice = selectedType ? QUESTION_TYPE_BASE_PRICES[selectedType] : 0;
            
            return (
              <FormItem>
                <FormLabel>Question type</FormLabel>
                <FormControl>
                  <SelectRoot onValueChange={(value) => {
                    field.onChange(value);
                    // Auto-set base price when question type changes
                    form.setValue(`questions.${index}.basePrice`, QUESTION_TYPE_BASE_PRICES[value as keyof typeof QUESTION_TYPE_BASE_PRICES]);
                  }} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "MCQ" ? "Single choice" : 
                           type === "Yes/No" ? "Yes / No" :
                           type === "Scaling" ? "Rating / Scale" :
                           type === "Descriptive" ? "Text Entry" : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </FormControl>
                {selectedType && (
                  <p className="text-sm text-gray-500 mt-1">
                    Base Price: {formatCurrency(basePrice)}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name={`questions.${index}.questionText`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter text..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`questions.${index}.basePrice`}
          render={({ field }) => {
            const questionType = form.watch(`questions.${index}.type`) as keyof typeof QUESTION_TYPE_BASE_PRICES;
            const defaultPrice = questionType ? QUESTION_TYPE_BASE_PRICES[questionType] : 0;
            
            return (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter base price"
                    {...field}
                    value={field.value ?? defaultPrice}
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : defaultPrice;
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">
                  Default: {formatCurrency(defaultPrice)} for {questionType || "selected type"}
                </p>
                <FormMessage />
              </FormItem>
            );
          }}
        />


        {questionType === "MCQ" && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            <div className="space-y-2">
              {fields.map((field, optIndex) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 cursor-move">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                  <FormField
                    control={form.control}
                    name={`questions.${index}.options.${optIndex}` as const}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Enter text..."
                            {...inputField}
                          />
                        </FormControl>
                      </FormItem>
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

        {questionType === "Yes/No" && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Yes / No</p>
          </div>
        )}

        {questionType === "Scaling" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`questions.${index}.scaleMin`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Min"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.scaleMax`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Max"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 10)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.scaleLabel.min` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Label (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Min label" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.scaleLabel.max` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Label (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Max label" {...field} value={field.value || ""} />
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

export default Step2SelectQuestions;

