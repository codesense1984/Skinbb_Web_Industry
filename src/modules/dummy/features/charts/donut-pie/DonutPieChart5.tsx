import DonutPieChart from "@/core/components/charts/DonutPieChart";
import { type ChartConfig } from "@/core/components/ui/chart";

const chartData = [
  {
    key: "male",
    value: 275,
    fill: "var(--chart-1)",
    // showKey: true,
    // showValue: false,
  },
  {
    key: "female",
    value: 200,
    fill: "var(--chart-2)",
    // showKey: true,
    // showValue: false,
  },
  {
    key: "unknown",
    value: 187,
    fill: "var(--chart-3)",
    // showKey: true,
    // showValue: false,
  },
];
const config = {
  value: {
    label: "Total",
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

const DonutPieChart5 = () => {
  return (
    <DonutPieChart
      pieProps={{
        innerRadius: 60,
        paddingAngle: 0,
      }}
      config={config}
      data={chartData}
      showTooltip={false}
      showOuterLabel={false}
      showLabels={true}
      showLegend={true}
      showFullDonut={true}
    />
  );
};

export default DonutPieChart5;
