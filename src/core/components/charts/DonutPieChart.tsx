import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  formatChartTooltip,
  type ChartConfig,
  type ChartContainerProps,
} from "@/core/components/ui/chart";
import { capitalize, cn, formatNumber } from "@/core/utils";
import {
  useMemo,
  useState,
  type ComponentProps,
  type FC,
  type ReactNode,
} from "react";
import * as Recharts from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

const RADIAN = Math.PI / 180;

type DonutPieChartProps = {
  data: { key: string; value: number; fill?: string }[];
  config: ChartConfig;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showOuterLabel?: boolean;
  showActive?: boolean;
  showFullDonut?: boolean;
  chartProps?: ComponentProps<typeof Recharts.PieChart>;
  pieProps?: Omit<ComponentProps<typeof Recharts.Pie>, "ref" | "dataKey">;
  containerProps?: ComponentProps<typeof ChartContainer>;
  children?: ReactNode;
  activeIndex?: number;
  setActiveIndex?: (index: number | undefined) => void;
} & Omit<ChartContainerProps, "children">;

const DonutPieChart: FC<DonutPieChartProps> = ({
  data,
  config,
  className = "",
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  showOuterLabel = true,
  showActive = true,
  pieProps,
  chartProps,
  showFullDonut = false,
  children,
  activeIndex: pActiveIndex,
  setActiveIndex: pSetActiveIndex,
  ...props
}) => {
  const isControlled =
    pActiveIndex !== undefined && pSetActiveIndex !== undefined;

  const [internalActiveIndex, internalSetActiveIndex] = useState<
    number | undefined
  >(undefined);

  // Use either controlled or internal state
  const activeIndex = isControlled ? pActiveIndex : internalActiveIndex;
  const setActiveIndex = isControlled
    ? pSetActiveIndex
    : internalSetActiveIndex;
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const totalValue =
    activeIndex !== undefined ? data[activeIndex]?.value : total;

  const totalKey =
    activeIndex !== undefined
      ? capitalize(data[activeIndex]?.key)
      : config.value.label;

  const percentagesByKey = useMemo(() => {
    return data.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] =
        total > 0 ? ((item.value / total) * 100).toFixed(2) : "0.00";
      return acc;
    }, {});
  }, [data, total]);

  const handleLegendHover = (index: number | undefined) =>
    setActiveIndex(index);

  return (
    <ChartContainer
      config={config}
      className={cn(
        "mx-auto aspect-square h-full w-full",
        // `[&_.recharts-pie-label-text]:fill-foreground  aspect-square max-h-[250px]`,
        className,
      )}
      {...props}
    >
      <Recharts.PieChart
        className="h-full w-full"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        {...chartProps}
      >
        {showTooltip && (
          <ChartTooltip
            active={activeIndex !== undefined}
            defaultIndex={activeIndex}
            content={
              <ChartTooltipContent
                nameKey="key"
                labelKey="key"
                hideLabel
                // hideLabel
                formatter={(val, name, entry) =>
                  formatChartTooltip(val, name, entry, percentagesByKey)
                }
              />
            }
          />
        )}
        {showLegend && (
          <ChartLegend
            content={
              <ChartLegendContent
                nameKey="key"
                hideIcon
                onLegendHover={handleLegendHover}
                percentagesByKey={percentagesByKey}
              />
            }
          />
        )}
        <Recharts.Pie
          startAngle={showFullDonut ? 360 : 180}
          endAngle={0}
          cy={showFullDonut ? "50%" : "75%"}
          paddingAngle={3}
          data={data}
          dataKey="value"
          nameKey="key"
          innerRadius={65}
          activeIndex={activeIndex}
          onMouseEnter={(_, index) => handleLegendHover(index)}
          label={showOuterLabel ? LabelRenderer : undefined}
          onMouseLeave={() => handleLegendHover(undefined)}
          activeShape={showActive ? ActivePieShape : undefined}
          {...pieProps}
        >
          <Recharts.Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) - (showFullDonut ? 0 : 20)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - (showFullDonut ? 0 : 20)}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {typeof totalValue === "number"
                        ? formatNumber(totalValue)
                        : String(totalValue)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) - (showFullDonut ? 0 : 20) + 24}
                      className="fill-muted-foreground"
                    >
                      {totalKey}
                    </tspan>
                  </text>
                );
              }
            }}
          />
          {showLabels && (
            <Recharts.LabelList
              dataKey="key"
              className="fill-foreground"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof config) => config[value]?.label}
            />
          )}
          {children}
        </Recharts.Pie>
      </Recharts.PieChart>
    </ChartContainer>
  );
};

const ActivePieShape = ({ outerRadius = 0, ...props }: PieSectorDataItem) => (
  <Recharts.Sector {...props} outerRadius={outerRadius + 8} />
);

const LabelRenderer = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent = 0,
  payload,
  fill,
}: Recharts.PieLabelRenderProps) => {
  const {
    showKey = true,
    showValue = true,
    key,
    value,
  } = (payload as Recharts.PieLabelRenderProps["payload"]) ?? {};

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number"
  ) {
    return null;
  }

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const mx = cx + (outerRadius + 0) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 5;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <>
      {showKey && (
        <text
          className="recharts-pie-label-text"
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={fill}
        >{`${capitalize(key)}`}</text>
      )}
      {showValue && (
        <text
          className="recharts-pie-label-text"
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={showKey ? 18 : 0}
          textAnchor={textAnchor}
          fill={fill}
        >
          {`${value} (${(percent * 100).toFixed(2)}%)`}
        </text>
      )}
    </>
  );
};

export default DonutPieChart;
