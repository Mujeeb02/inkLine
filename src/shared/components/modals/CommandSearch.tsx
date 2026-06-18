"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, X } from "lucide-react";

type CommandSearchProps = {
  isOpen: boolean;
  onClose: () => void;
  documents: {
    id: string;
    title: string;
    updatedAt: string;
    ownerEmail?: string;
    snippet?: string;
  }[];
};

export function CommandSearch({ isOpen, onClose, documents }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-[#090d16]/30 backdrop-blur-md transition-all duration-300">
      <div
        ref={containerRef}
        className="w-full max-w-lg rounded-xl border border-[#e2e8f0] bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col max-h-[26rem] animate-slide-up mx-4"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f5f9]">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documents by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow text-sm outline-none text-slate-800 placeholder-slate-400 font-sans"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                Documents
              </p>
              {filtered.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    router.push(`/documents/${doc.id}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition text-slate-700 hover:text-slate-900 group"
                >
                  <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  <span className="text-sm font-semibold truncate flex-grow">
                    {doc.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching documents found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
