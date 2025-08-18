import { Badge } from "@/core/components/ui/badge";
import { BlobIcon, Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { StatValue } from "@/core/components/ui/stat";
import {
  type SurveyAudience,
  type SurveyQuestion,
} from "@/core/types/research.type";
import {
  BanknotesIcon,
  CalendarDaysIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { formatDate } from "@/core/utils";

interface SurveyReviewProps {
  title: string;
  description: string;
  category: string;
  startDate: Date | string;
  questions: SurveyQuestion[];
  audience: SurveyAudience;
  setCurrentStep?: (step: number) => void;
  headerTitle?: string;
  headerDescription?: string;
}

export default function SurveyReview({
  title,
  description,
  category,
  startDate,
  questions,
  audience,
  setCurrentStep,
  headerTitle = "Review & Launch",
  headerDescription = "Double-check your survey details and launch when ready.",
}: SurveyReviewProps) {
  const { location, gender, age, skin, skinType, concern, respondents } =
    audience ?? {};

  const renderEditButton = (step: number) => {
    if (!setCurrentStep) return null;

    return (
      <Button
        variant={"ghost"}
        className="my-auto ml-1 h-full p-1"
        onClick={() => setCurrentStep(step)}
      >
        <LinkIcon className="!size-4" />
      </Button>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-10">
      <div className="relative md:col-span-6 lg:col-span-7">
        <div className="sticky top-5 space-y-5">
          {(headerTitle || headerDescription) && (
            <div className="space-y-1">
              <p className="text-foreground text-xl font-medium">
                {headerTitle}
              </p>
              <p>{headerDescription}</p>
            </div>
          )}
          <Card className="shadow">
            <CardContent>
              <h5>
                {title}
                {renderEditButton(1)}
              </h5>
              <p className="my-1">{description}</p>
              <div className="mt-3 flex justify-between gap-2">
                <div className="flex gap-2">
                  <p>Category:</p>
                  <p className="text-foreground font-medium">{category}</p>
                </div>
                <div className="flex gap-2">
                  <p>Start Date: :</p>
                  <p className="text-foreground font-medium">
                    {formatDate(startDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow">
            <CardHeader className="flex justify-between">
              <p className="text-foreground align-middle text-xl font-medium">
                Questions
                {renderEditButton(2)}
              </p>
              <p>{questions.length}/5 Questions</p>
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
                          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
      <div className="relative md:col-span-4 lg:col-span-3">
        <div className="sticky top-5 flex flex-col gap-5">
          <p className="text-foreground text-xl font-medium">
            Target Audience & Estimated Cost
            {renderEditButton(3)}
          </p>
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
                value={formatDate("03-May-25")}
                valueProps={{ className: "text-3xl" }}
              />
              <BlobIcon size="md" icon={<CalendarDaysIcon strokeWidth={1} />} />
            </div>
          </div>
          {/* <div className="flex flex-wrap gap-5 [&_*]:grow"> */}
          <div className="columns-2 space-y-5 [&_*]:break-inside-avoid">
            <StatCard title="Respondents" value={respondents}></StatCard>
            <StatCard title="Location" value={location}></StatCard>
            <StatCard title="Gender" value={gender}></StatCard>
            <StatCard title="Age Group" value={age}></StatCard>
            <StatCard title="Category" value={skin}></StatCard>
            <StatCard title="Concern" value={concern}></StatCard>
            <StatCard title="Skin Type" value={skinType}></StatCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string[] | string | number;
}) {
  if (
    ((typeof value === "string" || typeof value === "number") && !value) ||
    !value
  )
    return null;

  if (Array.isArray(value) && !value.length) return null;

  return (
    <div className="bg-card flex-[1_1_120px] space-y-1 rounded-md p-5 shadow">
      <p className="">{title}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className="font-medium">{value}</p>
      ) : (
        <ul className="nowrap list-inside list-disc">
          {value?.map((item) => (
            <li key={item} className="font-medium">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
