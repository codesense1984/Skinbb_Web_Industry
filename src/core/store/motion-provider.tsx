// src/core/providers/MotionProvider.tsx
import * as React from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

type MotionContextValue = {
  reducedMotion: boolean;
};

const MotionContext = React.createContext<MotionContextValue | null>(null);

export const MotionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const reduced = useReducedMotion();
  return (
    <MotionContext.Provider value={{ reducedMotion: reduced }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotionConfig = () => {
  const ctx = React.useContext(MotionContext);
  if (!ctx)
    throw new Error("useMotionConfig must be used within MotionProvider");
  return ctx;
};
