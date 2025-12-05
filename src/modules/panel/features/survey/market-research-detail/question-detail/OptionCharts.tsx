import BarChart from "@/core/components/charts/BarChart";
import DonutPieChart from "@/core/components/charts/DonutPieChart";
import PieChart from "@/core/components/charts/PieChart";
import { StatChartCard } from "@/core/components/ui/card";
import type { ChartConfig } from "@/core/components/ui/chart";

const genderData = [
  { key: "male", value: 275, fill: "var(--chart-1)", showValue: false },
  { key: "female", value: 200, fill: "var(--chart-2)", showValue: false },
  { key: "unknown", value: 187, fill: "var(--chart-3)", showValue: false },
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
  { key: "18–24", value: 8860 },
  { key: "25–32", value: 11582 },
  { key: "33–50", value: 28001 },
  { key: "51+", value: 17802 },
  { key: "Unknown", value: 55005 },
];
const ageChartConfig = {
  value: {
    label: "Age",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const stateChartData = [
  { key: "UP", value: 14317 }, // Uttar Pradesh
  { key: "MH", value: 12885 }, // Maharashtra
  { key: "BR", value: 11332 }, // Bihar
  { key: "WB", value: 9779 }, // West Bengal
  { key: "MP", value: 9013 }, // Madhya Pradesh
  { key: "TN", value: 8187 }, // Tamil Nadu
  { key: "RJ", value: 7663 }, // Rajasthan
  { key: "KA", value: 7492 }, // Karnataka
  { key: "GJ", value: 7261 }, // Gujarat
  { key: "AP", value: 6908 }, // Andhra Pradesh
  { key: "TG", value: 5042 }, // Telangana
  { key: "PY", value: 3176 }, // Puducherry
  { key: "CH", value: 2460 }, // Chandigarh
  { key: "AN", value: 2259 }, // Andaman & Nicobar Islands
  { key: "LA", value: 1573 }, // Ladakh
  { key: "DN", value: 1381 }, // Dadra & Nagar Haveli and Daman & Diu
  { key: "LD", value: 635 }, // Lakshadweep
  { key: "Unknown", value: 317 },
];

const stateChartConfig = {
  value: {
    label: "State",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const skinChartData = [
  { key: "dry", value: 17232, fill: "var(--chart-1)" },
  { key: "normal", value: 7796, fill: "var(--chart-2)" },
  { key: "oily", value: 12172, fill: "var(--chart-3)" },
  { key: "combination", value: 5747, fill: "var(--chart-4)" },
  { key: "unknown", value: 68303, fill: "var(--chart-5)" },
];
const skinChartConfig = {
  value: {
    label: "Total Skin Type",
    color: "var(--chart-1)",
  },
  dry: {
    label: "Dry",
  },
  normal: {
    label: "Nemale",
  },
  oily: {
    label: "Oily",
  },
  combination: {
    label: "Combination",
  },
  unknown: {
    label: "Unknown",
  },
} satisfies ChartConfig;

const concernChartData = [
  { key: "acne", value: 5201, fill: "oklch(0.7317 0.1325 20.8)" },
  { key: "dullness", value: 3440, fill: "oklch(0.7317 0.1325 20.8/0.85)" },
  { key: "roughness", value: 2101, fill: "oklch(0.7317 0.1325 20.8/0.8)" },
  { key: "wrinkles", value: 420, fill: "oklch(0.7317 0.1325 20.8/0.7)" },
  {
    key: "undereye darkcircles",
    value: 989,
    fill: "oklch(0.7317 0.1325 20.8/0.6)",
  },
  { key: "oily skin", value: 2558, fill: "oklch(0.7317 0.1325 20.8/0.5)" },
  { key: "dark spots", value: 4303, fill: "oklch(0.7317 0.1325 20.8/0.4)" },
  { key: "photodamage", value: 321, fill: "oklch(0.7317 0.1325 20.8/0.3)" },
  { key: "melasma", value: 643, fill: "oklch(0.7317 0.1325 20.8/0.2)" },
  { key: "Unknown", value: 91274, fill: "oklch(0.7317 0.1325 20.8/0.1)" },
];
const concernChartConfig = {
  value: {
    label: "Total Concern",
  },
  acne: {
    label: "acne",
    color: "var(--chart-1)",
  },
  dullness: {
    label: "dullness",
    color: "var(--chart-2)",
  },
  roughness: {
    label: "roughness",
    color: "var(--chart-3)",
  },
  wrinkles: {
    label: "wrinkles",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;
const OptionCharts = () => {
  return (
    <div className="flex grid-cols-2 flex-col gap-4 sm:grid lg:grid-cols-3 [&>div]:max-h-100 [&>div]:border">
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
        <BarChart
          config={ageChartConfig}
          data={ageChartData}
          yAxisProps={{
            width: 68,
          }}
        />
      </StatChartCard>
      <StatChartCard name="Skin Type">
        <DonutPieChart
          config={skinChartConfig}
          data={skinChartData}
          showLegend={false}
          showOuterLabel={false}
          showTooltip={true}
          showFullDonut
        />
      </StatChartCard>
      <StatChartCard name="Concern Wheel">
        <DonutPieChart
          config={concernChartConfig}
          data={concernChartData}
          showLegend={false}
          showOuterLabel={false}
          showTooltip={true}
          showFullDonut
          pieProps={{
            paddingAngle: 0,
          }}
        />
      </StatChartCard>

      <StatChartCard name="Location wise distribution" className="col-span-2">
        <BarChart
          config={stateChartConfig}
          data={stateChartData}
          barSize={15}
          yAxisProps={{
            width: 68,
          }}
          chartProps={{
            barGap: 20,
          }}
        />
      </StatChartCard>
    </div>
  );
};

export default OptionCharts;
