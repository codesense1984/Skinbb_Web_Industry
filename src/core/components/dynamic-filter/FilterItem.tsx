/**
 * FilterItem component - renders individual filter controls
 */

import * as React from "react";
import type { ElementType } from "react";
import type { FilterOption, FilterType, SelectionMode } from "./types";
import {
  assertFilterOption,
  assertFilterOptionArray,
  dedupeByValue,
  toArray,
} from "./types";
import { useFilterItem } from "./hooks";
import { useFilterRegistry } from "./context";
import { getCache } from "./cache";
import { Input } from "@/core/components/ui/input";
import type { InputProps } from "@/core/components/ui/input";
import { ComboBox, type ComboBoxProps } from "@/core/components/ui/combo-box";
import {
  PaginationComboBox,
  type PaginationComboBoxProps,
} from "@/core/components/ui/pagination-combo-box";
import type { Option } from "@/core/types";

export interface FilterItemRenderProps {
  value: FilterOption[];
  mode: SelectionMode;
  options?: FilterOption[];
  loading?: boolean;
  onOpenChange?: (open: boolean) => void;
  onQueryChange?: (q: string) => void;
  onChange: (next: FilterOption[]) => void;
  placeholder?: string;
  className?: string;
}

// Element props types for built-in components
// These represent the props that can be passed to the underlying UI components
// Exclude options, value, onChange as these are handled by FilterItem
export type DropdownElementProps = Omit<
  ComboBoxProps<boolean>,
  "options" | "value" | "onChange"
>;

export interface DateElementProps {
  min?: string; // ISO date string
  max?: string; // ISO date string
  [key: string]: unknown;
}

export type InputElementProps = Omit<
  InputProps,
  "value" | "onChange" | "placeholder" | "className"
>;

// Exclude value and onChange as these are handled by FilterItem
// apiFunction and transform are required but can be passed via elementProps
export type PaginationElementProps<TItem = unknown> = Omit<
  PaginationComboBoxProps<TItem>,
  "value" | "onChange"
>;

// Built-in element props mapping
export type BuiltInElementPropsMap<TItem = unknown> = {
  dropdown: DropdownElementProps;
  date: DateElementProps;
  input: InputElementProps;
  pagination: PaginationElementProps<TItem>;
};

// Base props shared by all variants
export interface FilterItemBaseProps {
  dataKey: string;
  type: FilterType;
  mode?: SelectionMode; // default "single"
  className?: string;
  label?: string | React.ReactNode;

  // Data & options
  options?: FilterOption[];
  loadOptions?: (query?: string) => Promise<FilterOption[]>;
  placeholder?: string;

  // Transforms/validation
  parseInput?: (raw: string) => FilterOption | null;
  serialize?: (v: FilterOption[]) => unknown;
  validate?: (v: FilterOption[]) => boolean;
}

// Polymorphic props with elementProps/componentProps
export type FilterItemProps<
  TType extends FilterType = FilterType,
  TComponent extends ElementType | undefined = undefined,
  TPaginationItem = unknown,
> = FilterItemBaseProps & { type: TType } & (TType extends "dropdown" // Built-in types use elementProps; no direct prop passing
    ? { elementProps?: BuiltInElementPropsMap<TPaginationItem>["dropdown"] }
    : TType extends "date"
      ? { elementProps?: BuiltInElementPropsMap<TPaginationItem>["date"] }
      : TType extends "input"
        ? { elementProps?: BuiltInElementPropsMap<TPaginationItem>["input"] }
        : TType extends "pagination"
          ? {
              elementProps?: BuiltInElementPropsMap<TPaginationItem>["pagination"];
            }
          : {}) & // custom has no elementProps
  // Custom component (or override for any type) uses component/componentProps
  (TComponent extends ElementType
    ? {
        component: TComponent;
        componentProps?: Omit<
          React.ComponentPropsWithoutRef<TComponent>,
          keyof FilterItemRenderProps
        >;
      }
    : {
        component?: undefined;
        componentProps?: undefined;
      });

function FilterItemInner<
  TType extends FilterType = FilterType,
  TComponent extends ElementType | undefined = undefined,
  TPaginationItem = unknown,
>(props: FilterItemProps<TType, TComponent, TPaginationItem>) {
  const {
    dataKey,
    type,
    mode = "single",
    className,
    options: staticOptions,
    loadOptions,
    placeholder,
    elementProps,
    component,
    componentProps,
    parseInput,
    serialize,
    validate,
    label,
  } = props as FilterItemBaseProps & {
    elementProps?: BuiltInElementPropsMap<TPaginationItem>[keyof BuiltInElementPropsMap<TPaginationItem>];
    component?: ElementType;
    componentProps?: Record<string, unknown>;
  };
  const { value, set } = useFilterItem(dataKey);
  const registry = useFilterRegistry();
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [dynamicOptions, setDynamicOptions] = React.useState<FilterOption[]>(
    [],
  );
  const cache = React.useMemo(() => getCache(), []);

  // Validate static options on mount/update
  React.useEffect(() => {
    if (staticOptions !== undefined) {
      assertFilterOptionArray(
        staticOptions,
        `<FilterItem options for "${dataKey}">`,
      );
    }
  }, [staticOptions, dataKey]);

  // Load options with caching
  const loadOptionsWithCache = React.useCallback(
    async (searchQuery?: string) => {
      if (!loadOptions) return;

      const cached = cache.get(dataKey, searchQuery);
      if (cached) {
        setDynamicOptions(cached);
        return;
      }

      setLoading(true);
      try {
        const results = await loadOptions(searchQuery);
        assertFilterOptionArray(results, `loadOptions result for "${dataKey}"`);
        cache.set(dataKey, results, searchQuery);
        setDynamicOptions(results);
      } catch (error) {
        console.error(`Failed to load options for ${dataKey}:`, error);
        setDynamicOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [loadOptions, dataKey, cache],
  );

  // Load initial options if loadOptions is provided
  React.useEffect(() => {
    if (loadOptions && !staticOptions) {
      loadOptionsWithCache();
    }
  }, [loadOptions, staticOptions, loadOptionsWithCache]);

  // Load options when query changes (debounced)
  React.useEffect(() => {
    if (!loadOptions || !open) return;

    const timer = setTimeout(() => {
      loadOptionsWithCache(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open, loadOptions, loadOptionsWithCache]);

  const availableOptions = staticOptions ?? dynamicOptions;

  const handleChange = React.useCallback(
    (next: FilterOption[], mode: SelectionMode = "single") => {
      // Sanitize: toArray -> dedupe -> validate
      const sanitized = dedupeByValue(toArray(next));

      if (validate && !validate(sanitized)) {
        return; // Abort if validation fails
      }

      set(sanitized, mode);
    },
    [set, validate],
  );

  // Handle input type
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!parseInput) {
        // Default: create option from input value
        if (raw.trim()) {
          handleChange([
            { label: raw, value: raw, displayValue: label ?? raw },
          ]);
        } else {
          handleChange([]);
        }
      } else {
        const parsed = parseInput(raw);
        if (parsed) {
          assertFilterOption(parsed, `parseInput result for "${dataKey}"`);
          handleChange([{ ...parsed, displayValue: label }]);
        } else {
          handleChange([]);
        }
      }
    },
    [handleChange, parseInput, dataKey],
  );

  // Render props for custom components
  const renderProps: FilterItemRenderProps = React.useMemo(
    () => ({
      value,
      mode,
      options: availableOptions,
      loading,
      onOpenChange: setOpen,
      onQueryChange: setQuery,
      onChange: handleChange,
      placeholder,
      className,
    }),
    [
      value,
      mode,
      availableOptions,
      loading,
      handleChange,
      placeholder,
      className,
    ],
  );

  // Custom component render (component overrides built-in)
  if (component) {
    if (React.isValidElement(component)) {
      return <>{component}</>;
    }
    const CustomComponent = component as React.ComponentType<any>;
    // When component is provided, use componentProps only (ignore elementProps)
    return (
      <CustomComponent
        {...renderProps}
        {...(componentProps as Record<string, unknown>)}
      />
    );
  }

  // Registry-based component (for built-in types when registry is provided)
  if (type !== "custom" && registry?.[type]) {
    const RegistryComponent = registry[type] as React.ComponentType<any>;
    // Registry components receive renderProps + elementProps merged
    return (
      <RegistryComponent
        {...renderProps}
        {...(elementProps as Record<string, unknown>)}
      />
    );
  }

  // Default implementations
  if (type === "dropdown") {
    // Convert FilterOption[] to ComboBox Option[] (memoized)
    const comboOptions: Option[] = React.useMemo(
      () =>
        availableOptions.map((opt) => ({
          label: opt.label,
          value: opt.value,
          disabled: false,
        })),
      [availableOptions],
    );

    // Convert FilterOption[] value to ComboBox value format (memoized)
    const comboValue: string | string[] = React.useMemo(() => {
      if (mode === "single") {
        return value[0]?.value ?? "";
      }
      // Ensure we always return an array for multi mode
      const values = value.map((v) => v.value);
      return values.length > 0 ? values : [];
    }, [mode, value]);

    // Handle ComboBox onChange - convert back to FilterOption[] (memoized)
    const handleComboChange = React.useCallback(
      (_val: string | string[], option: Option | Option[] | undefined) => {
        if (mode === "single") {
          const opt = option as Option | undefined;
          if (opt) {
            // Find the matching FilterOption to preserve meta
            const filterOpt = availableOptions.find(
              (o) => o.value === opt.value,
            );
            if (filterOpt) {
              handleChange([{ ...filterOpt, displayValue: label }]);
            } else {
              // Fallback: create FilterOption from ComboBox Option
              handleChange([
                {
                  label: opt.label as string,
                  value: opt.value,
                  displayValue: label,
                },
              ]);
            }
          } else {
            handleChange([]);
          }
        } else {
          const opts = (option as Option[]) ?? [];
          if (opts.length === 0) {
            handleChange([], "multi");
            return;
          }
          // Find matching FilterOptions to preserve meta
          const filterOpts = availableOptions.filter((o) =>
            opts.some((opt) => opt.value === o.value),
          );
          if (filterOpts.length > 0) {
            handleChange(filterOpts, "multi");
          } else {
            // Fallback: create FilterOptions from ComboBox Options
            handleChange(
              opts.map((opt) => ({
                label: opt.label as string,
                value: opt.value,
                displayValue: label,
              })),
              "multi",
            );
          }
        }
      },
      [mode, availableOptions, handleChange],
    );

    // Merge elementProps with base ComboBox props
    // Note: ComboBoxProps is generic based on multi prop, so we use conditional typing
    const comboProps = React.useMemo(() => {
      const baseProps = {
        options: comboOptions,
        value: comboValue,
        onChange: handleComboChange,
        placeholder,
        className,
        multi: (mode === "multi") as boolean,
        loading,
        searchable: true,
        clearable: true,
      };

      // Merge elementProps, but ensure critical props are not overridden
      const merged = {
        ...baseProps,
        ...(elementProps as DropdownElementProps),
        // Critical props must not be overridden
        options: comboOptions,
        value: comboValue,
        onChange: handleComboChange,
      };

      return merged;
    }, [
      comboOptions,
      comboValue,
      handleComboChange,
      placeholder,
      className,
      mode,
      loading,
      elementProps,
    ]);

    // Type assertion needed due to ComboBox generic type complexity
    return <ComboBox {...(comboProps as any)} />;
  }

  if (type === "input") {
    const inputValue =
      value.length > 0
        ? serialize
          ? String(serialize(value))
          : (value[0]?.label ?? "")
        : "";

    // Merge elementProps with base input props
    const inputProps: InputProps = {
      type: "text",
      value: inputValue,
      onChange: handleInputChange,
      placeholder,
      className,
      ...(elementProps as InputElementProps),
    };

    return <Input {...inputProps} />;
  }

  if (type === "date") {
    // Basic date input - can be extended with a date picker component
    const dateValue = value.length > 0 && value[0]?.value ? value[0].value : "";

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateStr = e.target.value;
      if (dateStr) {
        handleChange([{ label: dateStr, value: dateStr, displayValue: label }]);
      } else {
        handleChange([]);
      }
    };

    // Merge elementProps with base date input props
    const dateProps: React.InputHTMLAttributes<HTMLInputElement> = {
      type: "date",
      value: dateValue,
      onChange: handleDateChange,
      placeholder,
      className,
      ...(elementProps as DateElementProps),
    };

    return <input {...dateProps} />;
  }

  if (type === "pagination") {
    // If registry is provided, use it (registry takes precedence)
    if (registry?.[type]) {
      const RegistryComponent = registry[type] as React.ComponentType<any>;
      return (
        <RegistryComponent
          {...renderProps}
          {...(elementProps as Record<string, unknown>)}
        />
      );
    }

    // Default implementation using PaginationComboBox
    const paginationProps =
      elementProps as PaginationElementProps<TPaginationItem>;
    const { apiFunction, transform, ...restPaginationProps } =
      paginationProps || {};

    if (!apiFunction || !transform) {
      console.warn(
        'FilterItem with type="pagination" requires apiFunction and transform in elementProps, ' +
          "or a pagination component in the registry.",
      );
      return (
        <div
          className={className}
          data-testid="filter-item-pagination-fallback"
        >
          Pagination filter requires apiFunction and transform
        </div>
      );
    }

    // Convert FilterOption[] value to ComboBox value format
    const comboValue = React.useMemo(
      () =>
        mode === "single" ? (value[0]?.value ?? "") : value.map((v) => v.value),
      [mode, value],
    );

    // Handle PaginationComboBox onChange - convert back to FilterOption[]
    const handleComboChange = React.useCallback(
      (_val: string | string[], option: Option | Option[] | undefined) => {
        if (mode === "single") {
          const opt = option as Option | undefined;
          if (opt) {
            handleChange([
              {
                label: opt.label as string,
                value: opt.value,
                displayValue: label,
              },
            ]);
          } else {
            handleChange([]);
          }
        } else {
          const opts = (option as Option[]) ?? [];
          handleChange(
            opts.map((opt) => ({
              label: opt.label as string,
              value: opt.value,
              displayValue: label,
            })),
            "multi",
          );
        }
      },
      [mode, handleChange],
    );

    return (
      <PaginationComboBox
        apiFunction={apiFunction as any}
        transform={transform as any}
        placeholder={placeholder}
        value={comboValue}
        onChange={handleComboChange}
        className={className}
        multi={mode === "multi"}
        {...restPaginationProps}
      />
    );
  }

  return null;
}

export const FilterItem = React.memo(FilterItemInner) as <
  TType extends FilterType = FilterType,
  TComponent extends ElementType | undefined = undefined,
  TPaginationItem = unknown,
>(
  props: FilterItemProps<TType, TComponent, TPaginationItem>,
) => React.ReactElement | null;
