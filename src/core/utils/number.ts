export function formatCurrency(
  amount: number,
  options?: {
    locale?: string;
    currency?: string;
    useAbbreviation?: boolean;
    decimalPlaces?: number;
  },
) {
  const {
    locale = "en-IN",
    currency = "INR",
    useAbbreviation = true,
    decimalPlaces = 2,
  } = options ?? {};

  if (useAbbreviation) {
    const format = (val: number, suffix: string) => {
      let str = val.toFixed(decimalPlaces);
      // Remove trailing zeroes and optional dot
      if (str.includes(".")) {
        str = str
          .replace(/(\.\d*?[1-9])0+$/, "$1")
          .replace(/\.0+$/, "")
          .replace(/\.$/, "");
      }
      return `${str}${suffix}`;
    };

    if (amount >= 1e7) {
      return format(amount / 1e7, "Cr");
    } else if (amount >= 1e5) {
      return format(amount / 1e5, "L");
    } else if (amount >= 1e3) {
      return format(amount / 1e3, "k");
    }
  }

  // Check if the number is a whole number
  const isWholeNumber = Number.isInteger(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: isWholeNumber ? 0 : (decimalPlaces ?? 2),
  }).format(amount);
}

export function formatNumber(
  amount: number,
  options?: { locale?: string } & Intl.NumberFormatOptions,
) {
  const { locale = "en-IN", ...rest } = options ?? {};
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: 2,
    ...rest,
  }).format(amount);
}

export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}
