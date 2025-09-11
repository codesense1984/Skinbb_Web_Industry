import { useEffect, useState } from "react";

export const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof TAILWIND_BREAKPOINTS;

type Breakpoints = Record<BreakpointKey | "xs", boolean>;

type MediaQueryResult = {
  width: number;
  height: number;
  currentBreakpoint: BreakpointKey | "xs";
} & Breakpoints;

const getCurrentBreakpoint = (width: number): BreakpointKey | "xs" => {
  if (width >= TAILWIND_BREAKPOINTS["2xl"]) return "2xl";
  if (width >= TAILWIND_BREAKPOINTS["xl"]) return "xl";
  if (width >= TAILWIND_BREAKPOINTS["lg"]) return "lg";
  if (width >= TAILWIND_BREAKPOINTS["md"]) return "md";
  if (width >= TAILWIND_BREAKPOINTS["sm"]) return "sm";
  return "xs";
};

export const useMediaQuery = (): MediaQueryResult => {
  const [state, setState] = useState<MediaQueryResult>(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 0;
    const height = typeof window !== "undefined" ? window.innerHeight : 0;
    const bp = getCurrentBreakpoint(width);

    return {
      width,
      height,
      xs: width < TAILWIND_BREAKPOINTS.sm,
      sm: width >= TAILWIND_BREAKPOINTS.sm && width < TAILWIND_BREAKPOINTS.md,
      md: width >= TAILWIND_BREAKPOINTS.md && width < TAILWIND_BREAKPOINTS.lg,
      lg: width >= TAILWIND_BREAKPOINTS.lg && width < TAILWIND_BREAKPOINTS.xl,
      xl:
        width >= TAILWIND_BREAKPOINTS.xl && width < TAILWIND_BREAKPOINTS["2xl"],
      "2xl": width >= TAILWIND_BREAKPOINTS["2xl"],
      currentBreakpoint: bp,
    };
  });

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const bp = getCurrentBreakpoint(width);

      setState({
        width,
        height,
        xs: width < TAILWIND_BREAKPOINTS.sm,
        sm: width >= TAILWIND_BREAKPOINTS.sm && width < TAILWIND_BREAKPOINTS.md,
        md: width >= TAILWIND_BREAKPOINTS.md && width < TAILWIND_BREAKPOINTS.lg,
        lg: width >= TAILWIND_BREAKPOINTS.lg && width < TAILWIND_BREAKPOINTS.xl,
        xl:
          width >= TAILWIND_BREAKPOINTS.xl &&
          width < TAILWIND_BREAKPOINTS["2xl"],
        "2xl": width >= TAILWIND_BREAKPOINTS["2xl"],
        currentBreakpoint: bp,
      });
    };

    window.addEventListener("resize", onResize);
    onResize(); // Initialize
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return state;
};
