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
import { cn } from "@/core/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";

export type Option = {
  label: string | React.ReactNode;
  value: string;
  [key: string]: unknown;
};

interface ComboBoxProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string, option: unknown | undefined) => void;
  className?: string;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  renderLabel?: (option: Option) => React.ReactNode;
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
  commandProps?: React.ComponentProps<typeof Command>;
  commandInputProps?: React.ComponentProps<typeof CommandInput>;
  popoverContentProps?: React.ComponentProps<typeof PopoverContent>;
  emptyMessage?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
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
  renderLabel,
  renderOption,
  commandProps,
  emptyMessage = "No result found.",
  popoverContentProps = {},
  commandInputProps = {},
  ...props
}) => {
  const { className: popoverContentClassName, ...popoverContentRest } =
    popoverContentProps;
  const [open, setOpen] = React.useState(false);
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>("");

  const value = isControlled ? controlledValue : uncontrolledValue;
  const setValue = (val: string) => {
    const selected = options.find((opt) => opt.value === val);
    if (!isControlled) setUncontrolledValue(val);
    onChange?.(val, selected);
  };

  const selectedOption = options.find((opt) => opt.value === value);

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

  return (
    <Popover open={open && !disabled && !loading} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          disabled={disabled || loading}
          onKeyDown={handleKeyDown}
          className={cn(
            "form-control flex items-center justify-between",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            disabled && "cursor-not-allowed opacity-50",
            loading && "cursor-wait",
            className,
          )}
          {...props}
        >
          <span className="truncate text-left">
            {loading
              ? "Loading..."
              : selectedOption
                ? (renderLabel?.(selectedOption) ?? selectedOption.label)
                : placeholder}
          </span>
          {loading ? (
            <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                  {loading ? "Loading options..." : "No options available"}
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        const newVal =
                          option.value === value && clearable
                            ? ""
                            : option.value;
                        setValue(newVal);
                        setOpen(false);
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
