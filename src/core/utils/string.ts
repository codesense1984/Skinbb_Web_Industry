export function capitalize(str: string) {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str?.charAt(0)?.toUpperCase() + str.slice(1);
}

export function camelToTitle(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function truncate(str: string, max = 100) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

export function kebabToTitle(str: string) {
  return str.split("-").map(capitalize).join(" ");
}

export interface SelectOption {
  label: string;
  value: string;
}
export function mapToSelectOptions<T extends string | Record<string, unknown>>(
  values: T[],
  labelKey?: T extends string
    ? never
    : keyof Extract<T, Record<string, unknown>>,
  valueKey?: T extends string
    ? never
    : keyof Extract<T, Record<string, unknown>>,
): SelectOption[] {
  return values.map((item) => {
    if (typeof item === "string") {
      return {
        label: camelToTitle(item),
        value: item,
      };
    }

    const obj = item as Record<string, unknown>;
    const label = labelKey ?? "label";
    const value = valueKey ?? "value";

    return {
      label: camelToTitle(String(obj[label])),
      value: String(obj[value]),
    };
  });
}
