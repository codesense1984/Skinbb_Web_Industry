import { Card, CardContent } from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import { apiGetSurveyTypes } from "@/modules/panel/services/survey.service";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import {
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface SurveyBasicsProps<T extends FieldValues> {
  control: Control<T>;
  setCurrentStep?: Dispatch<SetStateAction<number>>;
  disabled?: boolean;
  mode?: "create" | "edit" | "view";
  disableStatusInEdit?: boolean;
}

function SurveyBasics<T extends FieldValues>({
  control,
  disabled = false,
  mode = "create",
  disableStatusInEdit = false,
}: SurveyBasicsProps<T>) {
  const { setValue, watch } = useFormContext<T>();
  const selectedType = watch("type" as Path<T>);

  // Fetch survey types from API
  const { data: surveyTypesData, isLoading } = useQuery({
    queryKey: ["survey-types"],
    queryFn: async () => {
      return await apiGetSurveyTypes();
    },
  });

  const surveyTypes = surveyTypesData?.data || [];
  const typeOptions = surveyTypes.map((type) => ({
    value: type._id,
    label: type.displayName,
  }));

  // Update maxQuestions when type is selected
  useEffect(() => {
    if (selectedType) {
      const selectedSurveyType = surveyTypes.find(
        (type) => type._id === selectedType,
      );
      if (selectedSurveyType) {
        setValue(
          "maxQuestions" as Path<T>,
          selectedSurveyType.maxQuestions as any,
        );
      }
    }
  }, [selectedType, surveyTypes, setValue]);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between">
        <p className="text-foreground text-xl font-medium">Survey basics</p>
        <p className="text-sm">All the field are required!</p>
      </div>
      <Card>
        <CardContent className="grid gap-2 md:grid-cols-2 md:gap-5">
          <FormInput
            type="text"
            name={"title" as Path<T>}
            label="Name"
            placeholder="Enter name"
            control={control}
            disabled={disabled}
            inputProps={{
              autoFocus: true,
            }}
          />
          <FormInput
            type="select"
            options={typeOptions}
            name={"type" as Path<T>}
            label="Type"
            placeholder="Select survey type"
            control={control}
            disabled={disabled || isLoading}
            inputProps={{}}
          />

          <FormInput
            type="datepicker"
            mode="single"
            name={"startDate" as Path<T>}
            label="Start Date"
            control={control}
            disabled={disabled}
          />
          <FormInput
            type="datepicker"
            mode="single"
            name={"endDate" as Path<T>}
            label="End Date"
            control={control}
            disabled={disabled}
          />
          {mode !== "create" && (
            <FormInput
              type="select"
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "available", label: "Available" },
                { value: "completed", label: "Completed" },
              ]}
              name={"status" as Path<T>}
              label="Status"
              placeholder="Select status"
              className="md:col-span-2"
              control={control}
              disabled={disabled || (mode === "edit" && disableStatusInEdit)}
              inputProps={{}}
            />
          )}
          <FormInput
            type="textarea"
            name={"description" as Path<T>}
            label="Description(Optional)"
            control={control}
            placeholder="Enter description"
            className="col-span-2"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default SurveyBasics;
