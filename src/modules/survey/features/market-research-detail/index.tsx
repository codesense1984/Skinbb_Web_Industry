import { StatusBadge } from "@/core/components/ui/badge";
import { BlobIcon } from "@/core/components/ui/button";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";
import { MASTER_DATA, PERSONAL_CARE_DATA } from "@/core/config/constants";
import { SurveyQuestionType, type Survey } from "@/core/types/research.type";
import {
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import SurveyReview from "../../components/SurveyReview";
import SurveyQuestions from "./SurveyQuestions";
import SurveySummary from "./SurveySummary";
import SurveyUsers from "./SurveyUsers";

const marketData: Survey = {
  title: "Dermatology Product Feedback Survey",
  description:
    "We want to understand your experience and preferences regarding our dermatology products. Your feedback will help us improve our offerings and better meet your needs.",
  category: "Product Feedback",
  questions: [
    {
      text: "How Effective Was MyBrand To Address Your Skin Concern?",
      type: SurveyQuestionType.multiple_choice,
      description: "Please rate how well the product worked for you.",
      options: [
        "Very Effective",
        "Somewhat Effective",
        "Neutral",
        "Somewhat Ineffective",
        "Very Ineffective",
      ],
    },
    {
      text: "Which skin concern do you feel our product range is not addressing? ",
      type: SurveyQuestionType.single_choice,
      description: "Select all that apply to your skin’s condition.",
      options: [
        "Acne or breakouts",
        "Dryness or flakiness",
        "Oily skin",
        "Redness or irritation",
        "Dark spots or hyperpigmentation",
        "Fine lines or wrinkles",
        "Enlarged pores",
        "Uneven skin tone",
        "Sensitivity",
      ],
    },
    {
      text: "Would you recommend MYBRAND to your friend? ",
      type: SurveyQuestionType.yes_no,
      description: "",
      options: [],
    },
  ],
  startDate: "1 May 25",
  audience: {
    location: [...MASTER_DATA.location],
    gender: [...MASTER_DATA.gender],
    age: [...MASTER_DATA.ageGroup],
    respondents: 200,
    skin: ["hair"],
    skinType: [...PERSONAL_CARE_DATA.hair.types],
    concern: [...PERSONAL_CARE_DATA.hair.concerns],
  },
  status: "active",
};

const statsData = [
  {
    title: "Completed Survey",
    value: "150/500",
    barColor: "bg-primary",
    icon: <UserIcon />,
  },
  {
    title: "Completion Rate",
    value: "30%",
    barColor: "bg-blue-300",
    icon: <ChartBarIcon />,
  },
  {
    title: "Avg. Completion Time",
    value: "2 min",
    barColor: "bg-violet-300",
    icon: <ClockIcon />,
  },
  {
    title: "Actual Cost",
    value: "₹4.5K/15K",
    barColor: "bg-red-300",
    icon: <BanknotesIcon />,
  },
];

export enum SurveyStep {
  Summary = "summary",
  Questions = "questions",
  Users = "users",
  Details = "details",
}

const MarketResearchDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const stepParam =
    (queryParams.get("step") as SurveyStep) || SurveyStep.Summary;

  const [activeTab, setActiveTab] = useState<SurveyStep>(stepParam);

  useEffect(() => {
    // Sync URL param when tab changes
    const currentParams = new URLSearchParams(location.search);
    currentParams.set("step", activeTab);
    navigate({ search: currentParams.toString() }, { replace: true });
  }, [activeTab, location, navigate]);

  return (
    <PageContent
      header={{
        title: marketData.title,
        actions: (
          <StatusBadge
            module="survey"
            status={marketData.status}
            variant="badge"
            className="px-3 py-1 text-base capitalize"
          />
        ),
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            barColor={item.barColor}
            className="relative md:flex-1"
            icon={
              item.icon && (
                <BlobIcon className="absolute right-3" icon={item.icon} />
              )
            }
          />
        ))}
      </div>
      <div>
        <ToggleGroup
          type="single"
          variant={"outlined"}
          size={"lg"}
          className="bg-card h-11 gap-1 rounded-b-none p-1"
          value={activeTab}
          onValueChange={(value: SurveyStep | string) => {
            if (value) setActiveTab(value as SurveyStep);
          }}
        >
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto rounded-md border-0 px-3 text-base font-normal"
            value={SurveyStep.Summary}
            aria-label="Toggle summary"
          >
            Summary
          </ToggleGroupItem>
          <hr className="bg-border h-5 w-[1px]" />
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto rounded-md border-0 px-3 text-base font-normal"
            value={SurveyStep.Questions}
            aria-label="Toggle questions"
          >
            Questions
          </ToggleGroupItem>
          <hr className="bg-border h-5 w-[1px]" />
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto rounded-md border-0 px-3 text-base font-normal"
            value={SurveyStep.Users}
            aria-label="Toggle users"
          >
            Users
          </ToggleGroupItem>
          <hr className="bg-border h-5 w-[1px]" />
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto rounded-md border-0 px-3 text-base font-normal"
            value={SurveyStep.Details}
            aria-label="Toggle details"
          >
            Details
          </ToggleGroupItem>
        </ToggleGroup>
        <hr />
      </div>
      {activeTab === SurveyStep.Summary && <SurveySummary />}
      {activeTab === SurveyStep.Questions && (
        <SurveyQuestions data={marketData} />
      )}
      {activeTab === SurveyStep.Users && <SurveyUsers />}
      {activeTab === SurveyStep.Details && (
        <SurveyReview
          title={marketData.title}
          description={marketData.description}
          startDate={marketData.startDate}
          category={marketData.category}
          questions={marketData.questions}
          audience={marketData.audience}
          headerTitle=""
          headerDescription=""
        />
      )}
    </PageContent>
  );
};

export default MarketResearchDetail;
