import React from "react";
import { cn } from "@/core/utils";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  color?: string;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  height = 300,
  className,
  color = "#8b5cf6",
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-lg bg-gray-50",
          className,
        )}
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Calculate dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = 800 - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value: number) =>
    chartHeight -
    ((value - minValue + padding) / (valueRange + padding * 2)) * chartHeight;

  // Generate path for the line
  const pathData = data
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Generate Y-axis labels
  const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
    const value = minValue + (valueRange / 4) * i;
    return {
      value: Math.round(value),
      y: yScale(value),
    };
  });

  // Generate X-axis labels
  const xAxisLabels = data.filter(
    (_, i) => i % Math.ceil(data.length / 6) === 0,
  );

  return (
    <div className={cn("w-full", className)}>
      <svg width={800} height={height} className="h-full w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Horizontal grid lines */}
          {yAxisLabels.map(({ y }, index) => (
            <line
              key={index}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}

          {/* Vertical grid lines */}
          {xAxisLabels.map((_, index) => {
            const x = xScale(index * Math.ceil(data.length / 6));
            return (
              <line
                key={index}
                x1={x}
                y1={0}
                x2={x}
                y2={chartHeight}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
            );
          })}

          {/* Line path */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = xScale(index);
            const y = yScale(point.value);

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={2}
              />
            );
          })}
        </g>

        {/* Y-axis labels */}
        <g transform={`translate(${margin.left - 10}, ${margin.top})`}>
          {yAxisLabels.map(({ value, y }, index) => (
            <text
              key={index}
              x={0}
              y={y + 5}
              textAnchor="end"
              className="fill-gray-500 text-xs"
            >
              {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
            </text>
          ))}
        </g>

        {/* X-axis labels */}
        <g
          transform={`translate(${margin.left}, ${height - margin.bottom + 20})`}
        >
          {xAxisLabels.map((point, index) => {
            const x = xScale(index * Math.ceil(data.length / 6));
            return (
              <text
                key={index}
                x={x}
                y={0}
                textAnchor="middle"
                className="fill-gray-500 text-xs"
              >
                {point.date}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
