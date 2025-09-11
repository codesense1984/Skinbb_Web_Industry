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

const BarChart5 = () => {
  return (
    <BarChart
      config={config}
      data={chartData}
      barSize={50}
      chartProps={{
        margin: {},
      }}
      xAxisProps={{
        hide: true,
      }}
      yAxisProps={{
        hide: true,
      }}
    >
      <LabelList
        dataKey="key"
        position="insideBottom"
        angle={-90}
        offset={30}
        className="fill-(--color-background)"
      />
      <LabelList
        dataKey="value"
        position="top"
        offset={8}
        className="fill-foreground"
      />
    </BarChart>
  );
};

export default BarChart5;
