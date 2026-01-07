// components/charts/LineChartWrapper.tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  type ChartContainerProps,
  type ChartTooltipContentProps,
} from "@/core/components/ui/chart";
import { cn } from "@/core/utils";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  XAxis,
  YAxis,
  type CartesianGridProps,
  type LineProps,
  type XAxisProps,
  type YAxisProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultLegendContent";

export type LineChartWrapperProps = {
  data: Record<string, string | number>[];
  config: ChartConfig;
  lineProps: Omit<LineProps, "ref">[]; // Multiple line configurations
  chartProps?: Omit<ComponentProps<typeof ReLineChart>, "data" | "children">;
  xAxisProps?: XAxisProps;
  yAxisProps?: YAxisProps;
  showTooltip?: boolean;
  cartesianGridProps?: CartesianGridProps;
  tooltipProps?: ChartTooltipContentProps;
  children?: ReactNode;
  legendProps?: Omit<ComponentProps<typeof Legend>, "ref">;
  showLegends?: boolean;
} & Omit<ChartContainerProps, "children">;

const LineChart = ({
  data,
  config,
  lineProps,
  chartProps = {},
  xAxisProps = {},
  yAxisProps = {},
  showTooltip = true,
  tooltipProps = {},
  cartesianGridProps,
  showLegends = false,
  legendProps = {},
  className,
  children,
  ...props
}: LineChartWrapperProps) => {
  const [hoveringDataKey, setHoveringDataKey] = useState<string | null>(null);

  const handleMouseEnter = (payload: Payload) => {
    setHoveringDataKey(
      typeof payload?.dataKey === "string" ? payload.dataKey : null,
    );
  };

  const handleMouseLeave = () => {
    setHoveringDataKey(null);
  };

  return (
    <ChartContainer
      config={config}
      className={cn("h-full w-full", className)}
      {...props}
    >
      <ReLineChart data={data} {...chartProps}>
        <CartesianGrid vertical={false} {...cartesianGridProps} />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          padding={{ left: 20, right: 20 }}
          {...xAxisProps}
        />

        {<YAxis tickLine={false} axisLine={false} {...yAxisProps} />}

        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" {...tooltipProps} />}
          />
        )}

        {lineProps?.map((line, index) => {
          const findIndex = lineProps.findIndex(
            (val) => val.dataKey === hoveringDataKey,
          );

          let opacity = 1;

          if (hoveringDataKey) {
            if (findIndex === index) {
              opacity = 1;
            } else {
              opacity = 0.2;
            }
          } else {
            opacity = 1;
          }
          return (
            <Line
              strokeOpacity={opacity}
              key={index}
              type="linear"
              strokeWidth={2}
              stroke={`var(--color-${line.dataKey})`}
              height={20}
              {...line}
            />
          );
        })}

        {showLegends && (
          <Legend
            // formatter={(value) => capitalize(value)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            iconSize={0}
            formatter={(value: string) => {
              return (
                <div className="text-muted-foreground flex items-center gap-2 text-sm capitalize">
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor:
                        config?.[value]?.color ?? "var(--color-primary)",
                    }}
                  />
                  {config?.[value]?.label ?? value}
                </div>
              );
            }}
            {...legendProps}
          />
        )}

        {/* <ChartLegend
          content={
            <ChartLegendContent
              nameKey="months"
              hideIcon
              // onLegendHover={handleMouseEnter}
              // percentagesByKey={percentagesByKey}
            />
          }
        /> */}

        {children}
      </ReLineChart>
    </ChartContainer>
  );
};

export default LineChart;
