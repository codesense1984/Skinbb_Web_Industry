import { BlobIcon } from "@/core/components/ui/button";
import { FormInput } from "@/core/components/ui/form-input";
import { StatValue } from "@/core/components/ui/stat";
import {
  ToggleButtonGroup,
  ToggleButtonGroupItem,
} from "@/core/components/ui/toggle-group";
import { MASTER_DATA, PERSONAL_CARE_DATA } from "@/core/config/constants";
import { type SurveyAudience } from "@/core/types/research.type";
import { cn } from "@/core/utils";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, type ComponentProps } from "react";
import {
  useFormContext,
  type Control,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import type { SurveySchema } from "./survey.data";

interface TargetAudienceProps<T extends FieldValues> {
  control: Control<T>;
}

function TargetAudience({ control }: TargetAudienceProps<SurveySchema>) {
  const { watch, setValue } = useFormContext();

  // Extract watch calls to variables to simplify dependency arrays
  const skinValue = watch("audience.skin");
  const respondentsValue = watch("audience.respondents");
  const concernValue = watch("audience.concern");
  const skinTypeValue = watch("audience.skinType");

  const selectedCategories: (keyof typeof PERSONAL_CARE_DATA)[] = useMemo(
    () => skinValue ?? [],
    [skinValue],
  );

  const selectedRespondents: (keyof typeof PERSONAL_CARE_DATA)[] = useMemo(
    () => respondentsValue ?? [],
    [respondentsValue],
  );

  const allConcerns = useMemo(
    () =>
      selectedCategories
        .flatMap((item) => PERSONAL_CARE_DATA[item]?.concerns || [])
        .filter(Boolean),
    [selectedCategories],
  );

  const allTypes = useMemo(
    () =>
      selectedCategories
        .flatMap((item) => PERSONAL_CARE_DATA[item]?.types || [])
        .filter(Boolean),
    [selectedCategories],
  );

  const selectedConcerns = useMemo(() => concernValue ?? [], [concernValue]);
  const selectedTypes = useMemo(() => skinTypeValue ?? [], [skinTypeValue]);

  // Clean up deselected concerns/types on category change
  useEffect(() => {
    // Only run cleanup if we have selected categories and either concerns or types
    if (
      selectedCategories.length > 0 &&
      (selectedConcerns.length > 0 || selectedTypes.length > 0)
    ) {
      const filteredConcerns = selectedConcerns.filter((c: string) =>
        allConcerns.includes(c),
      );
      const filteredTypes = selectedTypes.filter((t: string) =>
        allTypes.includes(t),
      );

      // Only update if the filtered values are different from current values
      if (
        filteredConcerns.length !== selectedConcerns.length ||
        filteredTypes.length !== selectedTypes.length
      ) {
        setValue("audience.concern", filteredConcerns);
        setValue("audience.skinType", filteredTypes);
      }
    }
  }, [
    selectedCategories,
    allConcerns,
    allTypes,
    selectedConcerns,
    selectedTypes,
    setValue,
  ]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-10">
      <div className="md:col-span-6 lg:col-span-7">
        <div className="mb-5 space-y-1">
          <p className="text-foreground text-xl font-medium">
            Target Audience & Estimated Cost
          </p>
          <p>
            Select your survey audience and see the estimated cost in real time.
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-2 md:gap-5">
          <TargetToggle
            label={"Location"}
            name={"location"}
            values={MASTER_DATA.location}
          />
          <TargetToggle
            label={"Gender"}
            name={"gender"}
            values={MASTER_DATA.gender}
          />
          <TargetToggle
            className="col-span-2"
            label={"Age"}
            name={"age"}
            values={MASTER_DATA.ageGroup}
          />
          <TargetToggle
            className="col-span-2"
            label={"Skin"}
            name={"skin"}
            values={Object.keys(PERSONAL_CARE_DATA)}
          />
          {!!allConcerns?.length && (
            <TargetToggle
              className="col-span-2"
              label={"Concern"}
              name={"concern"}
              values={allConcerns}
            />
          )}

          {!!allTypes.length && (
            <TargetToggle
              className="col-span-2"
              label={"Skin Type"}
              name={"skinType"}
              values={allTypes}
            />
          )}
        </div>
      </div>
      <div className="relative md:col-span-4 lg:col-span-3">
        <div className="sticky top-5 flex flex-col gap-5">
          <div className="bg-card space-y-6 rounded-md p-5 shadow">
            <div className="flex justify-between">
              <StatValue
                title="Available Respondents"
                note="Available Respondents"
                value={
                  <>
                    <span className="text-primary">300</span> / 1,328
                  </>
                }
                valueProps={{ className: "text-3xl" }}
              />
              <BlobIcon size="md" icon={<UserIcon strokeWidth={1} />} />
            </div>

            <div className="flex w-full items-center justify-between gap-2">
              <FormInput
                control={control}
                type="slider"
                name="audience.respondents"
                label="Select Number of Respondents"
                className="w-full"
                inputProps={{
                  className: "mt-2",
                }}
              />
              {selectedRespondents}
            </div>
          </div>
          <div className="bg-card space-y-6 rounded-md p-5 shadow">
            <div className="flex justify-between">
              <StatValue
                title="Estimated Cost"
                note="Available Respondents"
                value={"₹12,500"}
                valueProps={{ className: "text-3xl" }}
                description="₹5 per response x 500 responses"
                descriptionProps={{
                  className: "text-sm",
                }}
              />
              <BlobIcon size="md" icon={<BanknotesIcon strokeWidth={1} />} />
            </div>
            <hr />
            <div className="relative flex justify-between">
              <StatValue
                title="Estimated Completion Date"
                note="Available Respondents"
                value={"03-May-25"}
                valueProps={{ className: "text-3xl" }}
              />
              <BlobIcon size="md" icon={<CalendarDaysIcon strokeWidth={1} />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TargetToggleProps {
  name: keyof SurveyAudience;
  values: string[];
  label: string;
}

export function TargetToggle({
  name,
  values = [],
  label,
  className,
  ...props
}: TargetToggleProps & ComponentProps<"div">) {
  const { watch, setValue, formState } = useFormContext();
  const targetValues: string[] = watch(`audience.${name}`) ?? [];
  const error = (formState.errors.audience as FieldErrors<SurveyAudience>)?.[
    name
  ];

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <p>{label}</p>
      <ToggleButtonGroup
        type="multiple"
        value={targetValues}
        onValueChange={(value) => {
          setValue(`audience.${name}`, value, { shouldValidate: true });
        }}
        className="w-full [&_*]:min-h-13 [&_*]:grow"
      >
        {values.map((item) => (
          <ToggleButtonGroupItem
            key={item}
            value={item}
            aria-label={`Toggle ${item}`}
            className="capitalize"
          >
            {item}
          </ToggleButtonGroupItem>
        ))}
      </ToggleButtonGroup>
      {error && (
        <p
          data-slot="form-message"
          className={cn("text-destructive text-sm", className)}
          {...props}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}

export default TargetAudience;
