"use client";

import React, { useState, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { useAutosave } from "../hooks/use-autosave";
import { getEditorExtensions, normalizeDocumentContent } from "@/modules/shared/utils";
import { DocumentClientService } from "../services/documents";
import { useToast } from "@/shared/components/providers/ToastProvider";
import type { EditorDocument } from "@/modules/document/document.types";
import { FileText, Clock, Sparkles } from "lucide-react";

type DocumentEditorProps = {
  document: EditorDocument;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function DocumentEditor({ document }: DocumentEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(document.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState(document.updatedAt);
  const saveInFlightRef = useRef(false);

  const isEditable = document.permission === "owner" || document.permission === "editor";

  const lastSavedRef = useRef({
    title: document.title,
    content: JSON.stringify(normalizeDocumentContent(document.content)),
  });

  const [hasContentChanges, setHasContentChanges] = useState(false);

  const editor = useEditor({
    editable: isEditable,
    immediatelyRender: false,
    extensions: getEditorExtensions(),
    content: normalizeDocumentContent(document.content),
    editorProps: {
      attributes: {
        class:
          "min-h-[450px] outline-none prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans text-base [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:text-slate-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      },
    },
    onUpdate({ editor: currentEditor }) {
      const nextContent = JSON.stringify(currentEditor.getJSON());
      setHasContentChanges(nextContent !== lastSavedRef.current.content);
      setSaveState("idle");
    },
  });

  const hasTitleChanges = title.trim() !== lastSavedRef.current.title;
  const hasChanges = isEditable && ((hasTitleChanges && document.permission === "owner") || hasContentChanges);

  useAutosave({
    enabled: hasChanges,
    onSave: async () => {
      if (!editor || saveInFlightRef.current) {
        return;
      }

      const content = normalizeDocumentContent(editor.getJSON());
      const nextContentString = JSON.stringify(content);
      const nextTitle = title.trim();
      const payload: { title?: string; content?: typeof content } = {};

      if (hasTitleChanges && document.permission === "owner") {
        payload.title = nextTitle;
      }

      if (nextContentString !== lastSavedRef.current.content) {
        payload.content = content;
      }

      if (!Object.keys(payload).length) {
        return;
      }

      saveInFlightRef.current = true;
      setSaveState("saving");

      try {
        const response = await DocumentClientService.updateDocument(document.id, payload);
        lastSavedRef.current = {
          title: response.document.title,
          content: JSON.stringify(response.document.content),
        };
        setTitle(response.document.title);
        setHasContentChanges(false);
        setLastSavedAt(response.document.updatedAt);
        setSaveState("saved");
      } catch (error) {
        setSaveState("error");
        const message = error instanceof Error ? error.message : "Auto-save failed";
        toast(message, "error");
      } finally {
        saveInFlightRef.current = false;
      }
    },
  });

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveState("idle");
  };

  const getMetrics = () => {
    if (!editor) return { characters: 0, words: 0, readingTime: 0 };
    const text = editor.getText() || "";
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200);
    return { characters, words, readingTime };
  };

  const { characters, words, readingTime } = getMetrics();

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <EditorHeader
        document={document}
        title={title}
        setTitle={setTitle}
        saveState={saveState}
        lastSavedAt={lastSavedAt}
        onTitleChange={onTitleChange}
      />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="border-2 border-slate-900 rounded-2xl bg-white p-8 md:p-12 shadow-panel space-y-8">
          
          {/* Editor Title Block (Notion-style) */}
          <div className="space-y-3 pb-6 border-b-2 border-slate-100">
            {document.permission === "owner" ? (
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                maxLength={100}
                placeholder="Untitled Document"
                className="w-full text-4xl font-black tracking-tight text-slate-900 border-none outline-none focus:ring-0 p-0 font-sans placeholder:text-slate-200 bg-transparent"
              />
            ) : (
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                {title || "Untitled Document"}
              </h1>
            )}
            
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                Owner: <span className="text-slate-600 font-extrabold">{document.ownerEmail}</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-350 text-slate-600 font-extrabold tracking-wider text-[9px]">{document.permission} Access</span>
            </div>
          </div>

          {/* Floating/Sticky Editor Formatting Toolbar */}
          {isEditable && (
            <div className="sticky top-20 z-10 w-full py-2 bg-gradient-to-b from-white via-white to-white/0">
              <EditorToolbar editor={editor} />
            </div>
          )}

          {/* TipTap Rich Text Editor Container */}
          <div className="flex-grow prose-editor shadow-none border-none p-0 bg-transparent mt-4">
            <EditorContent editor={editor} />
          </div>

          {/* Document Stats & Sync Info Footer */}
          <div className="border-t-2 border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-450" />
                {words} words
              </span>
              <span>•</span>
              <span>{characters} characters</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-450" />
                {readingTime} min read
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-sans">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" />
              <span>Autosaving enabled</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
