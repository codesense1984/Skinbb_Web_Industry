import { cn } from "@/core/utils";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentProps, FC, ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface StatCardProps extends ComponentProps<"div"> {
  title: string;
  value: string | number;
  barColor: string;
  icon?: ReactNode;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  barColor,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-background flex items-center gap-4 rounded-md p-4 shadow-md md:px-4 md:py-6",
        className,
      )}
      {...props}
    >
      {barColor && <div className={`h-full w-2 rounded-md ${barColor}`}></div>}
      <div className="w-full flex-col">
        <p>{title}</p>
        <h4 className="font-bold">{value}</h4>
      </div>
      {icon}
    </div>
  );
};

export interface StatValueProps extends ComponentProps<"div"> {
  title?: string;
  description?: string;
  value?: string | number | ReactNode;
  icon?: ReactNode;
  change?: number;
  note?: string;
  titleProps?: ComponentProps<"p">;
  valueProps?: ComponentProps<"h4">;
  descriptionProps?: ComponentProps<"p">;
}

export const StatValue: FC<StatValueProps> = ({
  title,
  value,
  description,
  change,
  className,
  note,
  titleProps,
  valueProps,
  descriptionProps,
  ...props
}) => {
  const isPositive = typeof change === "number" && change > 0;
  const { className: titleClass, ...titleRest } = titleProps ?? {};
  const { className: valueClass, ...valueRest } = valueProps ?? {};

  return (
    <div
      className={cn("flex w-fit flex-col justify-start gap-1", className)}
      {...props}
    >
      <div className="flex gap-1">
        {title && (
          <p className={cn("text-base font-normal", titleClass)} {...titleRest}>
            {title}
            {note && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="inline-block cursor-pointer ps-0.5 align-middle">
                    <InformationCircleIcon className="size-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-fit p-1 px-3">
                  {note}
                </PopoverContent>
              </Popover>
            )}
          </p>
        )}
      </div>
      <div className="flex w-fit gap-2">
        {value && (
          <h4
            className={cn("leading-none font-bold", valueClass)}
            {...valueRest}
          >
            {value}
          </h4>
        )}
        {change && (
          <div
            className={cn(
              "mb-1 flex items-end text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-500",
            )}
          >
            {isPositive ? (
              <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="mr-1 h-4 w-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      {description && <p {...descriptionProps}>{description}</p>}
    </div>
  );
};
