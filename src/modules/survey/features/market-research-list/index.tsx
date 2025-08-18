import { DataTableToogle } from "@/core/components/table/data-table";
import { StatusBadge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { DatePicker } from "@/core/components/ui/date-picker";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import type { Survey } from "@/core/types/research.type";
import { formatCurrency, formatDate, formatNumber } from "@/core/utils";
import { CalendarDateRangeIcon, EyeIcon } from "@heroicons/react/24/outline";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router";
import { SURVEY_ROUTES } from "../../routes/constant";

const statsData = [
  {
    title: "Total Survey",
    value: 38,
    barColor: "bg-primary",
    icon: true,
  },
  {
    title: "Active Survey",
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
    title: "Total cost till now",
    value: formatCurrency(17689),
    barColor: "bg-red-300",
    icon: true,
  },
];

export const researchData: Survey[] = [
  {
    id: "PF-2025-0050",
    title: "Dermatology Product Feedback",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Product Feedback",
    startDate: "01-May-2025",
    audience: {
      respondents: 500,
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "₹15k",
    status: "active",
  },
  {
    id: "BP-2025-0049",
    title: "Brand Awareness in Metro Cities",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Brand Perception",
    startDate: "06-May-2025",
    audience: {
      respondents: 250,
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "₹7.5k",
    status: "draft",
  },
  {
    id: "MT-2025-0048",
    title: "Brand Awareness in Metro Cities",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Market Trends",
    startDate: "01-Apr-2025",
    audience: {
      respondents: "895/1,000",
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "25k/₹30k",
    status: "closed",
  },
  {
    id: "OT-2025-0048",
    title: "Summer Skin Care Survey",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Other",
    startDate: "23-May-2025",
    audience: {
      respondents: 500,
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "₹15k",
    status: "active",
  },
  {
    id: "PF-2025-0047",
    title: "Insight360: The Comprehensive Experience & Feedback Survey",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Product Feedback",
    startDate: "22-May-2025",
    audience: {
      respondents: 500,
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "₹15k",
    status: "draft",
  },
  {
    id: "PF-2025-0046",
    title: "Scalp Treatment Product Feedback",
    description:
      "We want to understand your experience and preferences regarding our website/app, include",
    category: "Product Feedback",
    startDate: "24-Apr-2025",
    audience: {
      respondents: 500,
      age: [],
      location: [],
      gender: [],
      skin: [],
      concern: [],
      skinType: [],
    },
    questions: [],
    cost: "₹15k",
    status: "active",
  },
];

const columns: ColumnDef<Survey>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadge module="survey" status={row.original.status} />;
    },
  },
  {
    accessorKey: "respondents",
    header: "Respondents",
    cell: ({ row }) => {
      return row.original.audience.respondents;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const cost = row.getValue("cost") as string;
      // Optional formatting for ₹ values
      const parsed = parseFloat(cost.replace(/[^\d.]/g, ""));
      return formatCurrency(parsed, { currency: "INR", useAbbreviation: true });
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      return formatDate(startDate);
    },
  },
  {
    header: "Action",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const isEdit = row.original.status === "draft";
      return (
        <Button variant="ghost" size="icon" asChild>
          {isEdit ? (
            <NavLink to={`${SURVEY_ROUTES.EDIT(row.original.id)}`}>
              <span className="sr-only">Open Survey Details</span>
              <EyeIcon />
            </NavLink>
          ) : (
            <NavLink to={`${SURVEY_ROUTES.DETAIL(row.original.id)}`}>
              <span className="sr-only">Open Survey Details</span>
              <EyeIcon />
            </NavLink>
          )}
        </Button>
      );
    },
  },
];

const MarketResearchList = () => {
  return (
    <PageContent
      header={{
        title: "Survey",
        description: "View and manage your surveys.",
        actions: (
          <div className="flex gap-2 md:gap-5">
            <DatePicker
              className="max-w-69"
              startIcon={<CalendarDateRangeIcon />}
              mode="range"
            />
            <Button color={"primary"} asChild>
              <NavLink to={SURVEY_ROUTES.CREATE}>Add Survey</NavLink>
            </Button>
          </div>
        ),
      }}
    >
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={
              typeof item.value === "number"
                ? formatNumber(item.value)
                : item.value
            }
            barColor={item.barColor}
          />
        ))}
      </section>

      <DataTableToogle
        rows={researchData}
        columns={columns}
        gridProps={{
          renderGridItem: (row) => <Card key={row.id} research={row} />,
        }}
        filterableKeys={["title"]}
      />
    </PageContent>
  );
};

function Card({ research }: { research: Survey }) {
  return (
    <NavLink
      to={
        research.status === "draft"
          ? `${SURVEY_ROUTES.EDIT(research.id)}`
          : `${SURVEY_ROUTES.DETAIL(research.id)}`
      }
    >
      <article className="bg-card hover:ring-primary w-full rounded-xl p-5 shadow-md transition hover:ring-3">
        <div className="text-muted-foreground mb-2 text-sm">{research.id}</div>
        <h3 className="text-lg leading-snug font-semibold text-gray-900">
          {research.title}
        </h3>
        <p className="mt-1 line-clamp-2">{research.description}</p>

        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-2">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Category</div>
            <div className="font-medium">{research.category}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Start Date</div>
            <div className="font-medium">{formatDate(research.startDate)}</div>
          </div>
        </div>

        <hr className="my-3" />

        <div className="mt-4 grid grid-cols-3">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Respondents</div>
            <div className="font-medium">{research.audience.respondents}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-sm">Cost</div>
            <div className="font-medium">{research.cost}</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-center text-sm">
              Status
            </div>
            <StatusBadge status={research.status} module="survey" />
          </div>
        </div>
      </article>
    </NavLink>
  );
}

export default MarketResearchList;
