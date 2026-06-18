"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, MessageSquare, Clock } from "lucide-react";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { ShareModal } from "@/features/sharing/components/ShareModal";
import { usePresence } from "../hooks/use-presence";
import { PresenceAvatars } from "./PresenceAvatars";
import { ExportMenu } from "./ExportMenu";
import type { EditorDocument } from "@/modules/document/document.types";

type SaveState = "idle" | "saving" | "saved" | "error";

type EditorHeaderProps = {
  document: EditorDocument;
  title: string;
  setTitle: (title: string) => void;
  saveState: SaveState;
  lastSavedAt: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activePanel?: "comments" | "versions" | null;
  setActivePanel?: (panel: "comments" | "versions" | null) => void;
  commentCount?: number;
};

export function EditorHeader({
  document,
  title,
  saveState,
  lastSavedAt,
  activePanel,
  setActivePanel,
  commentCount = 0,
}: EditorHeaderProps) {
  const canShare = document.permission === "owner";
  const activeUsers = usePresence(document.id);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b-2 border-slate-900 bg-[#fbfaf8]/95 px-6 backdrop-blur-md select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-slate-900 bg-white text-slate-800 hover:bg-slate-50 hover:shadow-btn transition active:scale-95 flex-shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-450" />
          <span>Documents</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-450" />
          <span className="text-slate-900 max-w-[12rem] truncate font-extrabold">{title || "Untitled"}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PresenceAvatars users={activeUsers} />
        
        <div className="h-4 w-[1px] bg-slate-200" />

        {/* Panel Toggles */}
        <button
          onClick={() => setActivePanel?.(activePanel === "comments" ? null : "comments")}
          className={`relative p-1.5 rounded-lg border-2 border-slate-900 bg-white shadow-btn hover:bg-slate-50 transition active:scale-95 flex-shrink-0 ${
            activePanel === "comments" ? "bg-yellow-50" : ""
          }`}
          title="Toggle comments"
        >
          <MessageSquare className="h-4 w-4 text-slate-800" />
          {commentCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-white text-[8px] font-black text-white">
              {commentCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActivePanel?.(activePanel === "versions" ? null : "versions")}
          className={`p-1.5 rounded-lg border-2 border-slate-900 bg-white shadow-btn hover:bg-slate-50 transition active:scale-95 flex-shrink-0 ${
            activePanel === "versions" ? "bg-yellow-50" : ""
          }`}
          title="Toggle version history"
        >
          <Clock className="h-4 w-4 text-slate-800" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        <AutosaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
        <ExportMenu documentTitle={title} documentContent={document.content} />
        {canShare && <ShareModal documentId={document.id} sharedWith={document.sharedWith} />}
      </div>
    </header>
  );
}
