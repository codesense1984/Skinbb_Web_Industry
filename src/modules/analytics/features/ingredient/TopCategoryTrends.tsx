import DonutPieChart from "@/core/components/charts/DonutPieChart";
import { StatChartCard } from "@/core/components/ui/card";
import type { ChartConfig } from "@/core/components/ui/chart";
import {
  SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { useState } from "react";

// Define the allowed keys as a union type
type PreservativeKey =
  | "phenoxyethanol"
  | "ethylhexylglycerin"
  | "sodium_benzoate"
  | "potassium_sorbate"
  | "benzyl_alcohol"
  | "caprylyl_glycol"
  | "chlorphenesin"
  | "dehydroacetic_acid"
  | "methylparaben"
  | "sorbic_acid";

const preservativeData: {
  key: PreservativeKey;
  value: number;
  fill: string;
  showValue: boolean;
}[] = [
  {
    key: "phenoxyethanol",
    value: 420,
    fill: "oklch(0.7317 0.1325 20.8)",
    showValue: false,
  },
  {
    key: "ethylhexylglycerin",
    value: 360,
    fill: "oklch(0.7317 0.1325 20.8/0.9)",
    showValue: false,
  },
  {
    key: "sodium_benzoate",
    value: 310,
    fill: "oklch(0.7317 0.1325 20.8/0.8)",
    showValue: false,
  },
  {
    key: "potassium_sorbate",
    value: 290,
    fill: "oklch(0.7317 0.1325 20.8/0.7)",
    showValue: false,
  },
  {
    key: "benzyl_alcohol",
    value: 265,
    fill: "oklch(0.7317 0.1325 20.8/0.6)",
    showValue: false,
  },
  {
    key: "caprylyl_glycol",
    value: 250,
    fill: "oklch(0.7317 0.1325 20.8/0.5)",
    showValue: false,
  },
  {
    key: "chlorphenesin",
    value: 230,
    fill: "oklch(0.7317 0.1325 20.8/0.4)",
    showValue: false,
  },
  {
    key: "dehydroacetic_acid",
    value: 210,
    fill: "oklch(0.7317 0.1325 20.8/0.3)",
    showValue: false,
  },
  {
    key: "methylparaben",
    value: 180,
    fill: "oklch(0.7317 0.1325 20.8/0.2)",
    showValue: false,
  },
  {
    key: "sorbic_acid",
    value: 160,
    fill: "oklch(0.7317 0.1325 20.8/0.1)",
    showValue: false,
  },
];

const preservativeConfig = {
  value: { label: "Mentions" },
  phenoxyethanol: { label: "Phenoxyethanol" },
  ethylhexylglycerin: { label: "Ethylhexylglycerin" },
  sodium_benzoate: { label: "Sodium Benzoate" },
  potassium_sorbate: { label: "Potassium Sorbate" },
  benzyl_alcohol: { label: "Benzyl Alcohol" },
  caprylyl_glycol: { label: "Caprylyl Glycol" },
  chlorphenesin: { label: "Chlorphenesin" },
  dehydroacetic_acid: { label: "Dehydroacetic Acid" },
  methylparaben: { label: "Methylparaben" },
  sorbic_acid: { label: "Sorbic Acid" },
} satisfies ChartConfig;

const TopCategoryTrends = () => {
  const [activeIndex, setActiveIndex] = useState<number>();
  const handleLegendHover = (index: number | undefined) =>
    setActiveIndex(index);

  return (
    <StatChartCard
      name="Top 10 Category Trends"
      className="md:max-h-110"
      headerProps={{}}
      actions={
        <SelectRoot defaultValue="Preservative">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Trends</SelectLabel>
              <SelectItem value="Preservative">Preservative </SelectItem>
              <SelectItem value="Natural">Natural </SelectItem>
              <SelectItem value="Peptides">Peptides</SelectItem>
              <SelectItem value="Exfoliators">Exfoliators</SelectItem>
              <SelectItem value="Peeling Agents">Peeling Agents </SelectItem>
              <SelectItem value="Synthetic Ingredient">
                Synthetic Ingredient
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      }
    >
      <div className="flex flex-wrap items-center md:flex-nowrap">
        <div className="flex flex-row flex-wrap gap-2 md:flex-col">
          {preservativeData.map((item, index) => {
            const isHovered = activeIndex === index;
            const shouldFade = activeIndex !== null && !isHovered;
            return (
              <div
                className={`text text-muted-foreground flex cursor-default items-center gap-2 text-left text-sm transition-opacity duration-200 md:min-w-40 ${
                  activeIndex && shouldFade ? "opacity-50" : "opacity-100"
                }`}
                key={item.key}
                onMouseEnter={() => {
                  handleLegendHover(index);
                }}
                onMouseLeave={() => {
                  handleLegendHover(undefined);
                }}
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.fill,
                  }}
                />
                {preservativeConfig?.[item.key]?.label}
              </div>
            );
          })}
        </div>
        <DonutPieChart
          data={preservativeData}
          config={preservativeConfig}
          pieProps={{
            innerRadius: 70,
            onMouseEnter: (_, index) => handleLegendHover(index),
            onMouseLeave: () => handleLegendHover(undefined),
          }}
          showOuterLabel={false}
          showLegend={false}
          showFullDonut={true}
          setActiveIndex={setActiveIndex}
          activeIndex={activeIndex}
        />
      </div>
    </StatChartCard>
  );
};

export default TopCategoryTrends;
