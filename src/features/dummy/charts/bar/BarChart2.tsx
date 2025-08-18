import BarChart from "@/core/components/charts/BarChart";
import { type ChartConfig } from "@/core/components/ui/chart";

const chartData = [
  { key: "18–24", value: 141 },
  { key: "25–32", value: 159 },
  { key: "33–50", value: 126 },
  { key: "51–More", value: 147 },
  { key: "Unknown", value: 38 },
];
const config = {
  value: {
    label: "Age",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const BarChart2 = () => {
  return (
    <BarChart
      config={config}
      data={chartData}
      layout="vertical"
      barProps={{
        radius: [2, 8, 8, 2],
      }}
      yAxisProps={{
        type: "category",
        dataKey: "key",
        width: 75,
      }}
      xAxisProps={{
        type: "number",
        dataKey: "value",
      }}
    />
  );
};

export default BarChart2;
