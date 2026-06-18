"use client";

import React from "react";

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 animate-pulse select-none">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
        <div className="h-4 w-24 rounded bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
      </div>
      <div className="border-t border-[#f1f5f9] pt-3 flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-3 w-12 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
