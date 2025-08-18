import PieChart from "@/core/components/charts/PieChart";
import { type ChartConfig } from "@/core/components/ui/chart";

const chartData = [
  { key: "male", value: 275, fill: "var(--chart-1)", showValue: false },
  { key: "female", value: 200, fill: "var(--chart-2)", showValue: false },
  { key: "unknown", value: 187, fill: "var(--chart-3)", showValue: false },
];

const config = {
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

const PieChart2 = () => {
  return (
    <PieChart
      config={config}
      data={chartData}
      showLegend={false}
      showTooltip={false}
      showLabels={false}
    />
  );
};

export default PieChart2;
