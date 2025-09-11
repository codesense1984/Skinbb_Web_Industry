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
import { capitalize, cn } from "@/core/utils";
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

type PieChartComponentProps = {
  data: { key: string; value: number; fill?: string }[];
  config: ChartConfig;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showOuterLabel?: boolean;
  showActive?: boolean;
  chartProps?: ComponentProps<typeof Recharts.PieChart>;
  pieProps?: Partial<Recharts.Pie>;
  containerProps?: ComponentProps<typeof ChartContainer>;
  children?: ReactNode;
  activeIndex?: number;
  setActiveIndex?: (index: number | undefined) => void;
} & Omit<ChartContainerProps, "children">;

const PieChart: FC<PieChartComponentProps> = ({
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
      <Recharts.PieChart className="h-full w-full" {...chartProps}>
        {showTooltip && (
          <ChartTooltip
            active={activeIndex !== undefined}
            defaultIndex={activeIndex}
            content={
              <ChartTooltipContent
                nameKey="key"
                labelKey="key"
                hideLabel
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
          data={data}
          dataKey="value"
          nameKey="key"
          activeShape={showActive ? ActivePieShape : undefined}
          activeIndex={activeIndex}
          label={showOuterLabel ? LabelRenderer : undefined}
          onMouseEnter={(_, index) => handleLegendHover(index)}
          onMouseLeave={() => handleLegendHover(undefined)}
          {...pieProps}
        >
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
// Custom active slice with center label and highlight ring
// const ActivePieLineShape = (props: PieSectorDataItem) => {
//   const {
//     cx,
//     cy,
//     innerRadius,
//     outerRadius = 0,
//     startAngle,
//     endAngle,
//     fill,
//     payload,
//   } = props;
//   return (
//     <g>
//       <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
//         {payload.name}
//       </text>
//       <Recharts.Sector
//         cx={cx}
//         cy={cy}
//         innerRadius={innerRadius}
//         outerRadius={outerRadius}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         fill={fill}
//       />
//       <Recharts.Sector
//         cx={cx}
//         cy={cy}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         innerRadius={outerRadius + 6}
//         outerRadius={outerRadius + 10}
//         fill={fill}
//       />
//     </g>
//   );
// };
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
    fillColor = false,
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
  const mx = cx + (outerRadius + 5) * cos;
  const my = cy + (outerRadius + 5) * sin;
  // const ex = mx + (cos >= 0 ? 1 : -1) * 3;
  const ex = mx;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <>
      {showKey && (
        <text
          className="recharts-pie-label-text truncate"
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={!fillColor ? undefined : fill}
        >{`${capitalize(key)}`}</text>
      )}
      {showValue && (
        <text
          className="recharts-pie-label-text truncate"
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={showKey ? 18 : 0}
          textAnchor={textAnchor}
          fill={!fillColor ? undefined : fill}
        >
          {`${value} (${(percent * 100).toFixed(2)}%)`}
        </text>
      )}
    </>
  );
};

export default PieChart;
