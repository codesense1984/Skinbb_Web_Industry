import BarChart from "@/core/components/charts/BarChart";
import { type ChartConfig } from "@/core/components/ui/chart";
import { LabelList } from "recharts";

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

const BarChart3 = () => {
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
        hide: true,
      }}
      xAxisProps={{
        type: "number",
        dataKey: "value",
      }}
    >
      <LabelList
        dataKey="key"
        position="insideLeft"
        offset={30}
        className="fill-(--color-background)"
      />
      <LabelList
        dataKey="value"
        position="right"
        offset={8}
        className="fill-foreground"
      />
    </BarChart>
  );
};

export default BarChart3;
