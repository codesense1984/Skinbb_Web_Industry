import LineChart from "@/core/components/charts/LineChart";
import { type ChartConfig } from "@/core/components/ui/chart";

const chartData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "Jun", desktop: 214 },
];
const config = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const LineChart1 = () => {
  return (
    <LineChart
      config={config}
      data={chartData}
      lineProps={[
        {
          dataKey: "desktop",
        },
      ]}
      yAxisProps={{
        hide: true,
      }}
    />
  );
};

export default LineChart1;
