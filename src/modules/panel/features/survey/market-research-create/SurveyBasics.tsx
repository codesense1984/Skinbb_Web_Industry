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
}

function SurveyBasics<T extends FieldValues>({
  control,
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
            inputProps={{
              disabled: isLoading,
            }}
          />
          <FormInput
            className=""
            type="datepicker"
            mode="single"
            name={"startDate" as Path<T>}
            label="Start Date"
            control={control}
          />
          <FormInput
            className=""
            type="datepicker"
            mode="single"
            name={"endDate" as Path<T>}
            label="End Date"
            control={control}
          />

          <FormInput
            type="textarea"
            name={"description" as Path<T>}
            label="Description(Optional)"
            control={control}
            placeholder="Enter description"
            className="col-span-2"
          />
        </CardContent>
      </Card>
    </>
  );
}

export default SurveyBasics;
