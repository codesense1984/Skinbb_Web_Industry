import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/core/utils";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface RealTimeLineChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  color?: string;
  showTooltip?: boolean;
  onDataPointHover?: (point: DataPoint | null) => void;
}

export const RealTimeLineChart: React.FC<RealTimeLineChartProps> = ({
  data,
  height = 300,
  className,
  color = "#8b5cf6",
  showTooltip = true,
  onDataPointHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate chart dimensions and scales
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const chartWidth = 800 - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  const padding = valueRange * 0.1;

  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth;
  const yScale = (value: number) => 
    chartHeight - ((value - minValue + padding) / (valueRange + padding * 2)) * chartHeight;

  // Generate path for the line
  const pathData = data
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Handle mouse events
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - margin.left;
    const y = event.clientY - rect.top - margin.top;

    setMousePosition({ x: event.clientX, y: event.clientY });

    // Find closest data point
    const closestIndex = Math.round((x / chartWidth) * (data.length - 1));
    const closestPoint = data[Math.max(0, Math.min(closestIndex, data.length - 1))];
    
    if (closestPoint && x >= 0 && x <= chartWidth && y >= 0 && y <= chartHeight) {
      setHoveredPoint(closestPoint);
      onDataPointHover?.(closestPoint);
    } else {
      setHoveredPoint(null);
      onDataPointHover?.(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    onDataPointHover?.(null);
  };

  // Generate Y-axis labels
  const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
    const value = minValue + (valueRange / 4) * i;
    return {
      value: Math.round(value),
      y: yScale(value)
    };
  });

  // Generate X-axis labels
  const xAxisLabels = data.filter((_, i) => i % Math.ceil(data.length / 6) === 0);

  return (
    <div className={cn("relative", className)}>
      <svg
        ref={svgRef}
        width={800}
        height={height}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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
            const isHovered = hoveredPoint === point;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Hover line */}
          {hoveredPoint && (
            <line
              x1={xScale(data.indexOf(hoveredPoint))}
              y1={0}
              x2={xScale(data.indexOf(hoveredPoint))}
              y2={chartHeight}
              stroke="#d1d5db"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}
        </g>

        {/* Y-axis labels */}
        <g transform={`translate(${margin.left - 10}, ${margin.top})`}>
          {yAxisLabels.map(({ value, y }, index) => (
            <text
              key={index}
              x={0}
              y={y + 5}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
            </text>
          ))}
        </g>

        {/* X-axis labels */}
        <g transform={`translate(${margin.left}, ${height - margin.bottom + 20})`}>
          {xAxisLabels.map((point, index) => {
            const x = xScale(index * Math.ceil(data.length / 6));
            return (
              <text
                key={index}
                x={x}
                y={0}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {point.date}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {showTooltip && hoveredPoint && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none z-10"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {hoveredPoint.date}
              </p>
              <p className="text-sm text-gray-600">
                {hoveredPoint.label || 'Value'}: {hoveredPoint.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
