import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Calendar } from "@/core/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { cn } from "@/core/utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { DateRange, DayPicker, Mode } from "react-day-picker";
import { InputIcon, inputVariants } from "./input";

export type DatepickerValueForMode<M extends Mode> = M extends "single"
  ? Date | undefined
  : M extends "multiple"
    ? Date[] | undefined
    : M extends "range"
      ? DateRange | undefined
      : string;

export interface DatePickerProps<M extends Mode = "single">
  extends Omit<
    React.ComponentProps<"button">,
    "value" | "onChange" | "defaultValue"
  > {
  mode: M;
  value?: DatepickerValueForMode<M>;
  defaultValue?: DatepickerValueForMode<M>;
  onChange?: (value: DatepickerValueForMode<M>) => void;
  clearable?: boolean;
  startIcon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  startIconProps?: React.HTMLAttributes<SVGSVGElement> & { className?: string };
  endIcon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  endIconProps?: React.HTMLAttributes<SVGSVGElement> & { className?: string };
  placeholder?: string;
  calendarProps?: React.ComponentProps<typeof DayPicker>;
}

export function DatePicker<M extends Mode = "single">({
  mode,
  value,
  defaultValue,
  onChange,
  clearable = true,
  startIcon,
  startIconProps,
  endIcon,
  endIconProps,
  calendarProps,
  placeholder = "Select date",
  className,
  disabled,
  ...props
}: DatePickerProps<M>) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<
    DatepickerValueForMode<M>
  >(() => value ?? defaultValue ?? (undefined as DatepickerValueForMode<M>));
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalDate(value);
    }
  }, [value]);

  const handleSelect = (date: DatepickerValueForMode<M>) => {
    setInternalDate(date as DatepickerValueForMode<M>);
    onChange?.(date);
    if (mode === "single") {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setInternalDate(undefined as DatepickerValueForMode<M>);
    onChange?.(undefined as DatepickerValueForMode<M>);
  };

  const getDisplayText = (value: DatepickerValueForMode<M>): string => {
    if (!value) return placeholder;

    if (mode === "single" && value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (mode === "multiple" && Array.isArray(value)) {
      return value.length > 0
        ? value.map((d) => d.toLocaleDateString()).join(", ")
        : placeholder;
    }

    if (mode === "range" && typeof value === "object" && "from" in value) {
      if (value.from && value.to) {
        return `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`;
      }
      return value.from?.toLocaleDateString() ?? placeholder;
    }

    return placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={props?.id || "date-picker"}
          className={cn(
            "relative flex cursor-pointer w-full items-center [&_svg]:size-5",
            "rounded-md outline-none",
            "focus-visible:border-primary h-10 border",
            "focus-visible:ring-primary/50 focus-visible:ring-[3px]",
            "disabled:bg-muted/50 disabled:pointer-events-none disabled:cursor-not-allowed",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            "aria-invalid:border-destructive",
            className,
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="calendar-popover"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              e.stopPropagation();
            }
          }}
          disabled={disabled}
          {...props}
        >
          {startIcon && (
            <InputIcon icon={startIcon} position="left" {...startIconProps} />
          )}
          {endIcon ? (
            <InputIcon icon={endIcon} position="right" {...endIconProps} />
          ) : (
            <InputIcon
              icon={
                <div className="cursor-pointer space-x-1">
                  {clearable && internalDate && !disabled && (
                    <XMarkIcon
                      tabIndex={0}
                      role="button"
                      aria-label="Clear date"
                      className="hover:text-foreground text-muted-foreground ml-auto cursor-pointer"
                      onClick={handleClear}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleClear(e);
                        }
                      }}
                    />
                  )}
                  <ChevronDownIcon className="opacity-50" />
                </div>
              }
              position="right"
              {...endIconProps}
            />
          )}
          <span
            data-disabled={disabled}
            className={inputVariants({
              withStartIcon: !!startIcon,
              withEndIcon: true,
              className: cn(
                "!block h-full truncate border-0 text-left",
                !internalDate && "text-muted-foreground/50",
                clearable && "pe-15",
              ),
            })}
          >
            {getDisplayText(internalDate)}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0"
        align="start"
        id="calendar-popover"
        role="dialog"
        aria-modal="true"
      >
        {mode === "single" && (
          <Calendar
            {...calendarProps}
            mode="single"
            selected={internalDate as unknown as Date | undefined}
            onSelect={handleSelect as (date: Date | undefined) => void}
            captionLayout="dropdown"
          />
        )}
        {mode === "multiple" && (
          <Calendar
            {...calendarProps}
            mode="multiple"
            selected={internalDate as Date[] | undefined}
            onSelect={handleSelect as (dates: Date[] | undefined) => void}
            captionLayout="dropdown"
          />
        )}
        {mode === "range" && (
          <Calendar
            {...calendarProps}
            mode="range"
            selected={internalDate as DateRange | undefined}
            onSelect={handleSelect as (range: DateRange | undefined) => void}
            captionLayout="dropdown"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
