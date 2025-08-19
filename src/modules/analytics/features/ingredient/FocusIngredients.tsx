import BarChart from "@/core/components/charts/BarChart";
import { StatChartCard } from "@/core/components/ui/card";
import type { ChartConfig } from "@/core/components/ui/chart";

const focusIngredientData = [
  {
    key: "parabens",
    value: 75,
    fill: "oklch(0.7317 0.1325 20.8/1)",
    showValue: false,
  },
  {
    key: "phthalates",
    value: 60,
    fill: "oklch(0.7317 0.1325 20.8/0.9)",
    showValue: false,
  },
  {
    key: "mineral_oil",
    value: 58,
    fill: "oklch(0.7317 0.1325 20.8/0.8)",
    showValue: false,
  },
  {
    key: "formaldehyde",
    value: 50,
    fill: "oklch(0.7317 0.1325 20.8/0.7)",
    showValue: false,
  },
  {
    key: "fragrance",
    value: 40,
    fill: "oklch(0.7317 0.1325 20.8/0.6)",
    showValue: false,
  },
  {
    key: "petrolatum",
    value: 30,
    fill: "oklch(0.7317 0.1325 20.8/0.5)",
    showValue: false,
  },
  {
    key: "oxybenzone",
    value: -45,
    fill: "oklch(0.7317 0.1325 20.8/0.4)",
    showValue: false,
  },
  {
    key: "silicones",
    value: -55,
    fill: "oklch(0.7317 0.1325 20.8/0.3)",
    showValue: false,
  },
  {
    key: "triclosan",
    value: -71,
    fill: "oklch(0.7317 0.1325 20.8/0.2)",
    showValue: false,
  },
  {
    key: "sulfates",
    value: -73,
    fill: "oklch(0.7317 0.1325 20.8/0.1 )",
    showValue: false,
  },
];

const focusIngredientConfig = {
  value: { label: "Ingredients" },
  parabens: { label: "Parabens" },
  sulfates: { label: "Sulfates" },
  triclosan: { label: "Triclosan" },
  phthalates: { label: "Phthalates" },
  mineral_oil: { label: "Mineral Oil" },
  silicones: { label: "Silicones" },
  formaldehyde: { label: "Formaldehyde" },
  oxybenzone: { label: "Oxybenzone" },
  petrolatum: { label: "Petrolatum" },
} satisfies ChartConfig;

const FocusIngredients = () => {
  return (
    <StatChartCard
      name="Top 10 Focus Ingredients"
      className="md:max-h-110"
      headerProps={{ className: "md:h-[40px]" }}
    >
      <BarChart
        data={focusIngredientData}
        config={focusIngredientConfig}
        layout="vertical"
        barProps={{
          radius: [2, 8, 8, 2],
        }}
        yAxisProps={{
          type: "category",
          dataKey: "key",
          width: 100,
        }}
        xAxisProps={{
          type: "number",
          dataKey: "value",
        }}
      />
    </StatChartCard>
  );
};

export default FocusIngredients;
