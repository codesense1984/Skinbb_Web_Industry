import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  type ChartContainerProps,
  type ChartTooltipContentProps,
} from "@components/ui/chart";
import { cn, formatNumber } from "@/core/utils";
import { type ComponentProps, type FC, type ReactNode } from "react";
import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  type BarProps,
  type CartesianGridProps,
  type XAxisProps,
  type YAxisProps,
} from "recharts";
import type { CategoricalChartProps } from "recharts/types/chart/generateCategoricalChart";

type BarChartDataItem = {
  key: string;
  value: number;
  fill?: string;
};

type BarChartProps = {
  data: BarChartDataItem[];
  config: ChartConfig;
  className?: string;
  showTooltip?: boolean;
  showGrid?: boolean;
  barSize?: number;
  barRadius?: [number, number, number, number];
  chartProps?: Omit<ComponentProps<typeof RechartsBarChart>, "data">;
  cartesianGridProps?: CartesianGridProps;
  xAxisProps?: XAxisProps;
  yAxisProps?: YAxisProps;
  barProps?: Omit<BarProps, "dataKey" | "ref">;
  children?: ReactNode;
  toolContentProps?: ChartTooltipContentProps;
  layout?: CategoricalChartProps["layout"];
} & Omit<ChartContainerProps, "children">;

const BarChart: FC<BarChartProps> = ({
  layout = "horizontal",
  data,
  config,
  className,
  showTooltip = true,
  showGrid = true,
  barSize = 20,
  barRadius = [8, 8, 2, 2],
  chartProps,
  cartesianGridProps,
  xAxisProps,
  yAxisProps,
  barProps,
  children,
  toolContentProps,
  ...props
}) => {
  return (
    <ChartContainer
      config={config}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    >
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ left: -20 }}
        {...chartProps}
      >
        {showGrid && (
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            {...cartesianGridProps}
          />
        )}
        <XAxis
          dataKey="key"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          {...xAxisProps}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          className="capitalize"
          tickFormatter={(label) =>
            typeof label === "number"
              ? formatNumber(label)
              : (config[label]?.label ?? label)
          }
          width={45}
          {...yAxisProps}
        />
        {showTooltip && (
          <ChartTooltip
            content={
              <ChartTooltipContent nameKey="value" {...toolContentProps} />
            }
          />
        )}
        <Bar
          dataKey="value"
          barSize={barSize}
          radius={barRadius}
          fill={config?.value?.color ?? "var(--color-primary)"}
          {...barProps}
        >
          {children}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
};

export default BarChart;
