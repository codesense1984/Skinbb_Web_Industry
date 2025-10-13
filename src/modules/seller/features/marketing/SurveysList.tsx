import { DataTableToogle } from "@/core/components/data-table";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import type { Survey } from "@/core/types/research.type";
import { formatDate, formatNumber } from "@/core/utils";
import { EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { SELLER_ROUTES } from "../../routes/constant";

const statsData = [
  {
    title: "Total Brand Survey",
    value: 38,
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Brand Survey",
    value: 35,
    barColor: "bg-blue-300",
    icon: false,
  },
  {
    title: "Total Responded",
    value: 1330,
    barColor: "bg-violet-300",
    icon: false,
  },
  {
    title: "Total Revenue",
    value: 133000,
    barColor: "bg-green-300",
    icon: false,
  },
];

const columns: ColumnDef<Survey>[] = [
  {
    accessorKey: "title",
    header: "Survey Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <StatusBadge
          module="survey"
          status={status}
          variant="badge"
        />
      );
    },
  },
  {
    accessorKey: "audience.respondents",
    header: "Respondents",
    cell: ({ row }) => {
      const respondents = row.getValue("audience.respondents") as number;
      return <div className="text-sm">{formatNumber(respondents)}</div>;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = row.getValue("cost") as string;
      return <div className="text-sm">{cost || "N/A"}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const survey = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" asChild>
            <NavLink to={`${SELLER_ROUTES.MARKETING.SURVEYS.EDIT(survey.id || "1")}`}>
              Edit
            </NavLink>
          </Button>
          <Button variant="outlined" size="sm" asChild>
            <NavLink to={`${SELLER_ROUTES.MARKETING.SURVEYS.VIEW(survey.id || "1")}`}>
              <EyeIcon className="h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      );
    },
  },
];

// Mock data - replace with actual API call
const mockSurveys: Survey[] = [
  {
    id: "1",
    title: "Brand Preference Survey",
    description: "Understanding customer brand preferences",
    category: "Brand Research",
    status: "active",
    startDate: new Date().toISOString(),
    cost: "$500",
    questions: [],
    audience: {
      age: ["18-25", "26-35"],
      location: ["US", "Canada"],
      gender: ["Male", "Female"],
      skin: ["Normal", "Oily"],
      concern: ["Acne", "Aging"],
      skinType: ["Combination"],
      respondents: 150,
    },
  },
  {
    id: "2",
    title: "Product Feedback Survey",
    description: "Gathering feedback on new product launch",
    category: "Product Research",
    status: "draft",
    startDate: new Date().toISOString(),
    cost: "$300",
    questions: [],
    audience: {
      age: ["26-35", "36-45"],
      location: ["US"],
      gender: ["Female"],
      skin: ["Dry", "Sensitive"],
      concern: ["Aging", "Hydration"],
      skinType: ["Dry"],
      respondents: 0,
    },
  },
];

export default function SurveysList() {
  return (
    <PageContent
      header={{
        title: "Brand Surveys",
        description: "Manage your brand surveys and market research",
        actions: (
          <Button asChild>
            <NavLink to={SELLER_ROUTES.MARKETING.SURVEYS.CREATE}>
              Add Brand Survey
            </NavLink>
          </Button>
        ),
      }}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              barColor={stat.barColor}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Data Table */}
        <div className="w-full">
          <DataTableToogle
            columns={columns}
            rows={mockSurveys}
            filterableKeys={["title", "status", "category"]}
          />
        </div>
      </div>
    </PageContent>
  );
}