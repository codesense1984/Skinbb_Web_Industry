import { Card, CardContent } from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import { mapToSelectOptions } from "@/core/utils";
import type { Dispatch, SetStateAction } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface SurveyBasicsProps<T extends FieldValues> {
  control: Control<T>;
  setCurrentStep?: Dispatch<SetStateAction<number>>;
}

function SurveyBasics<T extends FieldValues>({
  control,
}: SurveyBasicsProps<T>) {
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
            options={mapToSelectOptions(["health care"])}
            name={"category" as Path<T>}
            label="Category"
            placeholder="Enter category"
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
          <FormInput
            className=""
            type="datepicker"
            mode="single"
            name={"startDate" as Path<T>}
            label="Start Date"
            control={control}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default SurveyBasics;
