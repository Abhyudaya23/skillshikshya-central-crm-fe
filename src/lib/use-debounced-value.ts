import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delay` ms. Use to throttle a search box's text
 * before it drives a server request — the query only fires once typing pauses,
 * not on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
