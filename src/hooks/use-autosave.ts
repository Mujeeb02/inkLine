"use client";

import { useEffect, useRef } from "react";

type UseAutosaveOptions = {
  enabled: boolean;
  intervalMs?: number;
  onSave: () => Promise<void> | void;
};

export function useAutosave({
  enabled,
  intervalMs = 3000,
  onSave,
}: UseAutosaveOptions) {
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void onSaveRef.current();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs]);
}
