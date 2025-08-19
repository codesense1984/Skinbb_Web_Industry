import LineChart from "@/core/components/charts/LineChart";
import { StatChartCard } from "@/core/components/ui/card";
import type { ChartConfig } from "@/core/components/ui/chart";

const trendingIngredientData = [
  {
    month: "W1",
    phenoxyethanol: 50,
    sodiumBenzoate: 80,
    methylparaben: 250,
    propylparaben: 40,
    benzylAlcohol: 100,
    potassiumSorbate: 60,
    dmDmHydantoin: 20,
    chlorphenesin: 90,
    ethylhexylglycerin: 30,
    caprylylGlycol: 10,
  },
  {
    month: "W2",
    phenoxyethanol: 120,
    sodiumBenzoate: 100,
    methylparaben: 260,
    propylparaben: 70,
    benzylAlcohol: 110,
    potassiumSorbate: 80,
    dmDmHydantoin: 30,
    chlorphenesin: 100,
    ethylhexylglycerin: 40,
    caprylylGlycol: 20,
  },
  {
    month: "W3",
    phenoxyethanol: 200,
    sodiumBenzoate: 130,
    methylparaben: 270,
    propylparaben: 100,
    benzylAlcohol: 120,
    potassiumSorbate: 100,
    dmDmHydantoin: 40,
    chlorphenesin: 120,
    ethylhexylglycerin: 50,
    caprylylGlycol: 30,
  },
  {
    month: "W4",
    phenoxyethanol: 280,
    sodiumBenzoate: 170,
    methylparaben: 500,
    propylparaben: 150,
    benzylAlcohol: 130,
    potassiumSorbate: 120,
    dmDmHydantoin: 50,
    chlorphenesin: 150,
    ethylhexylglycerin: 60,
    caprylylGlycol: 40,
  },
  {
    month: "W5",
    phenoxyethanol: 350,
    sodiumBenzoate: 200,
    methylparaben: 480,
    propylparaben: 200,
    benzylAlcohol: 150,
    potassiumSorbate: 140,
    dmDmHydantoin: 60,
    chlorphenesin: 170,
    ethylhexylglycerin: 70,
    caprylylGlycol: 50,
  },
  {
    month: "W6",
    phenoxyethanol: 430,
    sodiumBenzoate: 250,
    methylparaben: 500,
    propylparaben: 260,
    benzylAlcohol: 180,
    potassiumSorbate: 160,
    dmDmHydantoin: 70,
    chlorphenesin: 190,
    ethylhexylglycerin: 80,
    caprylylGlycol: 60,
  },
  {
    month: "W7",
    phenoxyethanol: 500,
    sodiumBenzoate: 300,
    methylparaben: 600,
    propylparaben: 320,
    benzylAlcohol: 210,
    potassiumSorbate: 180,
    dmDmHydantoin: 80,
    chlorphenesin: 210,
    ethylhexylglycerin: 90,
    caprylylGlycol: 70,
  },
  {
    month: "W8",
    phenoxyethanol: 600,
    sodiumBenzoate: 400,
    methylparaben: 650,
    propylparaben: 380,
    benzylAlcohol: 240,
    potassiumSorbate: 200,
    dmDmHydantoin: 90,
    chlorphenesin: 230,
    ethylhexylglycerin: 100,
    caprylylGlycol: 80,
  },
  {
    month: "W9",
    phenoxyethanol: 650,
    sodiumBenzoate: 500,
    methylparaben: 700,
    propylparaben: 450,
    benzylAlcohol: 280,
    potassiumSorbate: 230,
    dmDmHydantoin: 100,
    chlorphenesin: 250,
    ethylhexylglycerin: 110,
    caprylylGlycol: 90,
  },
  {
    month: "W10",
    phenoxyethanol: 680,
    sodiumBenzoate: 600,
    methylparaben: 720,
    propylparaben: 520,
    benzylAlcohol: 310,
    potassiumSorbate: 260,
    dmDmHydantoin: 110,
    chlorphenesin: 270,
    ethylhexylglycerin: 120,
    caprylylGlycol: 100,
  },
  {
    month: "W11",
    phenoxyethanol: 710,
    sodiumBenzoate: 680,
    methylparaben: 740,
    propylparaben: 580,
    benzylAlcohol: 340,
    potassiumSorbate: 290,
    dmDmHydantoin: 120,
    chlorphenesin: 290,
    ethylhexylglycerin: 130,
    caprylylGlycol: 110,
  },
  {
    month: "W12",
    phenoxyethanol: 750,
    sodiumBenzoate: 740,
    methylparaben: 790,
    propylparaben: 640,
    benzylAlcohol: 370,
    potassiumSorbate: 320,
    dmDmHydantoin: 130,
    chlorphenesin: 310,
    ethylhexylglycerin: 140,
    caprylylGlycol: 120,
  },
];

const trendingIngredientConfig = {
  phenoxyethanol: {
    label: "Phenoxyethanol",
    color: "oklch(0.7317 0.1325 20.8/1)",
  },
  sodiumBenzoate: {
    label: "Sodium Benzoate",
    color: "oklch(0.7317 0.1325 20.8/0.9)",
  },
  methylparaben: {
    label: "Methylparaben",
    color: "oklch(0.7317 0.1325 20.8/0.8)",
  },
  propylparaben: {
    label: "Propylparaben",
    color: "oklch(0.7317 0.1325 20.8/0.7)",
  },
  benzylAlcohol: {
    label: "Benzyl Alcohol",
    color: "oklch(0.7317 0.1325 20.8/0.6)",
  },
  potassiumSorbate: {
    label: "Potassium Sorbate",
    color: "oklch(0.7317 0.1325 20.8/0.5)",
  },
  dmDmHydantoin: {
    label: "DMDM Hydantoin",
    color: "oklch(0.7317 0.1325 20.8/0.4)",
  },
  chlorphenesin: {
    label: "Chlorphenesin",
    color: "oklch(0.7317 0.1325 20.8/0.3)",
  },
  ethylhexylglycerin: {
    label: "Ethylhexylglycerin",
    color: "oklch(0.7317 0.1325 20.8/0.2)",
  },
  caprylylGlycol: {
    label: "Caprylyl Glycol",
    color: "oklch(0.7317 0.1325 20.8/0.1)",
  },
} satisfies ChartConfig;

const IngredientOvertime = () => {
  return (
    <StatChartCard
      name="Top 10 Ingredients OverTime"
      className="md:max-h-full"
      headerProps={{ className: "md:h-[40px]" }}
      contentProps={{ className: "pt-5" }}
    >
      <LineChart
        className="min-h-100 md:max-h-100 md:min-h-full"
        config={trendingIngredientConfig}
        data={trendingIngredientData}
        lineProps={Object.keys(trendingIngredientConfig).map((item) => ({
          dataKey: item,
        }))}
        yAxisProps={{
          hide: false,
          width: 35,
        }}
        showLegends
      />
    </StatChartCard>
  );
};

export default IngredientOvertime;
