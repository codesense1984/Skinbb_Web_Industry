import { useCallback, useLayoutEffect, useRef } from "react";

type Options = {
  maxHeight?: number; // px
  value: string;
};

export function useAutoResizeTextarea<T extends HTMLTextAreaElement>({
  maxHeight = 84,
  value,
}: Options) {
  const ref = useRef<T | null>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [maxHeight]);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  return { ref, onInput: resize };
}
