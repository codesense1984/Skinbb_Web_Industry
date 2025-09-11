import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import { SURVEY } from "@/core/config/constants";
import { SurveyQuestionType } from "@/core/types/research.type";
import { mapToSelectOptions } from "@/core/utils";
import {
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
import type { SurveySchema } from "./survey.data";

interface SurveyQuestionsProps<T extends FieldValues> {
  control: Control<T>;
}

function SurveyQuestions({ control }: SurveyQuestionsProps<SurveySchema>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  return (
    <div className="flex flex-col gap-2 md:gap-5">
      <div className="flex items-center">
        <div className="space-y-1">
          <p className="text-foreground text-xl font-medium">
            Survey Questions
          </p>
          <p>
            Add up to ${SURVEY.MAX_QUESTIONS} questions that align with your
            survey’s goals.
          </p>
        </div>
        <p className="text-foreground ml-auto text-xl font-medium">
          {fields.length}/{SURVEY.MAX_QUESTIONS} Questions
        </p>
      </div>
      {fields.map((field, index) => {
        return (
          <Card key={field.id} className="md:gap-2 md:pt-2">
            <CardHeader className="flex min-h-10 items-center pt-0">
              <div className="mr-auto flex gap-2 font-medium">
                <QuestionMarkCircleIcon className="size-5" strokeWidth={2} />{" "}
                Question {index + 1}
              </div>
              <div>
                {fields.length !== 1 && (
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
                {fields.length < SURVEY.MAX_QUESTIONS && (
                  <Button
                    size={"icon"}
                    variant={"link"}
                    className="hover:text-foreground"
                    type="button"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <DocumentDuplicateIcon />
                  </Button>
                )}
              </div>
            </CardHeader>
            <hr />
            <CardContent className="grid grid-cols-1 gap-2 space-y-2 pt-3 md:grid-cols-3 md:gap-5">
              <FormInput
                type="select"
                name={`questions.${index}.type`}
                label="Type"
                placeholder="Select Type"
                options={mapToSelectOptions(SURVEY.INPUT_TYPES)}
                control={control}
              />
              <FormInput
                type="text"
                name={`questions.${index}.text`}
                label="Questions"
                placeholder="Enter Questions"
                control={control}
                className="col-span-2"
              />
              <FormInput
                type="rich_text"
                name={`questions.${index}.description`}
                label="Description(Optional)"
                placeholder="Enter description"
                control={control}
                className="col-span-3"
              />

              <QuestionOptions
                index={index}
                control={control}
                className="col-span-3"
              />
            </CardContent>
          </Card>
        );
      })}

      {fields.length < 5 && (
        <Button
          className="bg-card ml-auto shadow-md"
          type="button"
          variant={"outlined"}
          onClick={() =>
            append({
              text: "",
              description: "",
              type: SurveyQuestionType.yes_no,
              options: [""],
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
  ...props
}: SurveyQuestionsProps<SurveySchema> & {
  index: number;
} & ComponentProps<"div">) {
  const { setValue, watch } = useFormContext();
  const options: string[] =
    useWatch({
      control,
      name: `questions.${index}.options`,
    }) || [];

  const watchQuestionType = watch(`questions.${index}.type`);

  useEffect(() => {
    if (watchQuestionType === SurveyQuestionType.yes_no) {
      setValue(`questions.${index}.options`, ["Yes", "No"]);
    }
    //  else {
    //   setValue(`questions.${index}.options`, ["", ""]);
    // }
  }, [watchQuestionType, index, setValue]);

  const handleChange = (value: string, optionIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = value;
    setValue(`questions.${index}.options`, updated);
  };

  const handleAdd = () => {
    setValue(`questions.${index}.options`, [...options, ""]);
  };

  const handleRemove = (optionIndex: number) => {
    const updated = [...options];
    updated.splice(optionIndex, 1);
    setValue(`questions.${index}.options`, updated);
  };

  if (watchQuestionType === SurveyQuestionType.yes_no) {
    return null;
  }

  return (
    <div {...props}>
      <p className="mb-2">Questions</p>
      <div className="max-w-lg space-y-2">
        {options.map((_item, optionIndex) => {
          return (
            <div key={String(optionIndex)} className="flex items-center gap-2">
              <p className="text-muted-foreground"> {optionIndex + 1}</p>
              <FormInput
                key={optionIndex}
                type="text"
                name={`questions.${index}.options.${optionIndex}`}
                placeholder="Enter option"
                control={control}
                className="flex-1"
                inputProps={{
                  onChange: (e) => {
                    handleChange(
                      (e.target as HTMLInputElement).value,
                      optionIndex,
                    );
                  },
                }}
              />
              {options.length !== 1 && (
                <Button
                  size={"icon"}
                  variant={"outlined"}
                  type="button"
                  className="hover:text-destructive"
                  onClick={() => {
                    console.log("🚀 ~ {fields.map ~ index:", optionIndex);
                    handleRemove(optionIndex);
                  }}
                >
                  <TrashIcon />
                </Button>
              )}
              {options.length - 1 === optionIndex && options.length < 7 && (
                <Button
                  size={"icon"}
                  variant={"outlined"}
                  type="button"
                  onClick={handleAdd}
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

export default SurveyQuestions;
