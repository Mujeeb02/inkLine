"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Trash2, Send, MessageSquare, Quote } from "lucide-react";
import type { Comment, CommentSelection } from "../hooks/use-comments";

type CommentPanelProps = {
  documentId: string;
  comments: Comment[];
  addComment: (body: string, selection?: CommentSelection) => Promise<any>;
  resolveComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  currentUserId: string;
  userPermission: string;
  editor: any;
  onClose: () => void;
};

export function CommentPanel({
  comments,
  addComment,
  resolveComment,
  deleteComment,
  currentUserId,
  userPermission,
  editor,
  onClose,
}: CommentPanelProps) {
  const [newCommentBody, setNewCommentBody] = useState("");
  const [activeSelection, setActiveSelection] = useState<CommentSelection | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Capture editor selection if any
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, " ");
        if (text.trim()) {
          setActiveSelection({ from, to, text });
        }
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim() || isPending) return;

    setIsPending(true);
    try {
      await addComment(newCommentBody.trim(), activeSelection || undefined);
      setNewCommentBody("");
      setActiveSelection(null);
      // Clear selection in editor
      if (editor) {
        editor.commands.focus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  const isViewer = userPermission === "viewer";
  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  return (
    <div className="w-80 border-l-2 border-slate-900 bg-white flex flex-col h-full flex-shrink-0 animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-800" />
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Comments</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
            {activeComments.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-200 border-2 border-transparent hover:border-slate-900 rounded-lg transition"
          aria-label="Close comment panel"
        >
          <X className="h-4 w-4 text-slate-800" />
        </button>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeComments.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">No active comments</p>
            <p className="text-[10px] text-slate-350 mt-1">
              Highlight document text or type below to start a discussion.
            </p>
          </div>
        ) : (
          activeComments.map((comment) => {
            const isAuthor = comment.authorId === currentUserId;
            const isOwner = userPermission === "owner";
            const canDelete = isAuthor || isOwner;

            return (
              <div
                key={comment.id}
                className="border-2 border-slate-900 rounded-xl p-3 bg-white shadow-sm space-y-2.5 transition hover:shadow-md"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffc300] border border-slate-900 text-slate-900 font-black text-[9px] flex-shrink-0">
                      {comment.authorEmail[0].toUpperCase()}
                    </span>
                    <span className="text-[10px] font-black text-slate-900 truncate" title={comment.authorEmail}>
                      {comment.authorEmail}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-450 font-bold whitespace-nowrap">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Text selection quote if comment is inline */}
                {comment.selection && (
                  <div className="flex gap-1.5 bg-yellow-50/70 border-l-2 border-yellow-450 p-2 rounded-r-md text-[10px] text-slate-600 italic font-semibold line-clamp-2">
                    <Quote className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="truncate">"{comment.selection.text}"</span>
                  </div>
                )}

                {/* Comment body */}
                <p className="text-xs font-semibold text-slate-800 leading-normal break-words">
                  {comment.body}
                </p>

                {/* Actions */}
                {!isViewer && (
                  <div className="flex justify-end gap-1.5 border-t border-slate-100 pt-2">
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-black uppercase tracking-wider transition"
                    >
                      <Check className="h-3 w-3" />
                      Resolve
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-1 hover:bg-red-50 hover:text-red-650 text-slate-400 border border-transparent hover:border-red-200 rounded-md transition"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Resolved comments collapsible section */}
        {resolvedComments.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="w-full py-1.5 px-2.5 border-2 border-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-black text-slate-700 flex items-center justify-between transition"
            >
              <span>{showResolved ? "Hide" : "Show"} Resolved Comments ({resolvedComments.length})</span>
              <span className="text-[8px] font-extrabold uppercase">
                {showResolved ? "▲" : "▼"}
              </span>
            </button>

            {showResolved && (
              <div className="mt-3 space-y-3 pl-1.5 border-l border-slate-200">
                {resolvedComments.map((comment) => (
                  <div key={comment.id} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 space-y-1 opacity-70">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 truncate">{comment.authorEmail}</span>
                      <span className="text-[8px] text-slate-400 font-medium">Resolved</span>
                    </div>
                    {comment.selection && (
                      <p className="text-[9px] text-slate-450 italic line-clamp-1">"{comment.selection.text}"</p>
                    )}
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-2">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Comment input at bottom */}
      {!isViewer && (
        <form onSubmit={handleSubmit} className="p-4 border-t-2 border-slate-900 bg-slate-50 space-y-2">
          {activeSelection && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 px-2 py-1.5 rounded-lg text-[10px] text-slate-600 font-semibold">
              <span className="truncate flex-1">Commenting on selection: "{activeSelection.text}"</span>
              <button
                type="button"
                onClick={() => setActiveSelection(null)}
                className="p-0.5 hover:bg-yellow-100 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
              className="flex-1 px-3 py-1.5 border-2 border-slate-900 rounded-xl text-xs font-bold bg-white focus:outline-none focus:shadow-btn transition"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending || !newCommentBody.trim()}
              className="p-2 bg-[#ffc300] hover:bg-[#e6b200] border-2 border-slate-900 shadow-btn rounded-xl flex items-center justify-center transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              aria-label="Send comment"
            >
              <Send className="h-3.5 w-3.5 text-slate-900" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
