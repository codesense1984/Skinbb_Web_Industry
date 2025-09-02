import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import type { Option } from "@/core/types";
import { cn } from "@/core/utils";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { Badge } from "./badge";

/**
 * ComboBox component with conditional typing based on multi prop
 * @template T - Boolean type indicating if multi-select is enabled
 *
 * When multi=false (default):
 * - value: string
 * - onChange option: Option | undefined
 *
 * When multi=true:
 * - value: string[]
 * - onChange option: Option[]
 */
interface ComboBoxProps<T extends boolean = false>
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  options: Option[];
  placeholder?: string;
  value?: T extends true ? string[] : string;
  onChange?: (
    value: T extends true ? string[] : string,
    option: T extends true ? Option[] : Option | undefined,
  ) => void;
  className?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  multi?: T;
  maxVisibleItems?: number;
  renderLabel?: (option: Option) => React.ReactNode;
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
  commandProps?: React.ComponentProps<typeof Command>;
  commandInputProps?: React.ComponentProps<typeof CommandInput>;
  popoverContentProps?: React.ComponentProps<typeof PopoverContent>;
  emptyMessage?: string;
  flexWrap?: boolean;
}

export const ComboBox = <T extends boolean = false>({
  options,
  placeholder = "Select...",
  value: controlledValue,
  onChange,
  className,
  searchable = true,
  clearable = true,
  disabled = false,
  loading = false,
  error = false,
  multi = false as T,
  maxVisibleItems: propMaxVisibleItems,
  renderLabel,
  renderOption,
  commandProps,
  emptyMessage = "No result found.",
  popoverContentProps = {},
  commandInputProps = {},
  flexWrap = false,
  ...props
}: ComboBoxProps<T>) => {
  const { className: popoverContentClassName, ...popoverContentRest } =
    popoverContentProps;
  const [open, setOpen] = React.useState(false);
  const [maxVisibleItems, setMaxVisibleItems] = React.useState(
    propMaxVisibleItems || 3,
  );
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | string[]
  >(multi ? [] : "");

  // Calculate maxVisibleItems based on button width
  React.useEffect(() => {
    if (propMaxVisibleItems !== undefined) {
      setMaxVisibleItems(propMaxVisibleItems);
      return;
    }

    const calculateMaxVisibleItems = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth;
        // Estimate item width: badge padding + text + remove button + gap
        // Assuming average item width of ~120px (adjust based on your design)
        const estimatedItemWidth = 120;
        const gap = 4; // gap-1 = 4px
        const padding = 32; // Account for button padding and chevron icon

        const availableWidth = buttonWidth - padding;
        const calculatedMaxItems = Math.max(
          1,
          Math.floor(availableWidth / (estimatedItemWidth + gap)),
        );
        setMaxVisibleItems(calculatedMaxItems);
      }
    };

    // Calculate on mount and window resize
    calculateMaxVisibleItems();
    window.addEventListener("resize", calculateMaxVisibleItems);

    return () => {
      window.removeEventListener("resize", calculateMaxVisibleItems);
    };
  }, [propMaxVisibleItems]);

  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = (val: string | string[]) => {
    if (multi) {
      const selected = Array.isArray(val)
        ? options.filter((opt) => val.includes(opt.value))
        : [];
      if (!isControlled) setUncontrolledValue(val);
      onChange?.(
        val as T extends true ? string[] : string,
        selected as T extends true ? Option[] : Option | undefined,
      );
    } else {
      const selected = options.find((opt) => opt.value === val);
      if (!isControlled) setUncontrolledValue(val);
      onChange?.(
        val as T extends true ? string[] : string,
        selected as T extends true ? Option[] : Option | undefined,
      );
    }
  };

  const selectedOptions = multi
    ? options.filter((opt) => Array.isArray(value) && value.includes(opt.value))
    : options.find((opt) => opt.value === value);

  const selectedOption = !multi ? selectedOptions : undefined;

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || loading) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setOpen(!open);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    if (multi && Array.isArray(value)) {
      const newValues = value.filter((v) => v !== valueToRemove);
      setValue(newValues);
    }
  };

  const renderSelectedContent = () => {
    if (loading)
      return <span className="text-muted-foregound">Loading...</span>;

    if (
      multi &&
      Array.isArray(value) &&
      value.length > 0 &&
      Array.isArray(selectedOptions)
    ) {
      // Calculate how many items we can show based on available space
      if (selectedOptions.length <= maxVisibleItems) {
        // Show all items if we have maxVisibleItems or fewer
        return (
          <div
            className={cn(
              "flex max-w-full gap-1",
              flexWrap ? "flex-wrap" : "flex-nowrap",
            )}
          >
            {selectedOptions.map((option: Option) => (
              <Badge
                key={option.value}
                className="bg-muted border-border text-foreground w-fit truncate rounded-sm border font-normal"
              >
                <span className="truncate">
                  {renderLabel?.(option) ?? option.label}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveValue(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemoveValue(option.value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="ring-offset-background focus:ring-ring ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        );
      } else {
        // Show first (maxVisibleItems - 1) items + count of remaining items
        const visibleItems = selectedOptions.slice(0, maxVisibleItems - 1);
        const remainingCount = selectedOptions.length - (maxVisibleItems - 1);

        return (
          <div
            className={cn(
              "flex max-w-full gap-1",
              flexWrap
                ? "flex-wrap"
                : "hide-scrollbars flex-nowrap overflow-auto rounded-sm",
            )}
          >
            {visibleItems.map((option: Option) => (
              <Badge
                key={option.value}
                className="bg-muted border-border text-foreground rounded-sm border font-normal"
              >
                <span className="truncate">
                  {renderLabel?.(option) ?? option.label}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveValue(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemoveValue(option.value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="ring-offset-background focus:ring-ring ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Badge className="bg-muted border-border text-foreground rounded-sm border font-normal">
              +{remainingCount}
            </Badge>
          </div>
        );
      }
    }

    if (!multi && selectedOption && !Array.isArray(selectedOption)) {
      return renderLabel?.(selectedOption) ?? selectedOption.label;
    }

    return <span className="text-muted-foreground/50">{placeholder}</span>;
  };

  return (
    <Popover open={open && !disabled && !loading} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={buttonRef}
          aria-expanded={open}
          disabled={disabled || loading}
          onKeyDown={handleKeyDown}
          className={cn(
            "form-control flex items-center justify-between",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            flexWrap && "h-auto",
            disabled && "cursor-not-allowed opacity-50",
            loading && "cursor-wait",
            className,
          )}
          {...props}
        >
          <span className="flex-1 truncate text-left">
            {renderSelectedContent()}
          </span>
          {loading ? (
            <div className="border-border size-4 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <ChevronsUpDownIcon className="size-4 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", popoverContentClassName)}
        {...popoverContentRest}
      >
        <Command {...commandProps}>
          {searchable && (
            <CommandInput placeholder="Search..." {...commandInputProps} />
          )}
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.length === 0 ? (
                <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                  {loading && "Loading options..."}
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = multi
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        if (multi) {
                          const currentValues = Array.isArray(value)
                            ? value
                            : [];
                          const newValues = isSelected
                            ? currentValues.filter((v) => v !== option.value)
                            : [...currentValues, option.value];
                          setValue(newValues);
                        } else {
                          const newVal =
                            option.value === value && clearable
                              ? ""
                              : option.value;
                          setValue(newVal);
                          setOpen(false);
                        }
                      }}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <>
                          {option.label}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </>
                      )}
                    </CommandItem>
                  );
                })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
