import LineChart from "@/core/components/charts/LineChart";
import { type ChartConfig } from "@/core/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];
const config = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const LineChart2 = () => {
  return (
    <LineChart
      config={config}
      data={chartData}
      lineProps={[
        {
          dataKey: "desktop",
        },
        {
          dataKey: "mobile",
        },
      ]}
      yAxisProps={{
        hide: true,
      }}
    />
  );
};

export default LineChart2;
