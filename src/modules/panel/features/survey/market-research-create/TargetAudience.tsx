import { BlobIcon, Button } from "@/core/components/ui/button";
import { FormInput } from "@/core/components/ui/form-input";
import { StatValue } from "@/core/components/ui/stat";
import {
  ToggleButtonGroup,
  ToggleButtonGroupItem,
} from "@/core/components/ui/toggle-group";
import { MASTER_DATA } from "@/core/config/constants";
import { type SurveyAudience } from "@/core/types/research.type";
import { cn } from "@/core/utils";
import { BanknotesIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import {
  useFormContext,
  useWatch,
  type Control,
  type FieldErrors,
  type FieldValues,
} from "react-hook-form";
import type { SurveyFormData } from "@/modules/panel/components/shared/survey/survey-form/survey.schema";
import { useQuery } from "@tanstack/react-query";
import {
  apiEstimateEligibleRespondents,
  apiGetMetroCities,
  apiGetTargetingOptions,
} from "@/modules/panel/services/survey.service";
import { INPUT_TYPES } from "@/core/components/ui/form-input";
import { AnimatePresence, motion, type MotionProps } from "motion/react";
import { formatCurrency } from "@/core/utils/number";
import type { EstimateEligibleRespondentsParams } from "@/modules/panel/types/survey.types";

interface TargetAudienceProps<T extends FieldValues> {
  control: Control<T>;
}

function TargetAudience({ control }: TargetAudienceProps<SurveyFormData>) {
  const { setValue } = useFormContext();

  const [questions] = useWatch({
    name: ["questions"],
  });

  const [
    respondentsValue,
    locationTarget,
    targetMetro,
    targetCity,
    targetGender,
    ageGroups,
    selectedCategories,
    targetSkinTypes,
    targetSkinConcerns,
    targetHairTypes,
    targetHairConcerns,
  ] = useWatch({
    name: [
      "audience.respondents",
      "audience.locationTarget",
      "audience.targetMetro",
      "audience.targetCity",
      "audience.targetGender",
      "audience.age",
      "audience.selectedCategories",
      "audience.targetSkinTypes",
      "audience.targetSkinConcerns",
      "audience.targetHairTypes",
      "audience.targetHairConcerns",
    ],
  });

  // // Track if we've initialized categories to prevent infinite loops
  // const hasInitializedCategories = useRef(false);

  // // Initialize selectedCategories based on existing data when editing (only once)
  // useEffect(() => {
  //   // Only initialize once and if categories are not set but we have skin/hair data
  //   if (
  //     !hasInitializedCategories.current &&
  //     (!selectedCategories || selectedCategories.length === 0)
  //   ) {
  //     const categories: ("Skin" | "Hair")[] = [];
  //     if (targetSkinTypes && targetSkinTypes.length > 0) {
  //       categories.push("Skin");
  //     }
  //     if (targetSkinConcerns && targetSkinConcerns.length > 0) {
  //       categories.push("Skin");
  //     }
  //     if (targetHairTypes && targetHairTypes.length > 0) {
  //       categories.push("Hair");
  //     }
  //     if (targetHairConcerns && targetHairConcerns.length > 0) {
  //       categories.push("Hair");
  //     }
  //     // Remove duplicates
  //     const uniqueCategories = Array.from(new Set(categories));
  //     if (uniqueCategories.length > 0) {
  //       setValue("audience.selectedCategories", uniqueCategories, {
  //         shouldDirty: false,
  //       });
  //       hasInitializedCategories.current = true;
  //     }
  //   }
  //   // Mark as initialized if categories are already set
  //   if (selectedCategories && selectedCategories.length > 0) {
  //     hasInitializedCategories.current = true;
  //   }
  // }, [
  //   selectedCategories,
  //   targetSkinTypes,
  //   targetSkinConcerns,
  //   targetHairTypes,
  //   targetHairConcerns,
  //   setValue,
  // ]);

  const selectedCategory = selectedCategories || [];

  // Build API params from form values
  const buildApiParams =
    useMemo((): EstimateEligibleRespondentsParams | null => {
      const params: EstimateEligibleRespondentsParams = {};

      // Location (all fields are optional per API spec)
      if (locationTarget) {
        if (locationTarget === "All") {
          params.locationTarget = "All";
        } else if (
          locationTarget === "Metro" &&
          targetMetro &&
          targetMetro.length > 0
        ) {
          params.locationTarget = "Metro";
          params.targetMetro = targetMetro;
        } else if (locationTarget === "City" && targetCity) {
          params.locationTarget = "City";
          params.targetCity = targetCity;
        } else {
          // If location is selected but fields are missing, still include locationTarget
          params.locationTarget = locationTarget as "All" | "Metro" | "City";
        }
      }

      // Gender
      if (targetGender) {
        params.targetGender = targetGender.toLowerCase() as
          | "male"
          | "female"
          | "unisex";
      }

      // Age - convert selected age groups to targetAgeRanges format
      if (ageGroups && ageGroups.length > 0) {
        params.targetAgeRanges = ageGroups
          .map((selectedLabel: string) => {
            // Find the age group object from MASTER_DATA by label
            const ageGroup = MASTER_DATA.ageGroup.find(
              (ag) => ag.label === selectedLabel,
            );
            if (ageGroup) {
              return {
                min: ageGroup.min,
                max: ageGroup.max,
                label: ageGroup.label,
              };
            }
            return null;
          })
          .filter(
            (
              range: { min: number; max: number; label: string } | null,
            ): range is { min: number; max: number; label: string } =>
              range !== null,
          );
      }

      // Skin types and concerns
      if (targetSkinTypes && targetSkinTypes.length > 0) {
        params.targetSkinTypes = targetSkinTypes;
      }
      if (targetSkinConcerns && targetSkinConcerns.length > 0) {
        params.targetSkinConcerns = targetSkinConcerns;
      }

      // Hair types and concerns
      if (targetHairTypes && targetHairTypes.length > 0) {
        params.targetHairTypes = targetHairTypes;
      }
      if (targetHairConcerns && targetHairConcerns.length > 0) {
        params.targetHairConcerns = targetHairConcerns;
      }

      // Questions - map to questionTypeId format
      if (questions && questions.length > 0) {
        params.questions = questions.map((q: { type: string }) => {
          return {
            questionTypeId: q.type,
          };
        });
      }

      // Max responses from respondents value
      if (respondentsValue) {
        const maxResponses = parseInt(respondentsValue, 10);
        if (!isNaN(maxResponses) && maxResponses > 0) {
          params.maxResponses = maxResponses;
        }
      }

      return params;
    }, [
      locationTarget,
      targetMetro,
      targetCity,
      targetGender,
      ageGroups,
      targetSkinTypes,
      targetSkinConcerns,
      targetHairTypes,
      targetHairConcerns,
      questions,
      respondentsValue,
    ]);

  // State to control when to fetch
  const [fetchParams, setFetchParams] =
    useState<EstimateEligibleRespondentsParams | null>(null);

  // Use query for API call (POST request) - call once on mount and on button click
  const {
    data: estimateData,
    isLoading: isEstimating,
    refetch,
  } = useQuery({
    queryKey: ["estimate-eligible-respondents", fetchParams],
    queryFn: ({ signal }) => {
      if (!fetchParams) {
        throw new Error("Invalid params");
      }
      return apiEstimateEligibleRespondents(fetchParams, signal);
    },
    enabled: fetchParams !== null,
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const estimateResponse = estimateData?.data;

  // Save estimate response to form
  useEffect(() => {
    if (estimateResponse) {
      setValue("audience.estimateResponse", estimateResponse);
    }
  }, [estimateResponse, setValue]);

  // Call API once on mount if params are available (only if not editing with existing data)
  useEffect(() => {
    // Only auto-fetch if we don't have estimate response (meaning it's a new survey)
    if (buildApiParams && !fetchParams) {
      setFetchParams(buildApiParams);
    }
  }, [buildApiParams, fetchParams]);

  // Handle calculate button click
  const handleCalculate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!buildApiParams) return;
    setFetchParams(buildApiParams);
    refetch();
  };

  // Fetch metro cities when Metro is selected
  const { data: metroCitiesData, isLoading: isLoadingMetroCities } = useQuery({
    queryKey: ["metro-cities"],
    queryFn: ({ signal }) => apiGetMetroCities(signal),
    enabled: locationTarget === "Metro",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch targeting options
  const { data: targetingOptionsData } = useQuery({
    queryKey: ["targeting-options"],
    queryFn: ({ signal }) => apiGetTargetingOptions(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const metroCities = metroCitiesData?.data?.metroCities ?? [];
  const targetingOptions = targetingOptionsData?.data;

  // Format API data to match display format (capitalize first letter of each word)
  const formatOption = (str: string) => {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const skinTypes = useMemo(
    () => targetingOptions?.skinTypes?.map(formatOption) ?? [],
    [targetingOptions],
  );
  const skinConcerns = useMemo(
    () => targetingOptions?.skinConcerns?.map(formatOption) ?? [],
    [targetingOptions],
  );
  const hairTypes = useMemo(
    () => targetingOptions?.hairTypes?.map(formatOption) ?? [],
    [targetingOptions],
  );
  const hairConcerns = useMemo(
    () => targetingOptions?.hairConcerns?.map(formatOption) ?? [],
    [targetingOptions],
  );

  // Clean up metro/city when locationTarget changes
  // useEffect(() => {
  //   if (locationTarget === "All") {
  //     setValue("audience.targetMetro", undefined);
  //     setValue("audience.targetCity", undefined);
  //   } else if (locationTarget === "Metro") {
  //     setValue("audience.targetCity", undefined);
  //   } else if (locationTarget === "City") {
  //     setValue("audience.targetMetro", undefined);
  //   }
  // }, [locationTarget, setValue]);

  // Clean up skin/hair data when category selection changes
  // useEffect(() => {
  //   if (!selectedCategory.includes("Skin")) {
  //     setValue("audience.targetSkinTypes", undefined);
  //     setValue("audience.targetSkinConcerns", undefined);
  //   }
  //   if (!selectedCategory.includes("Hair")) {
  //     setValue("audience.targetHairTypes", undefined);
  //     setValue("audience.targetHairConcerns", undefined);
  //   }
  // }, [selectedCategory, setValue]);

  const selectedRespondents = useMemo(
    () => respondentsValue ?? [],
    [respondentsValue],
  );

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
        <AnimatePresence>
          <div className="flex flex-col gap-2 md:gap-5">
            {/* Location - Radio Buttons */}
            <TargetRadio
              label="Location"
              name="locationTarget"
              options={["All", "Metro", "City"]}
            />

            {/* Metro Cities Toggle - Show when Metro is selected */}
            {locationTarget === "Metro" && (
              <TargetToggle
                className="col-span-2"
                label="Metro Cities"
                name="targetMetro"
                values={metroCities}
                isLoading={isLoadingMetroCities}
              />
            )}

            {/* City Input - S  how when City is selected */}
            {locationTarget === "City" && (
              <motion.div exit={{ opacity: 1 }} layout className="space-y-2">
                <p>City</p>
                <FormInput
                  control={control}
                  type={INPUT_TYPES.TEXT}
                  name="audience.targetCity"
                  label=""
                  placeholder="Enter city name"
                  inputProps={{
                    className: "mt-2",
                  }}
                />
              </motion.div>
            )}

            {/* Gender - Radio Buttons */}
            <TargetRadio
              label="Gender"
              name="targetGender"
              options={["male", "female", "unisex"]}
            />

            {/* Age - Toggle Buttons */}
            <TargetToggle
              className="col-span-2"
              label="Age"
              name="age"
              values={MASTER_DATA.ageGroup.map((ag) => ag.label)}
            />

            {/* Skin/Hair Category Selector - Not saved to form */}
            <div className="col-span-2 space-y-2">
              <p>Category</p>
              <ToggleButtonGroup
                type="multiple"
                value={selectedCategory}
                onValueChange={(value) => {
                  setValue(
                    "audience.selectedCategories",
                    value as ("Skin" | "Hair")[],
                  );
                }}
                // className="w-full [&_*]:min-h-13 [&_*]:grow"
              >
                <ToggleButtonGroupItem value="Skin" aria-label="Toggle Skin">
                  Skin
                </ToggleButtonGroupItem>
                <ToggleButtonGroupItem value="Hair" aria-label="Toggle Hair">
                  Hair
                </ToggleButtonGroupItem>
              </ToggleButtonGroup>
            </div>

            {/* Skin Types - Show when Skin is selected */}
            {selectedCategory.includes("Skin") && skinTypes.length > 0 && (
              <TargetToggle
                label="Skin Types"
                name="targetSkinTypes"
                values={skinTypes}
              />
            )}

            {/* Skin Concerns - Show when Skin is selected */}
            {selectedCategory.includes("Skin") && skinConcerns.length > 0 && (
              <TargetToggle
                label="Skin Concerns"
                name="targetSkinConcerns"
                values={skinConcerns}
              />
            )}

            {/* Hair Types - Show when Hair is selected */}
            {selectedCategory.includes("Hair") && hairTypes.length > 0 && (
              <TargetToggle
                label="Hair Types"
                name="targetHairTypes"
                values={hairTypes}
              />
            )}

            {/* Hair Concerns - Show when Hair is selected */}
            {selectedCategory.includes("Hair") && hairConcerns.length > 0 && (
              <TargetToggle
                label="Hair Concerns"
                name="targetHairConcerns"
                values={hairConcerns}
              />
            )}
          </div>
        </AnimatePresence>
      </div>
      <div className="relative md:col-span-4 lg:col-span-3">
        <div className="sticky top-5 flex flex-col gap-5">
          <Button
            type="button"
            onClick={handleCalculate}
            disabled={!buildApiParams || isEstimating}
            color={"secondary"}
            className="w-full"
          >
            {isEstimating ? "Calculating..." : "Calculate"}
          </Button>
          <div className="bg-card space-y-6 rounded-md p-5 shadow">
            <div className="flex justify-between">
              <StatValue
                title="Available Respondents"
                note="Available Respondents"
                value={
                  isEstimating ? (
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-8 w-20 animate-pulse rounded" />
                      <span className="text-muted-foreground">/</span>
                      <div className="bg-muted h-8 w-20 animate-pulse rounded" />
                    </div>
                  ) : estimateResponse ? (
                    <>
                      <span className="text-primary">
                        {estimateResponse?.count?.toLocaleString()}
                      </span>{" "}
                      /{" "}
                      {estimateResponse?.breakdown?.totalUsers?.toLocaleString()}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
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
                  step: 1,
                  min: 1,
                  max: estimateResponse?.count || 0,
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
                value={
                  isEstimating ? (
                    <div className="bg-muted h-9 w-32 animate-pulse rounded" />
                  ) : estimateResponse?.estimatedCost ? (
                    formatCurrency(estimateResponse.estimatedCost.totalCost, {
                      useAbbreviation: false,
                    })
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                valueProps={{ className: "text-3xl" }}
              />
              <BlobIcon size="md" icon={<BanknotesIcon strokeWidth={1} />} />
            </div>
            {/* <hr />
            <div className="relative flex justify-between">
              <StatValue
                title="Estimated Completion Date"
                note="Available Respondents"
                value={
                  isEstimating ? (
                    <div className="bg-muted h-9 w-28 animate-pulse rounded" />
                  ) : estimateResponse?.estimatedCost ? (
                    (() => {
                      // Calculate estimated completion date (assuming 7 days for completion)
                      const completionDate = new Date();
                      completionDate.setDate(completionDate.getDate() + 7);
                      // Format as "03-May-25"
                      const day = completionDate
                        .getDate()
                        .toString()
                        .padStart(2, "0");
                      const month = completionDate.toLocaleDateString("en-US", {
                        month: "short",
                      });
                      const year = completionDate
                        .getFullYear()
                        .toString()
                        .slice(-2);
                      return `${day}-${month}-${year}`;
                    })()
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                valueProps={{ className: "text-3xl" }}
              />
              <BlobIcon size="md" icon={<CalendarDaysIcon strokeWidth={1} />} />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TargetRadioProps {
  name: keyof SurveyAudience | "locationTarget" | "targetGender";
  options: string[];
  label: string;
  className?: string;
}

export function TargetRadio({
  name,
  options = [],
  label,
  className,
  ...props
}: TargetRadioProps & Omit<MotionProps, "className">) {
  const { watch, setValue, formState } = useFormContext();
  const targetValue: string = watch(`audience.${name}`) ?? "";
  const audienceErrors = formState.errors.audience as
    | FieldErrors<SurveyAudience>
    | undefined;
  const error = audienceErrors?.[name as keyof SurveyAudience];

  return (
    <motion.div
      exit={{ opacity: 1 }}
      layout
      className={cn("space-y-2", className)}
      {...props}
    >
      <p>{label}</p>
      <ToggleButtonGroup
        type="single"
        value={targetValue}
        onValueChange={(value) => {
          if (value) {
            setValue(`audience.${name}`, value, { shouldValidate: true });
          }
        }}
        // className="w-full [&_*]:min-h-13 [&_*]:grow"
      >
        {options.map((option) => (
          <ToggleButtonGroupItem
            key={option}
            value={option}
            aria-label={`Select ${option}`}
            className="capitalize"
          >
            <div
              data-slot="checkbox"
              className={cn(
                "border-input mr-1 flex size-4 items-center justify-center rounded-full border",
              )}
            ></div>
            {option}
          </ToggleButtonGroupItem>
        ))}
      </ToggleButtonGroup>
      {error && (
        <p
          data-slot="form-message"
          className={cn("text-destructive text-sm", className)}
        >
          {error.message}
        </p>
      )}
    </motion.div>
  );
}

interface TargetToggleProps {
  name:
    | keyof SurveyAudience
    | "targetMetro"
    | "targetSkinTypes"
    | "targetSkinConcerns"
    | "targetHairTypes"
    | "targetHairConcerns";
  values: string[];
  label: string;
  className?: string;
  isLoading?: boolean;
}

export function TargetToggle({
  name,
  values = [],
  label,
  className,
  isLoading = false,
  ...props
}: TargetToggleProps & Omit<MotionProps, "className" | "values">) {
  const { watch, setValue, formState } = useFormContext();
  const targetValues: string[] = watch(`audience.${name}`) ?? [];
  const audienceErrors = formState.errors.audience as
    | FieldErrors<SurveyAudience>
    | undefined;
  const error = audienceErrors?.[name as keyof SurveyAudience];

  if (isLoading) {
    return (
      <motion.div
        exit={{ opacity: 1 }}
        layout
        className={cn("space-y-2", className)}
        {...props}
      >
        <p>{label}</p>
        <div className="space-y-2">
          <div className="bg-muted h-10 w-full animate-pulse rounded" />
          <div className="bg-muted h-10 w-3/4 animate-pulse rounded" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      exit={{ opacity: 1 }}
      layout
      className={cn("space-y-2", className)}
      {...props}
    >
      <p>{label}</p>
      <ToggleButtonGroup
        type="multiple"
        value={targetValues}
        onValueChange={(value) => {
          setValue(`audience.${name}`, value, { shouldValidate: true });
        }}
        // className="w-full [&_*]:min-h-13 [&_*]:grow"
      >
        {values.map((item) => {
          return (
            <ToggleButtonGroupItem
              key={item}
              value={item}
              aria-label={`Toggle ${item}`}
              className="capitalize"
            >
              <div
                data-slot="checkbox"
                className={cn(
                  "border-input mr-1 flex size-4 items-center justify-center rounded-xs border",
                )}
              ></div>
              {item}
            </ToggleButtonGroupItem>
          );
        })}
      </ToggleButtonGroup>
      {error && (
        <p
          data-slot="form-message"
          className={cn("text-destructive text-sm", className)}
        >
          {error.message}
        </p>
      )}
    </motion.div>
  );
}

export default TargetAudience;
