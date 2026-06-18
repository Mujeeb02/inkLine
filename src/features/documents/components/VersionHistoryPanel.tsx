"use client";

import React, { useState } from "react";
import { X, Clock, RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import type { Version } from "../hooks/use-versions";

type VersionHistoryPanelProps = {
  documentId: string;
  versions: Version[];
  restoreVersion: (id: string) => Promise<any>;
  userPermission: string;
  onClose: () => void;
  onRestoreSuccess: (updatedDoc: any) => void;
};

// Render Tiptap JSON to preview components safely
function renderTiptapNode(node: any, index: number): React.ReactNode {
  if (!node) return null;
  
  switch (node.type) {
    case "doc":
      return (
        <div key={index} className="space-y-3">
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx))}
        </div>
      );
    case "heading":
      const level = node.attrs?.level || 1;
      const HeadingTag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;
      const headingClasses = {
        1: "text-lg font-black mt-4 mb-1.5 text-slate-900 border-b pb-0.5",
        2: "text-base font-extrabold mt-3 mb-1.5 text-slate-900",
        3: "text-sm font-bold mt-3 mb-1 text-slate-900",
        4: "text-xs font-bold mt-2.5 mb-1 text-slate-900",
        5: "text-xs font-bold mt-2 mb-1 text-slate-900",
        6: "text-[10px] font-bold mt-2 mb-1 text-slate-900",
      }[level as 1|2|3|4|5|6] || "text-base font-bold";
      
      return (
        <HeadingTag key={index} className={headingClasses}>
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx))}
        </HeadingTag>
      );
    case "paragraph":
      return (
        <p key={index} className="text-[11px] font-semibold text-slate-700 leading-relaxed min-h-[1em]">
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx)) || <br />}
        </p>
      );
    case "bulletList":
      return (
        <ul key={index} className="list-disc list-inside pl-3 space-y-0.5 text-[11px] text-slate-700 font-semibold">
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} className="list-decimal list-inside pl-3 space-y-0.5 text-[11px] text-slate-700 font-semibold">
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx))}
        </ol>
      );
    case "listItem":
      return (
        <li key={index}>
          {node.content?.map((child: any, idx: number) => renderTiptapNode(child, idx))}
        </li>
      );
    case "text":
      let textElement: React.ReactNode = node.text;
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === "bold") {
            textElement = <strong className="font-extrabold">{textElement}</strong>;
          }
          if (mark.type === "italic") {
            textElement = <em className="italic">{textElement}</em>;
          }
          if (mark.type === "underline") {
            textElement = <u className="underline">{textElement}</u>;
          }
          if (mark.type === "strike") {
            textElement = <span className="line-through">{textElement}</span>;
          }
          if (mark.type === "code") {
            textElement = <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px]">{textElement}</code>;
          }
        }
      }
      return <span key={index}>{textElement}</span>;
    default:
      return null;
  }
}

export function VersionHistoryPanel({
  versions,
  restoreVersion,
  userPermission,
  onClose,
  onRestoreSuccess,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const canRestore = userPermission === "owner" || userPermission === "editor";

  const handleRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      const updatedDoc = await restoreVersion(versionId);
      onRestoreSuccess(updatedDoc);
      setSelectedVersion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="w-80 border-l-2 border-slate-900 bg-white flex flex-col h-full flex-shrink-0 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-800" />
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Version History</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
            {versions.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 border-2 border-transparent hover:border-slate-900 rounded-lg transition"
          aria-label="Close history panel"
        >
          <X className="h-4 w-4 text-slate-800" />
        </button>
      </div>

      {/* Version List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {versions.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">No versions recorded</p>
            <p className="text-[10px] text-slate-350 mt-1">
              Edits will automatically save snapshot history.
            </p>
          </div>
        ) : (
          versions.map((v) => (
            <div
              key={v.id}
              className="border-2 border-slate-900 rounded-xl p-3 bg-white shadow-sm space-y-2.5 transition hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-950">Version {v.version}</h4>
                  <p className="text-[10px] text-slate-450 font-bold mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">
                    Saved by: <span className="font-bold text-slate-700">{v.savedByEmail}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-2.5">
                <button
                  onClick={() => setSelectedVersion(v)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
                {canRestore && (
                  <button
                    onClick={() => handleRestore(v.id)}
                    disabled={isRestoring}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[#ffc300] hover:bg-[#e6b200] border border-slate-900 shadow-sm hover:shadow rounded-lg text-[10px] font-black uppercase tracking-wider transition text-slate-900 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRestoring ? "animate-spin" : ""}`} />
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={selectedVersion !== null} onOpenChange={(open) => !open && setSelectedVersion(null)}>
        {selectedVersion && (
          <DialogContent className="sm:max-w-2xl border-2 border-slate-900 shadow-panel bg-white rounded-2xl flex flex-col max-h-[85vh]">
            <DialogHeader className="border-b pb-3 border-slate-100 flex-shrink-0">
              <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-yellow-500" />
                Previewing Version {selectedVersion.version}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-500 mt-1">
                Saved by {selectedVersion.savedByEmail} on{" "}
                {new Date(selectedVersion.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </DialogDescription>
            </DialogHeader>

            {/* Read-Only Preview Body */}
            <div className="flex-grow overflow-y-auto my-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2">
                {selectedVersion.title}
              </h2>
              <div className="prose prose-slate max-w-none">
                {renderTiptapNode(selectedVersion.content, 0)}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                onClick={() => setSelectedVersion(null)}
                className="border-2 border-slate-900 font-bold text-xs"
              >
                Close
              </Button>
              {canRestore && (
                <Button
                  onClick={() => handleRestore(selectedVersion.id)}
                  disabled={isRestoring}
                  className="bg-[#ffc300] text-slate-900 hover:bg-[#e6b200] border-2 border-slate-900 shadow-btn font-bold text-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  {isRestoring ? "Restoring..." : "Restore this version"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
