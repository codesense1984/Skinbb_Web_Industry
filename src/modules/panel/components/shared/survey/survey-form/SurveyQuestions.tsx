import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import { SURVEY } from "@/core/config/constants";
import type { SurveyFormData } from "@/modules/panel/components/shared/survey/survey-form/survey.schema";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useEffect, type ComponentProps } from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
  type FieldValues,
} from "react-hook-form";

interface SurveyQuestionsProps<T extends FieldValues> {
  control: Control<T>;
  disabled?: boolean;
}

const QUESTION_TYPES = [
  { label: "Single Choice", value: "SINGLE_CHOICE" },
  { label: "Yes/No", value: "YES/NO" },
  { label: "Rating", value: "RATING" },
  { label: "Text", value: "TEXT" },
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
];

function SurveyQuestions({
  control,
  disabled = false,
}: SurveyQuestionsProps<SurveyFormData>) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "questions",
  });

  const maxQuestions = useWatch({
    control,
    name: "maxQuestions",
  }) as number | undefined;

  const maxQuestionsValue = maxQuestions || SURVEY.MAX_QUESTIONS;

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2 md:gap-5">
      <div className="flex items-center">
        <div className="space-y-1">
          <p className="text-foreground text-xl font-medium">
            Survey Questions
          </p>
          <p>
            Add up to {maxQuestionsValue} questions that align with your
            survey's goals.
          </p>
        </div>
        <p className="text-foreground ml-auto text-xl font-medium">
          {fields.length}/{maxQuestionsValue} Questions
        </p>
      </div>
      {fields.map((field, index) => {
        return (
          <Card key={field.id} className="md:gap-2 md:pt-2">
            <CardHeader className="flex min-h-10 flex-wrap items-center gap-1 pt-0">
              <div className="mr-auto flex gap-2 font-medium">
                <QuestionMarkCircleIcon className="size-5" strokeWidth={2} />{" "}
                Question {index + 1}
              </div>
              <div className="flex flex-wrap items-center">
                <FormInput
                  type="checkbox"
                  name={`questions.${index}.isRequired`}
                  label="Required"
                  control={control}
                  className="flex-row px-2 text-base font-normal"
                  inputProps={{
                    disabled: disabled,
                  }}
                />
                {/* Up button */}
                {index > 0 && !disabled && (
                  <Button
                    size={"icon"}
                    variant={"link"}
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => handleMoveUp(index)}
                  >
                    <ArrowUpIcon className="size-4" />
                  </Button>
                )}
                {/* Down button */}
                {index < fields.length - 1 && !disabled && (
                  <Button
                    size={"icon"}
                    variant={"link"}
                    type="button"
                    className="hover:text-foreground"
                    onClick={() => handleMoveDown(index)}
                  >
                    <ArrowDownIcon className="size-4" />
                  </Button>
                )}
                {/* Delete button */}
                {fields.length !== 1 && !disabled && (
                  <Button
                    size={"icon"}
                    variant={"link"}
                    type="button"
                    className="hover:text-destructive"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <TrashIcon />
                  </Button>
                )}
                {/* Duplicate button */}
                {fields.length < maxQuestionsValue && !disabled && (
                  <Button
                    size={"icon"}
                    variant={"link"}
                    className="hover:text-foreground"
                    type="button"
                    onClick={() => {
                      const currentQuestion = fields[index];
                      append({
                        text: currentQuestion.text || "",
                        description: currentQuestion.description || "",
                        type: currentQuestion.type || "TEXT",
                        options: currentQuestion.options
                          ? [...currentQuestion.options]
                          : [],
                        scaleMin: currentQuestion.scaleMin,
                        scaleMax: currentQuestion.scaleMax,
                        scaleLabel: currentQuestion.scaleLabel
                          ? { ...currentQuestion.scaleLabel }
                          : undefined,
                        isRequired: currentQuestion.isRequired ?? true,
                      });
                    }}
                  >
                    <DocumentDuplicateIcon />
                  </Button>
                )}
              </div>
            </CardHeader>
            <hr />
            <CardContent className="flex flex-col gap-5 pt-3">
              <FormInput
                type="select"
                name={`questions.${index}.type`}
                label="Type"
                placeholder="Select Type"
                options={QUESTION_TYPES}
                control={control}
                inputProps={{
                  disabled: disabled,
                }}
              />
              <FormInput
                type="textarea"
                name={`questions.${index}.text`}
                label="Question"
                placeholder="Enter Question"
                control={control}
                className=""
                inputProps={{
                  disabled: disabled,
                }}
              />
              {/* <FormInput
                type="textarea"
                name={`questions.${index}.description`}
                label="Description(Optional)"
                placeholder="Enter description"
                control={control}
                className="col-span-3"
              /> */}

              <QuestionOptions
                index={index}
                control={control}
                disabled={disabled}
              />
            </CardContent>
          </Card>
        );
      })}

      {fields.length < maxQuestionsValue && !disabled && (
        <Button
          className="bg-card ml-auto shadow-md"
          type="button"
          variant={"outlined"}
          onClick={() =>
            append({
              text: "",
              description: "",
              type: "TEXT",
              options: [],
              isRequired: true,
            })
          }
          startIcon={<PlusIcon />}
        >
          Add Questions
        </Button>
      )}
    </div>
  );
}

function QuestionOptions({
  control,
  index,
  disabled = false,
  ...props
}: SurveyQuestionsProps<SurveyFormData> & {
  index: number;
  disabled?: boolean;
} & ComponentProps<"div">) {
  const { setValue, watch } = useFormContext();
  const watchQuestionType = watch(`questions.${index}.type`);

  const options: string[] =
    useWatch({
      control,
      name: `questions.${index}.options`,
    }) || [];

  const scaleMin = useWatch({
    control,
    name: `questions.${index}.scaleMin`,
  }) as number | undefined;

  // Clear options when switching to types that don't need options
  useEffect(() => {
    if (watchQuestionType === "YES/NO" || watchQuestionType === "TEXT") {
      setValue(`questions.${index}.options`, []);
    }
    // Clear scale values when switching away from RATING
    if (watchQuestionType !== "RATING") {
      setValue(`questions.${index}.scaleMin`, undefined);
      setValue(`questions.${index}.scaleMax`, undefined);
      setValue(`questions.${index}.scaleLabel`, undefined);
    }
  }, [watchQuestionType, index, setValue]);

  // Initialize options for SINGLE_CHOICE and MULTIPLE_CHOICE
  useEffect(() => {
    if (
      (watchQuestionType === "SINGLE_CHOICE" ||
        watchQuestionType === "MULTIPLE_CHOICE") &&
      (!options || options.length === 0)
    ) {
      setValue(`questions.${index}.options`, [""]);
    }
  }, [watchQuestionType, index, setValue, options]);

  const handleOptionChange = (value: string, optionIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = value;
    setValue(`questions.${index}.options`, updated);
  };

  const handleAddOption = () => {
    setValue(`questions.${index}.options`, [...options, ""]);
  };

  const handleRemoveOption = (optionIndex: number) => {
    const updated = [...options];
    updated.splice(optionIndex, 1);
    setValue(`questions.${index}.options`, updated);
  };

  // Show options for SINGLE_CHOICE and MULTIPLE_CHOICE
  if (
    watchQuestionType === "SINGLE_CHOICE" ||
    watchQuestionType === "MULTIPLE_CHOICE"
  ) {
    return (
      <div {...props}>
        <p className="mb-2">Options</p>
        <div className="space-y-2">
          {options.map((_item, optionIndex) => {
            return (
              <div
                key={String(optionIndex)}
                className="flex items-center gap-2"
              >
                <p className="text-muted-foreground">{optionIndex + 1} </p>
                <FormInput
                  key={optionIndex}
                  type="text"
                  name={`questions.${index}.options.${optionIndex}`}
                  placeholder="Enter option"
                  control={control}
                  className="flex-1"
                  inputProps={{
                    disabled: disabled,
                    onChange: (e) => {
                      handleOptionChange(
                        (e.target as HTMLInputElement).value,
                        optionIndex,
                      );
                    },
                  }}
                />
                {options.length !== 1 && !disabled && (
                  <Button
                    size={"icon"}
                    variant={"outlined"}
                    type="button"
                    className="hover:text-destructive"
                    onClick={() => handleRemoveOption(optionIndex)}
                  >
                    <TrashIcon />
                  </Button>
                )}
                {options.length - 1 === optionIndex &&
                  options.length < 7 &&
                  !disabled && (
                    <Button
                      size={"icon"}
                      variant={"outlined"}
                      type="button"
                      onClick={handleAddOption}
                    >
                      <PlusCircleIcon />
                    </Button>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Show scale inputs for RATING
  if (watchQuestionType === "RATING") {
    return (
      <div
        {...props}
        className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-5"
      >
        <FormInput
          type="number"
          name={`questions.${index}.scaleMin`}
          label="Min Value"
          placeholder="Enter min value"
          control={control}
          inputProps={{
            disabled: disabled,
            min: 0,
            step: 1,
          }}
        />
        <FormInput
          type="number"
          name={`questions.${index}.scaleMax`}
          label="Max Value"
          placeholder="Enter max value"
          control={control}
          inputProps={{
            disabled: disabled,
            min: scaleMin !== undefined ? scaleMin + 1 : 1,
            step: 1,
          }}
        />
        <FormInput
          type="text"
          name={`questions.${index}.scaleLabel.min`}
          label="Min Label (Optional)"
          placeholder="Enter min label"
          control={control}
          inputProps={{
            disabled: disabled,
          }}
        />
        <FormInput
          type="text"
          name={`questions.${index}.scaleLabel.max`}
          label="Max Label (Optional)"
          placeholder="Enter max label"
          control={control}
          inputProps={{
            disabled: disabled,
          }}
        />
      </div>
    );
  }

  // No additional fields for YES/NO and TEXT
  return null;
}

export default SurveyQuestions;
