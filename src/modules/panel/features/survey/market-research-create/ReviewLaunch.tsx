import { Badge } from "@/core/components/ui/badge";
import { BlobIcon, Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { FormInput } from "@/core/components/ui/form-input";
import { StatValue } from "@/core/components/ui/stat";
import { type SurveyQuestion } from "@/core/types/research.type";
import { BanknotesIcon, LinkIcon, UserIcon } from "@heroicons/react/24/outline";
import { Fragment, useMemo, type Dispatch, type SetStateAction } from "react";
import {
  useFormContext,
  type Control,
  type FieldValues,
} from "react-hook-form";
import type { SurveyFormData } from "@/modules/panel/components/shared/survey/survey-form/survey.schema";
import { formatDate } from "@/core/utils";
import { useQuery } from "@tanstack/react-query";
import { apiGetSurveyTypes } from "@/modules/panel/services/survey.service";
import { formatCurrency } from "@/core/utils/number";

interface ReviewLaunchProps<T extends FieldValues> {
  control: Control<T>;
  setCurrentStep?: Dispatch<SetStateAction<number>>;
}

function ReviewLaunch({
  control,
  setCurrentStep,
}: ReviewLaunchProps<SurveyFormData>) {
  const { watch } = useFormContext();
  const {
    title,
    description,
    type,
    maxQuestions,
    startDate,
    endDate,
    questions,
    audience,
  } = watch();

  // Fetch survey types to get displayName
  const { data: surveyTypesData } = useQuery({
    queryKey: ["survey-types"],
    queryFn: async () => {
      return await apiGetSurveyTypes();
    },
  });

  const surveyTypes = surveyTypesData?.data || [];
  const selectedSurveyType = useMemo(
    () => surveyTypes.find((st) => st._id === type),
    [surveyTypes, type],
  );
  const typeDisplayName = selectedSurveyType?.displayName || type;

  // Extract all audience fields
  const {
    locationTarget,
    targetMetro,
    targetCity,
    targetGender,
    age: ageGroups,
    targetSkinTypes,
    targetSkinConcerns,
    targetHairTypes,
    targetHairConcerns,
    respondents: respondentsValue,
    estimateResponse,
  } = audience || {};

  // Format location display
  const locationDisplay = useMemo(() => {
    if (locationTarget === "All") return "All";
    if (locationTarget === "Metro" && targetMetro?.length) {
      return targetMetro.join(", ");
    }
    if (locationTarget === "City" && targetCity) {
      return targetCity;
    }
    return locationTarget || "-";
  }, [locationTarget, targetMetro, targetCity]);

  // Format age groups display
  const ageDisplay = useMemo(() => {
    if (!ageGroups || !Array.isArray(ageGroups) || ageGroups.length === 0) {
      return "-";
    }
    return ageGroups.join(", ");
  }, [ageGroups]);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-10">
      <div className="space-y-5 md:col-span-6 lg:col-span-7">
        <div className="space-y-1">
          <p className="text-foreground text-xl font-medium">Review & Launch</p>
          <p>Double-check your survey details and launch when ready.</p>
        </div>
        <Card className="shadow">
          <CardContent>
            <h5>
              {title}{" "}
              <Button
                variant={"ghost"}
                className="my-auto ml-1 h-full p-1"
                onClick={() => setCurrentStep?.(1)}
              >
                <LinkIcon className="!size-4" />
              </Button>
            </h5>
            <p className="my-1">{description}</p>
            <div className="mt-3 flex justify-between gap-2">
              <div className="flex gap-2">
                <p>Type:</p>
                <p className="text-foreground font-medium">{typeDisplayName}</p>
              </div>
              <div className="flex gap-2">
                <p>Start Date:</p>
                <p className="text-foreground font-medium">
                  {formatDate(startDate)}
                </p>
              </div>
              {endDate && (
                <div className="flex gap-2">
                  <p>End Date:</p>
                  <p className="text-foreground font-medium">
                    {formatDate(endDate)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow">
          <CardHeader className="flex justify-between">
            <p className="text-foreground align-middle text-xl font-medium">
              Questions
              <Button
                variant={"ghost"}
                className="my-auto ml-1 h-full p-1"
                onClick={() => setCurrentStep?.(2)}
              >
                <LinkIcon className="!size-4" />
              </Button>
            </p>
            <p>
              {questions.length}/{maxQuestions || 5} Questions
            </p>
          </CardHeader>
          <hr />
          <CardContent className="space-y-4">
            {questions.map((question: SurveyQuestion, index: number) => (
              <Fragment key={question.text + question.type}>
                <div className="flex gap-2">
                  <p className="text-foreground font-medium">Q{index + 1}.</p>
                  <div>
                    <p className="text-foreground font-medium">
                      {question.text} ({question.type} )
                    </p>
                    {question?.description && (
                      <p className="my-1">
                        Description: {question.description}
                      </p>
                    )}
                    {!!question?.options.length && (
                      <div className="mt-3 flex justify-between gap-2">
                        <div className="flex gap-2">
                          <p>Options:</p>
                          {question?.options?.map((item) => (
                            <Badge
                              key={item}
                              variant={"outline"}
                              className="font-normal"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {questions?.length - 1 !== index && <hr />}
              </Fragment>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <p className="text-foreground text-xl font-medium">
              Target Audience
            </p>
          </CardHeader>
          <hr />
          <CardContent className="space-y-4">
            {respondentsValue && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Respondents</p>
                <p className="text-foreground font-medium">
                  {respondentsValue}
                </p>
              </div>
            )}
            {locationDisplay && locationDisplay !== "-" && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Location</p>
                <p className="text-foreground font-medium">{locationDisplay}</p>
              </div>
            )}
            {targetGender && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Gender</p>
                <p className="text-foreground font-medium capitalize">
                  {targetGender}
                </p>
              </div>
            )}
            {ageDisplay && ageDisplay !== "-" && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Age Group</p>
                <div className="flex flex-wrap gap-2">
                  {ageDisplay.split(", ").map((ageGroup: string) => (
                    <Badge
                      key={ageGroup}
                      variant="outline"
                      className="font-normal"
                    >
                      {ageGroup}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {targetSkinTypes && targetSkinTypes.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Skin Types</p>
                <div className="flex flex-wrap gap-2">
                  {targetSkinTypes.map((item: string) => (
                    <Badge key={item} variant="outline" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {targetSkinConcerns && targetSkinConcerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Skin Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {targetSkinConcerns.map((item: string) => (
                    <Badge key={item} variant="outline" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {targetHairTypes && targetHairTypes.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Hair Types</p>
                <div className="flex flex-wrap gap-2">
                  {targetHairTypes.map((item: string) => (
                    <Badge key={item} variant="outline" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {targetHairConcerns && targetHairConcerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Hair Concerns</p>
                <div className="flex flex-wrap gap-2">
                  {targetHairConcerns.map((item: string) => (
                    <Badge key={item} variant="outline" className="font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="relative md:col-span-4 lg:col-span-3">
        <div className="sticky top-5 flex flex-col gap-5">
          <p className="text-foreground text-xl font-medium">
            Target Audience & Estimated Cost{" "}
            <Button
              variant={"ghost"}
              className="my-auto ml-1 h-full p-1"
              onClick={() => setCurrentStep?.(3)}
            >
              <LinkIcon className="!size-4" />
            </Button>
          </p>
          <div className="bg-card space-y-6 rounded-md p-5 shadow">
            <div className="flex justify-between">
              <StatValue
                title="Available Respondents"
                note="Available Respondents"
                value={
                  estimateResponse ? (
                    <>
                      <span className="">
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
            {respondentsValue && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Number of Respondents
                </p>
                <p className="text-foreground text-primary text-3xl font-bold">
                  {respondentsValue}
                </p>
              </div>
            )}
          </div>
          <div className="bg-card space-y-6 rounded-md p-5 shadow">
            <div className="flex justify-between">
              <StatValue
                title="Estimated Cost"
                note="Available Respondents"
                value={
                  estimateResponse?.estimatedCost ? (
                    formatCurrency(estimateResponse.estimatedCost.totalCost, {
                      useAbbreviation: false,
                    })
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )
                }
                valueProps={{ className: "text-3xl text-primary" }}
              />
              <BlobIcon size="md" icon={<BanknotesIcon strokeWidth={1} />} />
            </div>
            <hr />
            <div className="space-y-2">
              <p className="text-sm font-medium">Estimated Completion Time</p>
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  control={control}
                  type="number"
                  name="estimatedCompletionTime.hours"
                  label="Hours"
                  inputProps={{
                    min: 0,
                    max: 24,
                    step: 1,
                    className: "mt-2",
                  }}
                />
                <FormInput
                  control={control}
                  type="number"
                  name="estimatedCompletionTime.minutes"
                  label="Minutes"
                  inputProps={{
                    min: 0,
                    max: 60,
                    step: 1,
                    className: "mt-2",
                  }}
                />
                <FormInput
                  control={control}
                  type="number"
                  name="estimatedCompletionTime.seconds"
                  label="Seconds"
                  inputProps={{
                    min: 0,
                    max: 60,
                    step: 1,
                    className: "mt-2",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewLaunch;
