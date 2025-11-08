import type { Option } from "@/core/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ComboBox, ComboBoxOptionItem } from "./combo-box";
import type { ServerTableFetcher, ServerTableResult } from "../data-table";

/**
 * Transform function to convert API data to Option format
 * This type provides better inference for the item parameter
 */
type TransformFunction<T> = (item: T) => Option;

/**
 * Props for the PaginationComboBox component
 * @template T - The type of data items returned by the API
 */
interface PaginationComboBoxProps<T = unknown> {
  /** API function that returns paginated data (compatible with createSimpleFetcher) */
  apiFunction: ServerTableFetcher<T>;
  /** Transform API data to Option format */
  transform: TransformFunction<T>;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Controlled value (string for single select, string[] for multi select) */
  value?: string | string[];
  /** Callback when value changes */
  onChange?: (
    value: string | string[],
    option: Option | Option[] | undefined,
  ) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether the component is searchable */
  searchable?: boolean;
  /** Whether the component can be cleared */
  clearable?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component has an error state */
  hasError?: boolean;
  /** Whether multiple selection is enabled */
  multi?: boolean;
  /** Maximum number of visible items in multi-select mode */
  maxVisibleItems?: number;
  /** Custom render function for option labels */
  renderLabel?: (option: Option) => React.ReactNode;
  /** Custom render function for option items */
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
  /** Custom render function for the button element */
  renderButton?: (props: {
    loading: boolean;
    selectedOption: Option[] | Option | undefined;
    disabled: boolean;
    open: boolean;
    value: string[] | string;
    placeholder: string;
    error: boolean;
    multi: boolean;
    isSelected: boolean;
  }) => React.ReactNode;
  /** Message to show when no results are found */
  emptyMessage?: string;
  /** Whether to wrap items in multi-select mode */
  flexWrap?: boolean;
  /** Number of items per page */
  pageSize?: number;
  /** Whether to enable infinite scroll */
  enableInfiniteScroll?: boolean;
  /** Debounce delay for search input in milliseconds */
  searchDebounceMs?: number;
  /** Minimum number of characters required to trigger search */
  minSearchLength?: number;
  /** React Query cache key */
  queryKey?: string[];
  /** How long data stays fresh in cache (ms) */
  staleTime?: number;
  /** How long data stays in cache after component unmounts (ms) */
  gcTime?: number;
  /** Whether the query is enabled */
  enabled?: boolean;
  /** Whether the component should be enabled (affects both query and UI state) */
  componentEnabled?: boolean;
  /** Additional filter parameters to pass to the API */
  additionalFilters?: Record<string, unknown>;
}

/**
 * A paginated combo box component with infinite scroll support
 *
 * This component provides a searchable dropdown with pagination support,
 * ideal for large datasets that need to be loaded progressively.
 *
 * @template T - The type of data items returned by the API
 *
 * @example
 * ```tsx
 * <PaginationComboBox
 *   apiFunction={fetchUsers}
 *   transform={(user) => ({ label: user.name, value: user.id })}
 *   placeholder="Search users..."
 *   multi
 *   pageSize={20}
 * />
 * ```
 */
export const PaginationComboBox = <T = unknown,>({
  apiFunction,
  transform,
  placeholder = "Search and select...",
  value: controlledValue,
  onChange,
  className,
  searchable = true,
  clearable = true,
  disabled = false,
  hasError = false,
  multi = false,
  maxVisibleItems = 3,
  renderLabel,
  renderOption,
  renderButton,
  emptyMessage = "No results found",
  flexWrap = false,
  pageSize = 10,
  enableInfiniteScroll = true,
  searchDebounceMs = 300,
  minSearchLength = 0,
  queryKey = ["pagination-combo-fetcher"],
  staleTime = 30_000, // 30 seconds
  gcTime = 5 * 60_000, // 5 minutes
  enabled = true,
  componentEnabled = true,
  additionalFilters = {},
  ...props
}: PaginationComboBoxProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDebounceMs]);

  // React Query infinite query with proper type handling
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [
      ...queryKey,
      debouncedSearchTerm,
      // Stabilize additionalFilters by creating a sorted string representation
      Object.entries(additionalFilters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join("|"),
    ],
    queryFn: async ({
      pageParam = 0,
      signal,
    }): Promise<ServerTableResult<T>> => {
      if (debouncedSearchTerm.length < minSearchLength) {
        return {
          rows: [],
          total: 0,
        };
      }

      try {
        // Call the ServerTableFetcher directly - it already returns ServerTableResult<T>
        const result = await apiFunction({
          pageIndex: pageParam as number,
          pageSize,
          sorting: [],
          columnFilters: [],
          globalFilter: debouncedSearchTerm,
          signal,
          ...additionalFilters,
        });

        return result;
      } catch (err) {
        // Re-throw the error to be handled by React Query
        throw err;
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: ServerTableResult<T>, allPages) => {
      const currentPage = allPages.length - 1;
      const totalPages = Math.ceil(lastPage.total / pageSize);
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    enabled:
      enabled &&
      componentEnabled &&
      debouncedSearchTerm.length >= minSearchLength,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors except 429 (rate limit)
      if (error instanceof Error && "status" in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500 && status !== 429) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });

  // Determine loading states with proper type safety
  const isInitialLoading = useMemo(
    () =>
      isLoading && (!(data as any)?.pages || (data as any).pages.length === 0),
    [isLoading, data],
  );

  const isPaginationLoading = isFetchingNextPage;

  // Flatten all pages into a single array of options with proper memoization
  const allOptions = useMemo(() => {
    if (!(data as any)?.pages) return [];

    return (data as any).pages.flatMap((page: any) => {
      // useInfiniteQuery wraps the data in a 'data' property
      const pageData = page.data || page;
      const rows = Array.isArray(pageData.rows) ? pageData.rows : [];
      return rows.map(transform);
    });
  }, [data, transform]);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  // Handle load more with proper error handling
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) {
      fetchNextPage().catch((err) => {
        console.error("Failed to fetch next page:", err);
      });
    }
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  // Handle option selection with proper type safety
  const handleValueChange = useCallback(
    (newValue: string | string[], newOption: Option | Option[] | undefined) => {
      onChange?.(newValue, newOption);
    },
    [onChange],
  );

  // Custom command list props for infinite scroll with throttling
  const commandListProps = useMemo(
    () => ({
      onScroll: enableInfiniteScroll
        ? (e: React.UIEvent<HTMLDivElement>) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;

            if (
              isNearBottom &&
              hasNextPage &&
              !isFetchingNextPage &&
              !isError
            ) {
              handleLoadMore();
            }
          }
        : undefined,
    }),
    [
      enableInfiniteScroll,
      hasNextPage,
      isFetchingNextPage,
      isError,
      handleLoadMore,
    ],
  );

  // Custom command input props for search handling
  const commandInputProps = useMemo(
    () => ({
      onValueChange: handleSearchChange,
      value: searchTerm,
      placeholder: searchable ? "Search..." : undefined,
    }),
    [searchTerm, searchable, handleSearchChange],
  );

  // Custom render option with loading indicator and proper error handling
  const customRenderOption = useCallback(
    (option: Option, isSelected: boolean) => {
      // Handle load more option specially
      if (option.value === "__load_more__") {
        return (
          <div
            className="text-muted-foreground hover:bg-muted flex cursor-pointer items-center justify-center py-2 text-center text-sm transition-colors"
            onClick={handleLoadMore}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLoadMore();
              }
            }}
          >
            {isPaginationLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading more...
              </div>
            ) : (
              "Load more..."
            )}
          </div>
        );
      }

      if (renderOption) {
        return renderOption(option, isSelected);
      }

      return (
        <ComboBoxOptionItem
          option={option}
          multi={multi}
          isSelected={isSelected}
        />
      );
    },
    [multi, renderOption, isPaginationLoading, handleLoadMore],
  );

  // Add load more option at the end if there are more items
  const finalOptions = useMemo(() => {
    if (!hasNextPage || allOptions.length === 0) {
      return allOptions;
    }

    return [
      ...allOptions,
      {
        value: "__load_more__",
        label: isPaginationLoading ? "Loading more..." : "Load more...",
        disabled: isPaginationLoading,
      },
    ];
  }, [allOptions, hasNextPage, isPaginationLoading]);

  // Generate appropriate empty message based on state
  const getEmptyMessage = useCallback(() => {
    if (isError) {
      return `Error: ${error?.message || "Failed to fetch data"}`;
    }

    if (debouncedSearchTerm.length < minSearchLength) {
      return `Type at least ${minSearchLength} characters to search`;
    }

    return emptyMessage;
  }, [
    isError,
    error?.message,
    debouncedSearchTerm.length,
    minSearchLength,
    emptyMessage,
  ]);

  // Adapter function to convert renderButton props to ComboBox format
  const adaptedRenderButton = renderButton
    ? (props: {
        loading: boolean;
        selectedOption: typeof multi extends true
          ? Option[]
          : Option | undefined;
        disabled: boolean;
        open: boolean;
        value: typeof multi extends true ? string[] : string;
        placeholder: string;
        error: boolean;
        multi: typeof multi;
        isSelected: boolean;
      }) => {
        return renderButton({
          loading: props.loading,
          selectedOption: props.selectedOption as Option[] | Option | undefined,
          disabled: props.disabled,
          open: props.open,
          value: props.value as string[] | string,
          placeholder: props.placeholder,
          error: props.error,
          multi: props.multi as boolean,
          isSelected: props.isSelected,
        });
      }
    : undefined;

  return (
    <div className="relative">
      <ComboBox
        options={finalOptions}
        placeholder={placeholder}
        value={controlledValue}
        onChange={handleValueChange}
        className={className}
        searchable={searchable}
        clearable={clearable}
        disabled={disabled || !componentEnabled}
        loading={isInitialLoading}
        error={hasError || isError}
        multi={multi}
        maxVisibleItems={maxVisibleItems}
        renderLabel={renderLabel}
        renderOption={customRenderOption}
        renderButton={adaptedRenderButton as any}
        commandListProps={commandListProps}
        commandInputProps={commandInputProps}
        emptyMessage={getEmptyMessage()}
        flexWrap={flexWrap}
        {...props}
      />

      {/* Optional loading indicator for infinite scroll - uncomment if needed */}
      {isPaginationLoading && allOptions.length > 0 && (
        <div
          className="bg-background text-muted-foreground absolute right-2 bottom-2 flex items-center gap-2 rounded-md border px-2 py-1 text-xs shadow-sm"
          role="status"
          aria-label="Loading more items"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading...
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to create a type-safe transform function
 * This provides the best type inference without explicit typing
 *
 * @example
 * ```tsx
 * <PaginationComboBox
 *   apiFunction={companyFilter}
 *   transform={createTransform((val) => ({
 *     value: val._id,        // val is automatically typed as CompanyListItem
 *     label: val.companyName,
 *   }))}
 * />
 * ```
 */
export function createTransform<T>(
  transformFn: (item: T) => Option,
): TransformFunction<T> {
  return transformFn;
}

export default PaginationComboBox;
