/**
 * FilterDataItem - Wrapper component for table/grid filter usage
 * Automatically provides default renderButton UI for consistent table filter appearance
 */

import * as React from "react";
import type { ElementType } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/core/utils";
import { FilterItem, type FilterItemProps } from "./FilterItem";
import type { FilterType } from "./types";

/**
 * Capitalizes the first letter of a string and converts camelCase to Title Case
 * Examples: "status" -> "Status", "companyName" -> "Company Name"
 */
function capitalizeLabel(key: string): string {
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * FilterDataItem - Enhanced FilterItem for table/grid usage
 * Automatically provides default renderButton UI
 *
 * @template TType - The filter type
 * @template TComponent - Custom component type (if any)
 * @template TPaginationItem - Pagination item type (if using pagination type)
 */
export function FilterDataItem<
  TType extends FilterType = FilterType,
  TComponent extends ElementType | undefined = undefined,
  TPaginationItem = unknown,
>(
  props: FilterItemProps<TType, TComponent, TPaginationItem> & {
    /**
     * Optional custom label for the filter button.
     * If not provided, will be auto-generated from dataKey.
     */
    label?: string;
  },
) {
  const { dataKey, label, ...restProps } = props;

  // Generate label from dataKey if not provided
  const displayLabel = React.useMemo(
    () => label ?? capitalizeLabel(dataKey),
    [label, dataKey],
  );

  // Create renderButton that includes the label
  const renderButtonWithLabel = React.useCallback(
    (buttonProps: {
      isSelected: boolean;
      loading?: boolean;
      selectedOption?: unknown;
      disabled?: boolean;
      open?: boolean;
      value?: string | string[];
      placeholder?: string;
      error?: boolean;
      multi?: boolean;
    }) => {
      // Use default renderButton with label
      return (
        <div
          className={cn(
            "form-control flex w-full items-center justify-between gap-2",
            buttonProps.isSelected && "ring-primary ring-2",
          )}
        >
          {displayLabel}
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      );
    },
    [displayLabel],
  );

  // Merge elementProps with default renderButton
  // Use type assertion to handle discriminated union complexity
  const propsWithElementProps = restProps as any;
  const existingElementProps = propsWithElementProps.elementProps || {};

  const mergedElementProps = React.useMemo(() => {
    // If elementProps already has a renderButton, use it (allows override)
    if (existingElementProps.renderButton) {
      return existingElementProps;
    }

    return {
      ...existingElementProps,
      renderButton: renderButtonWithLabel,
    };
  }, [existingElementProps, renderButtonWithLabel]);

  // Create final props with merged elementProps
  const finalProps = {
    dataKey,
    label,
    ...propsWithElementProps,
    elementProps: mergedElementProps,
  };

  return <FilterItem {...finalProps} />;
}
