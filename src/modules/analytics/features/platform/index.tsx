import BarChart from "@/core/components/charts/BarChart";
import DonutPieChart from "@/core/components/charts/DonutPieChart";
import PieChart from "@/core/components/charts/PieChart";
import { BlobIcon, Button } from "@/core/components/ui/button";
import { StatChartCard } from "@/core/components/ui/card";
import { type ChartConfig } from "@/core/components/ui/chart";
import { StatCard } from "@/core/components/ui/stat";
import { PageContent } from "@/core/components/ui/structure";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/core/components/ui/toggle-group";
import { formatNumber } from "@/core/utils";
import {
  CalendarDaysIcon,
  FunnelIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ANALYTICS_ROUTES } from "../../routes/constants";
import { AnalyticsFilterForm } from "./AnalyticsFilterForm";

const genderData = [
  { key: "male", value: 275, fill: "var(--chart-1)", showValue: false },
  { key: "female", value: 200, fill: "var(--chart-2)", showValue: false },
  { key: "unknown", value: 187, fill: "var(--chart-3)", showValue: false },
];
const genderConfig = {
  value: {
    label: "value",
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

const ageChartData = [
  { key: "18–24", value: 8860 },
  { key: "25–32", value: 11582 },
  { key: "33–50", value: 28001 },
  { key: "51+", value: 17802 },
  { key: "Unknown", value: 55005 },
];
const ageChartConfig = {
  value: {
    label: "Age",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const stateChartData = [
  { key: "UP", value: 14317 }, // Uttar Pradesh
  { key: "MH", value: 12885 }, // Maharashtra
  { key: "BR", value: 11332 }, // Bihar
  { key: "WB", value: 9779 }, // West Bengal
  { key: "MP", value: 9013 }, // Madhya Pradesh
  { key: "TN", value: 8187 }, // Tamil Nadu
  { key: "RJ", value: 7663 }, // Rajasthan
  { key: "KA", value: 7492 }, // Karnataka
  { key: "GJ", value: 7261 }, // Gujarat
  { key: "AP", value: 6908 }, // Andhra Pradesh
  { key: "TG", value: 5042 }, // Telangana
  { key: "PY", value: 3176 }, // Puducherry
  { key: "CH", value: 2460 }, // Chandigarh
  { key: "AN", value: 2259 }, // Andaman & Nicobar Islands
  { key: "LA", value: 1573 }, // Ladakh
  { key: "DN", value: 1381 }, // Dadra & Nagar Haveli and Daman & Diu
  { key: "LD", value: 635 }, // Lakshadweep
  { key: "Unknown", value: 317 },
];

const stateChartConfig = {
  value: {
    label: "State",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const skinChartData = [
  { key: "dry", value: 17232, fill: "var(--chart-1)" },
  { key: "normal", value: 7796, fill: "var(--chart-2)" },
  { key: "oily", value: 12172, fill: "var(--chart-3)" },
  { key: "combination", value: 5747, fill: "var(--chart-4)" },
  { key: "unknown", value: 68303, fill: "var(--chart-5)" },
];
const skinChartConfig = {
  value: {
    label: "Total Skin Type",
    color: "var(--chart-1)",
  },
  dry: {
    label: "Dry",
  },
  normal: {
    label: "Nemale",
  },
  oily: {
    label: "Oily",
  },
  combination: {
    label: "Combination",
  },
  unknown: {
    label: "Unknown",
  },
} satisfies ChartConfig;

const statsData = [
  {
    title: "Active Users",
    value: 111250,
    barColor: "bg-chart-1",
    icon: <UserIcon />,
  },
  {
    title: "Number of Routines",
    value: 317400,
    barColor: "bg-chart-2",
    icon: <CalendarDaysIcon />,
  },
  {
    title: "Avg Routines per User",
    value: 1.7,
    barColor: "bg-chart-3",
    icon: <UserIcon />,
  },
  {
    title: "Avg Products of Routine",
    value: 4.3,
    barColor: "bg-chart-4",
    icon: <CalendarDaysIcon />,
  },
];

const concernChartData = [
  { key: "acne", value: 5201, fill: "oklch(0.7317 0.1325 20.8)" },
  { key: "dullness", value: 3440, fill: "oklch(0.7317 0.1325 20.8/0.85)" },
  { key: "roughness", value: 2101, fill: "oklch(0.7317 0.1325 20.8/0.8)" },
  { key: "wrinkles", value: 420, fill: "oklch(0.7317 0.1325 20.8/0.7)" },
  {
    key: "undereye darkcircles",
    value: 989,
    fill: "oklch(0.7317 0.1325 20.8/0.6)",
  },
  { key: "oily skin", value: 2558, fill: "oklch(0.7317 0.1325 20.8/0.5)" },
  { key: "dark spots", value: 4303, fill: "oklch(0.7317 0.1325 20.8/0.4)" },
  { key: "photodamage", value: 321, fill: "oklch(0.7317 0.1325 20.8/0.3)" },
  { key: "melasma", value: 643, fill: "oklch(0.7317 0.1325 20.8/0.2)" },
  { key: "Unknown", value: 91274, fill: "oklch(0.7317 0.1325 20.8/0.1)" },
];
const concernChartConfig = {
  value: {
    label: "Total Concern",
  },
  acne: {
    label: "acne",
    color: "var(--chart-1)",
  },
  dullness: {
    label: "dullness",
    color: "var(--chart-2)",
  },
  roughness: {
    label: "roughness",
    color: "var(--chart-3)",
  },
  wrinkles: {
    label: "wrinkles",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const PlatformDashboard = () => {
  const [isFilter, setIsFilter] = useState<boolean>(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // const totalVisitors = skinChartData[0].dry + skinChartData[0].normal;

  function onSubmit(data: {
    category: string;
    concern: string;
    skinType: string;
  }) {
    console.log("🚀 ~ onSubmit ~ data:", data);
  }

  return (
    <PageContent
      header={{
        title: "Platform Analytics",
        description: `Dive into user behavior, demographics,
and performance`,
        actions: (
          <div className="flex gap-2">
            {
              <Button
                color={isFilter ? "primary" : "default"}
                startIcon={<FunnelIcon />}
                variant={isFilter ? "contained" : "outlined"}
                onClick={() => setIsFilter((val) => !val)}
              >
                Filter
              </Button>
            }

            <ToggleGroup
              type="single"
              variant={"outlined"}
              size={"lg"}
              className="bg-card h-10"
              value={pathname}
              onValueChange={(value) => {
                if (!value) return;
                navigate(`${value}`);
              }}
            >
              <ToggleGroupItem
                className="aspect-auto h-full flex-auto px-3"
                value={`${ANALYTICS_ROUTES.PLATFORM_ANALYTIC}`}
                aria-label="Toggle Platform"
              >
                Platform
              </ToggleGroupItem>
              <ToggleGroupItem
                className="aspect-auto h-full flex-auto px-3"
                value={`${ANALYTICS_ROUTES.BRAND_ANALYTIC}`}
                aria-label="Toggle Brand"
              >
                Brand
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ),
      }}
    >
      {isFilter && <AnalyticsFilterForm onSubmit={onSubmit} />}

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {statsData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={formatNumber(item.value)}
            barColor={item.barColor}
            className="relative md:flex-1"
            icon={
              item.icon && (
                <BlobIcon className="absolute right-3" icon={item.icon} />
              )
            }
          />
        ))}
      </div>
      <div className="flex grid-cols-1 flex-col gap-4 sm:grid sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <StatChartCard name="Gender Distribution">
          <PieChart
            config={genderConfig}
            data={genderData}
            showLegend={false}
            showTooltip={true}
            showLabels={true}
            showOuterLabel={false}
            showActive={true}
          />
        </StatChartCard>
        <StatChartCard name="Age Distribution">
          <BarChart
            config={ageChartConfig}
            data={ageChartData}
            yAxisProps={{
              width: 68,
            }}
          />
        </StatChartCard>
        <StatChartCard name="Skin Type">
          <DonutPieChart
            config={skinChartConfig}
            data={skinChartData}
            showLegend={false}
            showOuterLabel={false}
            showTooltip={true}
            showFullDonut
          />
        </StatChartCard>
        <StatChartCard name="Concern Wheel">
          <DonutPieChart
            config={concernChartConfig}
            data={concernChartData}
            showLegend={false}
            showOuterLabel={false}
            showTooltip={true}
            showFullDonut
            pieProps={{
              paddingAngle: 0,
            }}
          />
        </StatChartCard>

        <StatChartCard name="Location wise distribution" className="col-span-2">
          <BarChart
            config={stateChartConfig}
            data={stateChartData}
            barSize={15}
            yAxisProps={{
              width: 68,
            }}
            chartProps={{
              barGap: 20,
            }}
          />
        </StatChartCard>
      </div>
    </PageContent>
  );
};

// const StatChart = ({
//   name,
//   children,
//   config,
//   containerClassName,
//   className,
//   responsiveProps,
// }: {
//   config: ChartConfig;
//   name: string;
//   containerClassName?: string;
//   className?: string;
//   children: ComponentProps<typeof ResponsiveContainer>["children"];
//   responsiveProps?: Omit<ResponsiveContainerProps, "children">;
// }) => {
//   return (
//     <Card
//       className={cn("flex max-h-86 min-h-82 max-w-full flex-col", className)}
//     >
//       <CardHeader className="items-center pb-0">
//         <CardTitle className="text-muted-foreground text-lg leading-none">
//           {name}
//         </CardTitle>
//       </CardHeader>
//       <hr className="mx-4" />
//       <CardContent className="flex-1 overflow-x-auto">
//         <ChartContainer
//           config={config}
//           className={cn("h-full w-full", containerClassName)}
//           responsiveProps={responsiveProps as ResponsiveContainerProps}
//         >
//           {children}
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// };

export default PlatformDashboard;
