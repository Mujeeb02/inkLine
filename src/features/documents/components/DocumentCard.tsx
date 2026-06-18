"use client";

import Link from "next/link";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Edit3, Trash2, Calendar, Share2, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/providers/ToastProvider";
import { DocumentClientService } from "@/features/documents/services/documents";
import { formatDate } from "@/shared/utils";

type DocumentCardProps = {
  document: {
    id: string;
    title: string;
    updatedAt: string;
    ownerEmail?: string;
    snippet?: string;
  };
  isShared?: boolean;
};

export function DocumentCard({ document, isShared = false }: DocumentCardProps) {
  const router = useRouter();
  const [title, setTitle] = useState(document.title);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRename = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await DocumentClientService.updateDocument(document.id, { title: title.trim() });
        toast(`Successfully renamed to "${title.trim()}"`, "success");
        setIsRenameOpen(false);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to rename document";
        toast(message, "error");
      }
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${document.title}"?`);
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await DocumentClientService.deleteDocument(document.id);
        toast("Document deleted successfully", "success");
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete document";
        toast(message, "error");
      }
    });
  };

  return (
    <div className="group relative rounded-xl border-2 border-slate-900 bg-white p-5 shadow-card hover:shadow-panel hover:bg-slate-50/50 transition-all duration-200 flex flex-col justify-between h-48 select-none">
      <Link href={`/documents/${document.id}`} className="flex-1">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 shadow-sm flex-shrink-0">
                <FileText className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none truncate max-w-[9rem] group-hover:underline">
                {document.title}
              </h3>
            </div>
            {isShared && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e05a47] border-2 border-slate-900 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm flex-shrink-0">
                <Share2 className="h-2.5 w-2.5" />
                Shared
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
            {document.snippet || "Empty document"}
          </p>
        </div>
      </Link>

      <div className="border-t-2 border-slate-100 pt-3 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(document.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Document actions for owned docs */}
          {!isShared && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1">
              <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogTrigger asChild>
                  <button
                    aria-label="Rename"
                    className="p-1 border border-slate-200 bg-white rounded-md text-slate-500 hover:text-slate-900 hover:border-slate-900 hover:shadow-btn transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename document</DialogTitle>
                    <DialogDescription>
                      Give your document a descriptive name. Maximum 100 characters.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleRename} className="mt-4 space-y-4">
                    <Input
                      maxLength={100}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={isPending}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsRenameOpen(false)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending || !title.trim()}>
                        {isPending ? "Saving..." : "Save title"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Delete"
                className="p-1 border border-slate-200 bg-white rounded-md text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 hover:shadow-btn transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {isShared && document.ownerEmail && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 max-w-[8rem] truncate">
              <User className="h-3 w-3" />
              {document.ownerEmail.split("@")[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
