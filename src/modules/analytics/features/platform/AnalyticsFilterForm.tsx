// components/forms/AnalyticsFilterForm.tsx
import { Button } from "@/core/components/ui/button";
import { Form } from "@/core/components/ui/form";
import { FormInput } from "@/core/components/ui/form-input";
import { PERSONAL_CARE_DATA } from "@/core/config/constants";
import { mapToSelectOptions } from "@/core/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type FilterFormValues = {
  category: string;
  concern: string;
  skinType: string;
};

type AnalyticsFilterFormProps = {
  onSubmit: (values: FilterFormValues) => void;
  defaultValues?: FilterFormValues;
};

type Category = keyof typeof PERSONAL_CARE_DATA;

export const AnalyticsFilterForm = ({
  onSubmit,
  defaultValues = {
    category: "all",
    concern: "all",
    skinType: "all",
  },
}: AnalyticsFilterFormProps) => {
  const form = useForm<FilterFormValues>({
    defaultValues,
  });

  const { control, watch, handleSubmit, setValue } = form;
  const category = watch("category");
  const concern = watch("concern");
  const isValidCategory = (category: string): category is Category =>
    category in PERSONAL_CARE_DATA;

  const concernOptions = isValidCategory(category)
    ? (PERSONAL_CARE_DATA[category]?.concerns ?? [])
    : [];

  const skinTypeOptions = isValidCategory(category)
    ? (PERSONAL_CARE_DATA[category]?.types ?? [])
    : [];

  useEffect(() => {
    setValue("concern", "all");
    setValue("skinType", "all");
  }, [category, setValue]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card flex w-full flex-wrap items-end gap-5 rounded-md p-5 shadow-md [&_div]:flex-1 [&_div]:basis-40"
      >
        <FormInput
          type="select"
          label="Category"
          options={[
            { value: "all", label: "All" },
            ...mapToSelectOptions(Object.keys(PERSONAL_CARE_DATA)),
          ]}
          name="category"
          control={control}
        ></FormInput>
        <FormInput
          type="select"
          label="Concern"
          name="concern"
          options={[
            { value: "all", label: "All" },
            ...mapToSelectOptions(concernOptions),
          ]}
          disabled={!category || category === "all"}
          // disabled={true}
          control={control}
        ></FormInput>
        <FormInput
          type="select"
          label="Skin Type"
          name="skinType"
          disabled={!concern || !skinTypeOptions.length || category === "all"}
          options={[
            { value: "all", label: "All" },
            ...mapToSelectOptions(skinTypeOptions),
          ]}
          control={control}
        ></FormInput>
        <Button type="submit" variant={"outlined"} color={"primary"}>
          Apply
        </Button>
      </form>
    </Form>
  );
};
