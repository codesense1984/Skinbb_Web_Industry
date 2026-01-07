import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Auto-scrolls to bottom only if the user is already near the bottom.
 * Prevents stealing scroll when the user is reading older messages.
 */
export function useStickToBottom<T extends HTMLElement>(threshold = 60) {
  const containerRef = useRef<T | null>(null);
  const [shouldStick, setShouldStick] = useState(true);

  const checkIfNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShouldStick(distance <= threshold);
  }, [threshold]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => checkIfNearBottom();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [checkIfNearBottom]);

  const onContentChange = useCallback(() => {
    if (shouldStick) scrollToBottom();
  }, [shouldStick, scrollToBottom]);

  return { containerRef, onContentChange, scrollToBottom };
}
