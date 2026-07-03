import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Calls `onSave` `delayMs` after the last change to `value`. Also fires
 * immediately on unmount/page hide so work survives a connection drop or a
 * closed tab, per the non-functional autosave requirement.
 */
export function useAutosave<T>(value: T, onSave: (value: T) => Promise<unknown>, delayMs = 1000) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const latestValue = useRef(value);
  const isFirstRun = useRef(true);

  latestValue.current = value;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await onSave(latestValue.current);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function flush() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        onSave(latestValue.current).catch(() => {});
      }
    }
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}
