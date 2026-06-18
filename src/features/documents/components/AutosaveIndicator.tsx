"use client";

import React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { formatDate } from "@/shared/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

type AutosaveIndicatorProps = {
  state: SaveState;
  lastSavedAt: string;
};

export function AutosaveIndicator({ state, lastSavedAt }: AutosaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium font-sans select-none">
      {state === "saving" && (
        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full animate-pulse-slow">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving changes
        </span>
      )}

      {state === "error" && (
        <span className="flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-200/50 px-2.5 py-0.5 rounded-full">
          <AlertCircle className="h-3 w-3" />
          Save failed
        </span>
      )}

      {(state === "saved" || state === "idle") && (
        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">
          <Check className="h-3 w-3" />
          Saved {formatDate(lastSavedAt)}
        </span>
      )}
    </div>
  );
}
