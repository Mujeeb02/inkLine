"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileDown, Printer } from "lucide-react";
import { tiptapJsonToMarkdown, downloadFile } from "../utils/export";

type ExportMenuProps = {
  documentTitle: string;
  documentContent: any;
};

export function ExportMenu({ documentTitle, documentContent }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportMarkdown = () => {
    const md = tiptapJsonToMarkdown(documentContent);
    const filename = `${documentTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || "untitled"}.md`;
    downloadFile(filename, md, "text/markdown;charset=utf-8");
    setIsOpen(false);
  };

  const handlePrintPDF = () => {
    document.body.classList.add("inkline-print");
    // Trigger print dialog
    window.print();
    // Stagger class removal to allow print dialog to initialize
    setTimeout(() => {
      document.body.classList.remove("inkline-print");
    }, 1000);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-2 px-3 border-2 border-slate-900 bg-white text-slate-800 rounded-lg font-bold text-xs shadow-btn hover:bg-slate-50 hover:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all select-none"
      >
        <Download className="h-4.5 w-4.5" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-slate-900 rounded-xl shadow-panel z-50 overflow-hidden animate-fade-in">
          <div className="p-1.5 space-y-1">
            <button
              onClick={handleExportMarkdown}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
            >
              <FileDown className="h-4 w-4 text-slate-500" />
              Export as Markdown
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
