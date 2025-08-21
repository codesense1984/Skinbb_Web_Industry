// src/core/anim/useReducedMotion.ts
import * as React from "react";
export function useReducedMotion() {
  const [reduced, set] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    set(mq.matches);
    const onChange = (e: MediaQueryListEvent) => set(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
