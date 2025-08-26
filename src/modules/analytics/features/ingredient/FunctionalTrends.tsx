import PieChart from "@/core/components/charts/PieChart";
import { DataTable } from "@/core/components/data-table";
import { StatChartCard } from "@/core/components/ui/card";
import type { ChartConfig } from "@/core/components/ui/chart";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";
import { useState } from "react";

const categoryData = [
  {
    function: "Natural",
    ingredients: [
      {
        ingredient: "Rosemary Extract",
        inci: "Rosmarinus Officinalis Leaf Extract",
        category: "Preservatives (Natural)",
        percentage: 10,
      },
      {
        ingredient: "Grapefruit Seed Extract",
        inci: "Citrus Paradisi Seed Extract",
        category: "Preservatives (Natural)",
        percentage: 15,
      },
      {
        ingredient: "Tocopherol (Vitamin E)",
        inci: "Tocopherol",
        category: "Preservatives (Natural)",
        percentage: 20,
      },
      {
        ingredient: "Neem Extract",
        inci: "Azadirachta Indica Leaf Extract",
        category: "Preservatives (Natural)",
        percentage: 5,
      },
      {
        ingredient: "Tea Tree Oil",
        inci: "Melaleuca Alternifolia Leaf Oil",
        category: "Preservatives (Natural)",
        percentage: 25,
      },
      {
        ingredient: "Oregano Oil",
        inci: "Origanum Vulgare Oil",
        category: "Preservatives (Natural)",
        percentage: 30,
      },
      {
        ingredient: "Thyme Extract",
        inci: "Thymus Vulgaris Extract",
        category: "Preservatives (Natural)",
        percentage: 10,
      },
      {
        ingredient: "Honeysuckle Extract",
        inci: "Lonicera Japonica Flower Extract",
        category: "Preservatives (Natural)",
        percentage: 15,
      },
      {
        ingredient: "Radish Root Ferment",
        inci: "Leuconostoc/Radish Root Ferment Filtrate",
        category: "Preservatives (Natural)",
        percentage: 20,
      },
      {
        ingredient: "Sage Extract",
        inci: "Salvia Officinalis Leaf Extract",
        category: "Preservatives (Natural)",
        percentage: 5,
      },
    ],
  },
  {
    function: "Emollients",
    ingredients: [
      {
        ingredient: "Isoamyl Laurate",
        inci: "Isoamyl Laurate",
        category: "Emollients",
        percentage: 10,
      },
      {
        ingredient: "Isoamyl Cocoate",
        inci: "Isoamyl Cocoate",
        category: "Emollients",
        percentage: 15,
      },
      {
        ingredient: "Hydrogenated Poly(C6-14 Olefin)",
        inci: "Hydrogenated Poly(C6-14 Olefin)",
        category: "Emollients",
        percentage: 20,
      },
      {
        ingredient: "Caprylic/Capric Triglyceride",
        inci: "Caprylic/Capric Triglyceride",
        category: "Emollients",
        percentage: 25,
      },
      {
        ingredient: "Cetearyl Alcohol",
        inci: "Cetearyl Alcohol",
        category: "Emollients",
        percentage: 30,
      },
      {
        ingredient: "Isopropyl Myristate",
        inci: "Isopropyl Myristate",
        category: "Emollients",
        percentage: 10,
      },
      {
        ingredient: "Squalane",
        inci: "Squalane",
        category: "Emollients",
        percentage: 15,
      },
      {
        ingredient: "Dimethicone",
        inci: "Dimethicone",
        category: "Emollients",
        percentage: 20,
      },
      {
        ingredient: "Lanolin",
        inci: "Lanolin",
        category: "Emollients",
        percentage: 5,
      },
      {
        ingredient: "Petrolatum",
        inci: "Petrolatum",
        category: "Emollients",
        percentage: 10,
      },
    ],
  },
  {
    function: "Humectants",
    ingredients: [
      {
        ingredient: "Glycerin",
        inci: "Glycerin",
        category: "Humectants",
        percentage: 10,
      },
      {
        ingredient: "Butylene Glycol",
        inci: "Butylene Glycol",
        category: "Humectants",
        percentage: 15,
      },
      {
        ingredient: "Sodium PCA",
        inci: "Sodium PCA",
        category: "Humectants",
        percentage: 20,
      },
      {
        ingredient: "Propylene Glycol",
        inci: "Propylene Glycol",
        category: "Humectants",
        percentage: 25,
      },
      {
        ingredient: "Urea",
        inci: "Urea",
        category: "Humectants",
        percentage: 30,
      },
      {
        ingredient: "Panthenol",
        inci: "Panthenol",
        category: "Humectants",
        percentage: 10,
      },
      {
        ingredient: "Sodium Lactate",
        inci: "Sodium Lactate",
        category: "Humectants",
        percentage: 15,
      },
      {
        ingredient: "Honey",
        inci: "Honey",
        category: "Humectants",
        percentage: 20,
      },
      {
        ingredient: "Hyaluronic Acid",
        inci: "Sodium Hyaluronate",
        category: "Humectants",
        percentage: 25,
      },
      {
        ingredient: "Betaine",
        inci: "Betaine",
        category: "Humectants",
        percentage: 30,
      },
    ],
  },
  {
    function: "Anti-Acne",
    ingredients: [
      {
        ingredient: "Salicylic Acid",
        inci: "Salicylic Acid",
        category: "Exfoliants",
        percentage: 10,
      },
      {
        ingredient: "Niacinamide",
        inci: "Niacinamide",
        category: "Brightening",
        percentage: 15,
      },
      {
        ingredient: "Zinc PCA",
        inci: "Zinc PCA",
        category: "Oil Control",
        percentage: 20,
      },
      {
        ingredient: "Sulfur",
        inci: "Sulfur",
        category: "Anti-Acne",
        percentage: 25,
      },
      {
        ingredient: "Tea Tree Oil",
        inci: "Melaleuca Alternifolia Leaf Oil",
        category: "Anti-Acne",
        percentage: 30,
      },
      {
        ingredient: "Benzoyl Peroxide",
        inci: "Benzoyl Peroxide",
        category: "Anti-Acne",
        percentage: 10,
      },
      {
        ingredient: "Lactic Acid",
        inci: "Lactic Acid",
        category: "Exfoliants",
        percentage: 15,
      },
      {
        ingredient: "Gluconolactone",
        inci: "Gluconolactone",
        category: "PHA",
        percentage: 20,
      },
      {
        ingredient: "Resorcinol",
        inci: "Resorcinol",
        category: "Anti-Acne",
        percentage: 25,
      },
      {
        ingredient: "Witch Hazel",
        inci: "Hamamelis Virginiana Extract",
        category: "Astringent",
        percentage: 30,
      },
    ],
  },
  {
    function: "Sunscreens",
    ingredients: [
      {
        ingredient: "Zinc Oxide",
        inci: "Zinc Oxide",
        category: "UV Filters",
        percentage: 10,
      },
      {
        ingredient: "Titanium Dioxide",
        inci: "Titanium Dioxide",
        category: "UV Filters",
        percentage: 15,
      },
      {
        ingredient: "Avobenzone",
        inci: "Butyl Methoxydibenzoylmethane",
        category: "UV Filters",
        percentage: 20,
      },
      {
        ingredient: "Octinoxate",
        inci: "Ethylhexyl Methoxycinnamate",
        category: "UV Filters",
        percentage: 25,
      },
      {
        ingredient: "Oxybenzone",
        inci: "Benzophenone-3",
        category: "UV Filters",
        percentage: 30,
      },
      {
        ingredient: "Octocrylene",
        inci: "Octocrylene",
        category: "UV Filters",
        percentage: 10,
      },
      {
        ingredient: "Homosalate",
        inci: "Homosalate",
        category: "UV Filters",
        percentage: 15,
      },
      {
        ingredient: "Ensulizole",
        inci: "Phenylbenzimidazole Sulfonic Acid",
        category: "UV Filters",
        percentage: 20,
      },
      {
        ingredient: "Tinosorb S",
        inci: "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",
        category: "UV Filters",
        percentage: 25,
      },
      {
        ingredient: "Tinosorb M",
        inci: "Methylene Bis-Benzotriazolyl Tetramethylbutylphenol",
        category: "UV Filters",
        percentage: 30,
      },
    ],
  },
  {
    function: "Antioxidants",
    ingredients: [
      {
        ingredient: "Ascorbic Acid",
        inci: "Ascorbic Acid",
        category: "Antioxidants",
        percentage: 10,
      },
      {
        ingredient: "Tocopherol",
        inci: "Tocopherol",
        category: "Antioxidants",
        percentage: 15,
      },
      {
        ingredient: "Ferulic Acid",
        inci: "Ferulic Acid",
        category: "Antioxidants",
        percentage: 20,
      },
      {
        ingredient: "Resveratrol",
        inci: "Resveratrol",
        category: "Antioxidants",
        percentage: 25,
      },
      {
        ingredient: "Coenzyme Q10",
        inci: "Ubiquinone",
        category: "Antioxidants",
        percentage: 30,
      },
      {
        ingredient: "Green Tea Extract",
        inci: "Camellia Sinensis Leaf Extract",
        category: "Antioxidants",
        percentage: 10,
      },
      {
        ingredient: "Alpha-Lipoic Acid",
        inci: "Thioctic Acid",
        category: "Antioxidants",
        percentage: 15,
      },
      {
        ingredient: "Astaxanthin",
        inci: "Astaxanthin",
        category: "Antioxidants",
        percentage: 20,
      },
      {
        ingredient: "Glutathione",
        inci: "Glutathione",
        category: "Antioxidants",
        percentage: 25,
      },
      {
        ingredient: "Niacinamide",
        inci: "Niacinamide",
        category: "Antioxidants",
        percentage: 30,
      },
    ],
  },
  {
    function: "Brightening",
    ingredients: [
      {
        ingredient: "Alpha Arbutin",
        inci: "Alpha-Arbutin",
        category: "Skin Brightening",
        percentage: 10,
      },
      {
        ingredient: "Kojic Acid",
        inci: "Kojic Acid",
        category: "Skin Brightening",
        percentage: 15,
      },
      {
        ingredient: "Licorice Extract",
        inci: "Glycyrrhiza Glabra Root Extract",
        category: "Skin Brightening",
        percentage: 20,
      },
      {
        ingredient: "Vitamin C",
        inci: "Ascorbic Acid",
        category: "Skin Brightening",
        percentage: 10,
      },
      {
        ingredient: "Niacinamide",
        inci: "Niacinamide",
        category: "Skin Brightening",
        percentage: 5,
      },
      {
        ingredient: "Resorcinol",
        inci: "4-Butylresorcinol",
        category: "Skin Brightening",
        percentage: 2,
      },
      {
        ingredient: "Glutathione",
        inci: "Glutathione",
        category: "Skin Brightening",
        percentage: 5,
      },
      {
        ingredient: "Bearberry Extract",
        inci: "Arctostaphylos Uva Ursi Leaf Extract",
        category: "Skin Brightening",
        percentage: 3,
      },
      {
        ingredient: "Mulberry Extract",
        inci: "Morus Alba Root Extract",
        category: "Skin Brightening",
        percentage: 4,
      },
      {
        ingredient: "Tranexamic Acid",
        inci: "Tranexamic Acid",
        category: "Skin Brightening",
        percentage: 2,
      },
    ],
  },
  {
    function: "Peptides",
    ingredients: [
      {
        ingredient: "Matrixyl 3000",
        inci: "Palmitoyl Oligopeptide + Palmitoyl Tetrapeptide-7",
        category: "Peptides (Anti-aging)",
        percentage: 10,
      },
      {
        ingredient: "Argireline",
        inci: "Acetyl Hexapeptide-8",
        category: "Peptides (Anti-wrinkle)",
        percentage: 15,
      },
      {
        ingredient: "Snap-8",
        inci: "Acetyl Octapeptide-3",
        category: "Peptides (Anti-aging)",
        percentage: 20,
      },
      {
        ingredient: "Syn-Ake",
        inci: "Dipeptide Diaminobutyroyl Benzylamide Diacetate",
        category: "Peptides (Anti-wrinkle)",
        percentage: 5,
      },
      {
        ingredient: "Copper Tripeptide-1",
        inci: "Copper Tripeptide-1",
        category: "Peptides (Regeneration)",
        percentage: 1,
      },
      {
        ingredient: "Hexapeptide-9",
        inci: "Hexapeptide-9",
        category: "Peptides (Anti-aging)",
        percentage: 3,
      },
      {
        ingredient: "Tripeptide-1",
        inci: "Palmitoyl Tripeptide-1",
        category: "Peptides (Firming)",
        percentage: 2,
      },
      {
        ingredient: "Oligopeptide-1",
        inci: "Oligopeptide-1",
        category: "Peptides (Rejuvenating)",
        percentage: 1.5,
      },
      {
        ingredient: "Myristoyl Pentapeptide-17",
        inci: "Myristoyl Pentapeptide-17",
        category: "Peptides (Lash Enhancing)",
        percentage: 0.1,
      },
      {
        ingredient: "Tetrapeptide-21",
        inci: "Tetrapeptide-21",
        category: "Peptides (Anti-aging)",
        percentage: 2,
      },
    ],
  },
  {
    function: "Soothing Agents",
    ingredients: [
      {
        ingredient: "Aloe Vera Extract",
        inci: "Aloe Barbadensis Leaf Juice",
        category: "Soothing",
        percentage: 10,
      },
      {
        ingredient: "Allantoin",
        inci: "Allantoin",
        category: "Soothing",
        percentage: 15,
      },
      {
        ingredient: "Centella Asiatica",
        inci: "Centella Asiatica Extract",
        category: "Soothing",
        percentage: 20,
      },
      {
        ingredient: "Green Tea Extract",
        inci: "Camellia Sinensis Leaf Extract",
        category: "Soothing",
        percentage: 5,
      },
      {
        ingredient: "Chamomile Extract",
        inci: "Chamomilla Recutita Flower Extract",
        category: "Soothing",
        percentage: 4,
      },
      {
        ingredient: "Calendula Extract",
        inci: "Calendula Officinalis Flower Extract",
        category: "Soothing",
        percentage: 6,
      },
      {
        ingredient: "Oat Extract",
        inci: "Avena Sativa Kernel Extract",
        category: "Soothing",
        percentage: 8,
      },
      {
        ingredient: "Madecassoside",
        inci: "Madecassoside",
        category: "Soothing",
        percentage: 1,
      },
      {
        ingredient: "Panthenol",
        inci: "Panthenol",
        category: "Soothing",
        percentage: 5,
      },
      {
        ingredient: "Bisabolol",
        inci: "Bisabolol",
        category: "Soothing",
        percentage: 2,
      },
    ],
  },
];

const FunctionalTrends = () => {
  const [currentCategory, setCurrentCategory] = useState(
    categoryData[0].function.toLowerCase(),
  );
  const [activeIndex, setActiveIndex] = useState<number>();

  const currentIngredient =
    categoryData.find((item) => item.function.toLowerCase() === currentCategory)
      ?.ingredients ?? [];

  const categoryChartData = currentIngredient?.map((item, index) => {
    const minAlpha = 0.1;
    const maxAlpha = 1;
    const alphaStep = (maxAlpha - minAlpha) / (currentIngredient.length - 1);

    const alpha = minAlpha + index * alphaStep;

    return {
      key: item.ingredient.toLowerCase(),
      value: item.percentage,
      fill: `oklch(0.7317 0.1325 20.8/${alpha.toFixed(2)})`,
    };
  });

  const categoryConfigData = currentIngredient.reduce((acc, item) => {
    acc[item.ingredient.toLowerCase()] = {
      label: item.ingredient,
    };
    return acc;
  }, {} as ChartConfig);

  const categoryConfig = {
    value: {
      label: "Percentage",
    },
    ...categoryConfigData,
  };

  const handleLegendHover = (index: number | undefined) =>
    setActiveIndex(index);

  return (
    <StatChartCard
      name="Top 10 Functional Trends"
      className="md:max-h-full"
      contentProps={{ className: "space-y-4 flex flex-col items-center" }}
      actions={
        <ToggleGroup
          type="single"
          variant={"outlined"}
          size={"lg"}
          defaultValue="category"
          className="bg-card h-10"
        >
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto px-3"
            value={"category"}
            aria-label="Toggle Category"
          >
            Category
          </ToggleGroupItem>
          <ToggleGroupItem
            className="aspect-auto h-full flex-auto px-3"
            value={"claims"}
            aria-label="Toggle Claims"
          >
            Claims
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      <div className="w-full overflow-auto py-1">
        <ToggleGroup
          type="single"
          variant={"outlined"}
          size={"lg"}
          defaultValue="category"
          className="bg-card h-10"
          value={currentCategory}
          onValueChange={setCurrentCategory}
        >
          {categoryData.map((item) => (
            <ToggleGroupItem
              key={item.function}
              className="aspect-auto h-full flex-auto px-3"
              value={item.function.toLowerCase()}
              aria-label={`Toggle ${item.function}`}
            >
              {item.function}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-6">
        <DataTable
          showAction={false}
          showPagination={false}
          pageSize={-1}
          className="col-span-4 space-y-3"
          bodyProps={{
            containerProps: {
              className: "rounded-lg border",
            },
          }}
          rows={
            categoryData.find(
              (item) => item.function.toLowerCase() === currentCategory,
            )?.ingredients ?? []
          }
          columns={[
            {
              accessorKey: "ingredient",
              header: "Ingredient",
              cell(props) {
                return (
                  <div
                    className="w-full"
                    onMouseEnter={() => {
                      handleLegendHover(props.row.index);
                    }}
                    onMouseLeave={() => {
                      handleLegendHover(undefined);
                    }}
                  >
                    {props.getValue() as string}
                  </div>
                );
              },
            },
            {
              accessorKey: "inci",
              header: "INCI",
              cell(props) {
                return (
                  <div
                    className="w-full"
                    onMouseEnter={() => {
                      handleLegendHover(props.row.index);
                    }}
                    onMouseLeave={() => {
                      handleLegendHover(undefined);
                    }}
                  >
                    {props.getValue() as string}
                  </div>
                );
              },
            },
            {
              accessorKey: "percentage",
              header: "Percentage",
              cell(props) {
                const total = currentIngredient.reduce(
                  (acc, next) => acc + next.percentage,
                  0,
                );

                const percentage = (
                  (props.row.original.percentage / total) *
                  100
                ).toFixed(2);

                return (
                  <div
                    className="w-full"
                    onMouseEnter={() => {
                      handleLegendHover(props.row.index);
                    }}
                    onMouseLeave={() => {
                      handleLegendHover(undefined);
                    }}
                  >
                    {percentage}%
                  </div>
                );
              },
            },
          ]}
        />
        {
          <PieChart
            key={currentCategory}
            className="col-span-2"
            showActive={true}
            data={categoryChartData}
            config={categoryConfig}
            showOuterLabel={false}
            showLegend={false}
            activeIndex={activeIndex}
            showLabels={false}
            setActiveIndex={setActiveIndex}
          />
        }
      </div>
    </StatChartCard>
  );
};

export default FunctionalTrends;
