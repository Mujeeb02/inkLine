"use client";

import React from "react";
import { Sparkles, FileEdit } from "lucide-react";

type EmptyDocumentsStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyDocumentsState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyDocumentsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] bg-slate-50/20 p-8 text-center min-h-[12rem] select-none">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-3 border border-slate-200/50">
        <FileEdit className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-[#64748b] max-w-xs mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
