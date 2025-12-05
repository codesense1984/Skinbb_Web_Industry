import BarChart from "@/core/components/charts/BarChart";
import PieChart from "@/core/components/charts/PieChart";
import { StatChartCard } from "@/core/components/ui/card";
import { type ChartConfig } from "@/core/components/ui/chart";

const genderData = [
  { key: "male", value: 275, fill: "var(--chart-1)" },
  { key: "female", value: 200, fill: "var(--chart-2)" },
  { key: "unknown", value: 187, fill: "var(--chart-3)" },
];
const genderConfig = {
  value: {
    label: "value",
  },
  male: {
    label: "Male",
  },
  female: {
    label: "Female",
  },
  unknown: {
    label: "Unknown",
  },
} satisfies ChartConfig;

const ageChartData = [
  { key: "18–24", value: 141 },
  { key: "25–32", value: 159 },
  { key: "33–50", value: 126 },
  { key: "51–More", value: 147 },
  { key: "Unknown", value: 38 },
];
const ageChartConfig = {
  value: {
    label: "value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
const surveyProgressionChartData = [
  { key: "Opened", value: 141 },
  { key: "Started", value: 159 },
  { key: "Completed", value: 126 },
];
const surveyProgressionChartConfig = {
  value: {
    label: "Progression",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const SurveySummary = () => {
  return (
    <div className="flex grid-cols-1 flex-col gap-4 sm:grid sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <StatChartCard name="Survey Progression">
        <BarChart
          config={surveyProgressionChartConfig}
          data={surveyProgressionChartData}
          barSize={50}
        />
      </StatChartCard>

      <StatChartCard name="Gender Distribution">
        <PieChart
          config={genderConfig}
          data={genderData}
          showLegend={false}
          showTooltip={true}
          showLabels={true}
          showOuterLabel={false}
          showActive={true}
        />
      </StatChartCard>

      <StatChartCard name="Age Distribution">
        <BarChart config={ageChartConfig} data={ageChartData} />
      </StatChartCard>
    </div>
  );
};

export default SurveySummary;
