"use client";

import React from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function ToolbarButton({
  active = false,
  disabled = false,
  icon,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border-2 border-transparent transition-all duration-200 ${
        active
          ? "bg-[#ffc300] text-slate-900 border-slate-900 shadow-sm"
          : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-950"
      } disabled:cursor-not-allowed disabled:opacity-30`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

type EditorToolbarProps = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border-2 border-slate-900 bg-white shadow-btn max-w-max mx-auto select-none">
      <ToolbarButton
        active={editor.isActive("bold")}
        icon={<Bold className="h-4 w-4" />}
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        active={editor.isActive("italic")}
        icon={<Italic className="h-4 w-4" />}
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        active={editor.isActive("underline")}
        icon={<Underline className="h-4 w-4" />}
        label="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      
      <div className="h-5 w-[2px] bg-slate-900 mx-1" />

      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        icon={<Heading1 className="h-4 w-4" />}
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />

      <div className="h-5 w-[2px] bg-slate-900 mx-1" />

      <ToolbarButton
        active={editor.isActive("bulletList")}
        icon={<List className="h-4 w-4" />}
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        active={editor.isActive("orderedList")}
        icon={<ListOrdered className="h-4 w-4" />}
        label="Ordered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />

      <div className="h-5 w-[2px] bg-slate-900 mx-1" />

      <ToolbarButton
        icon={<Undo2 className="h-4 w-4" />}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        icon={<Redo2 className="h-4 w-4" />}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
