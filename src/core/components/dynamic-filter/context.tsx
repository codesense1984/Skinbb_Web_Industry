/**
 * Filter Context and Provider with reducer-based state management
 */

import * as React from "react";
import type { FilterOption, FilterValue, SelectionMode } from "./types";
import { assertFilterValueMap, dedupeByValue, toArray } from "./types";

interface FilterState {
  value: FilterValue;
}

type FilterAction =
  | {
      type: "SET_ITEM";
      key: string;
      values: FilterOption[];
      mode?: SelectionMode;
    }
  | { type: "CLEAR_ITEM"; key: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_VALUE"; value: FilterValue };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_ITEM": {
      const { key, values, mode = "single" } = action;
      const normalized = dedupeByValue(toArray(values));
      const nextValue = mode === "single" ? normalized.slice(0, 1) : normalized;

      return {
        value: {
          ...state.value,
          [key]: nextValue,
        },
      };
    }
    case "CLEAR_ITEM": {
      const next = { ...state.value };
      delete next[action.key];
      return { value: next };
    }
    case "CLEAR_ALL":
      return { value: {} };
    case "SET_VALUE":
      return { value: action.value };
    default:
      return state;
  }
}

interface FilterContextValue {
  value: FilterValue;
  setItem: (
    key: string,
    values: FilterOption[],
    opts?: { mode?: SelectionMode },
  ) => void;
  clearItem: (key: string) => void;
  clearAll: () => void;
  subscribe: (key: string, callback: () => void) => () => void;
}

const FilterContext = React.createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
  value?: FilterValue;
  defaultValue?: FilterValue;
  onChange?: (next: FilterValue) => void;
  children: React.ReactNode;
  className?: string;
  registry?: Partial<
    Record<
      "dropdown" | "input" | "date" | "custom" | "pagination",
      React.ComponentType<any>
    >
  >;
}

export function FilterProvider({
  value: controlledValue,
  defaultValue,
  onChange,
  children,
  registry,
}: FilterProviderProps) {
  const isControlled = controlledValue !== undefined;
  const [state, dispatch] = React.useReducer(filterReducer, {
    value: defaultValue ?? {},
  });

  // Validate defaultValue on mount
  React.useEffect(() => {
    if (defaultValue !== undefined) {
      assertFilterValueMap(defaultValue, "defaultValue");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate controlled value
  React.useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      assertFilterValueMap(controlledValue, "value");
    }
  }, [isControlled, controlledValue]);

  // Sync controlled value
  const currentValue = isControlled ? controlledValue : state.value;

  // Subscriptions for selector-based updates
  const subscriptionsRef = React.useRef<Map<string, Set<() => void>>>(
    new Map(),
  );

  const subscribe = React.useCallback((key: string, callback: () => void) => {
    if (!subscriptionsRef.current.has(key)) {
      subscriptionsRef.current.set(key, new Set());
    }
    subscriptionsRef.current.get(key)!.add(callback);
    return () => {
      const callbacks = subscriptionsRef.current.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(key);
        }
      }
    };
  }, []);

  const notifySubscribers = React.useCallback((key: string) => {
    const callbacks = subscriptionsRef.current.get(key);
    if (callbacks) {
      callbacks.forEach((cb) => cb());
    }
  }, []);

  const setItem = React.useCallback(
    (key: string, values: FilterOption[], opts?: { mode?: SelectionMode }) => {
      const normalized = dedupeByValue(toArray(values));
      const mode = opts?.mode ?? "single";
      const nextValue = mode === "single" ? normalized.slice(0, 1) : normalized;

      const next: FilterValue = {
        ...currentValue,
        [key]: nextValue,
      };

      assertFilterValueMap(next, "onChange.next");

      if (!isControlled) {
        dispatch({ type: "SET_ITEM", key, values: nextValue, mode });
      }

      notifySubscribers(key);
      onChange?.(next);
    },
    [currentValue, isControlled, onChange, notifySubscribers],
  );

  const clearItem = React.useCallback(
    (key: string) => {
      const next = { ...currentValue };
      delete next[key];

      assertFilterValueMap(next, "onChange.next");

      if (!isControlled) {
        dispatch({ type: "CLEAR_ITEM", key });
      }

      notifySubscribers(key);
      onChange?.(next);
    },
    [currentValue, isControlled, onChange, notifySubscribers],
  );

  const clearAll = React.useCallback(() => {
    const next: FilterValue = {};

    assertFilterValueMap(next, "onChange.next");

    if (!isControlled) {
      dispatch({ type: "CLEAR_ALL" });
    }

    // Notify all subscribers
    subscriptionsRef.current.forEach((_, key) => {
      notifySubscribers(key);
    });

    onChange?.(next);
  }, [isControlled, onChange, notifySubscribers]);

  const contextValue = React.useMemo<FilterContextValue>(
    () => ({
      value: currentValue,
      setItem,
      clearItem,
      clearAll,
      subscribe,
    }),
    [currentValue, setItem, clearItem, clearAll, subscribe],
  );

  return (
    <FilterContext.Provider value={contextValue}>
      <FilterRegistryContext.Provider value={registry ?? null}>
        {children}
      </FilterRegistryContext.Provider>
    </FilterContext.Provider>
  );
}

// Registry context for custom component types
const FilterRegistryContext = React.createContext<Partial<
  Record<
    "dropdown" | "input" | "date" | "custom" | "pagination",
    React.ComponentType<any>
  >
> | null>(null);

export function useFilterRegistry() {
  return React.useContext(FilterRegistryContext);
}

export function useFilterContext(): FilterContextValue {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return context;
}
