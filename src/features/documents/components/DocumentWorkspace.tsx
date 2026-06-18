"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, Search, Clock, Users, FileText, Sparkles } from "lucide-react";
import { WorkspaceLayout } from "@/shared/components/layout/WorkspaceLayout";
import { DocumentGrid } from "./DocumentGrid";
import { EmptyDocumentsState } from "./EmptyDocumentsState";
import { UploadModal } from "@/features/uploads/components/UploadModal";
import { CommandSearch } from "@/shared/components/modals/CommandSearch";
import { DocumentClientService } from "@/features/documents/services/documents";
import { useToast } from "@/shared/components/providers/ToastProvider";

import type { DashboardDocument } from "@/modules/document/document.types";

type DocumentWorkspaceProps = {
  currentUserEmail: string;
  documents: {
    ownedDocuments: DashboardDocument[];
    sharedDocuments: DashboardDocument[];
  };
};

export function DocumentWorkspace({ currentUserEmail, documents }: DocumentWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateDocument = () => {
    startTransition(async () => {
      try {
        const payload = await DocumentClientService.createDocument();
        toast("Document created successfully", "success");
        router.push(`/documents/${payload.document.id}`);
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create document";
        toast(message, "error");
      }
    });
  };

  const allDocs = [...documents.ownedDocuments, ...documents.sharedDocuments];

  return (
    <WorkspaceLayout
      currentUserEmail={currentUserEmail}
      onSearchClick={() => setIsSearchOpen(true)}
      onCreateDoc={handleCreateDocument}
      onUploadClick={() => setIsUploadOpen(true)}
    >
      <div className="flex-grow px-6 py-8 md:px-10 md:py-12 max-w-5xl mx-auto w-full space-y-10">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black font-sans text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs font-bold text-slate-500">
              Welcome back, <span className="font-extrabold text-slate-700">{currentUserEmail}</span>. Draft and share collaborative documents.
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 flex items-center gap-3 shadow-card select-none">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e05a47] text-white border-2 border-slate-900 shadow-sm flex-shrink-0">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Owned</p>
                <p className="text-sm font-black text-slate-900 mt-1 leading-none">{documents.ownedDocuments.length}</p>
              </div>
            </div>

            <div className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 flex items-center gap-3 shadow-card select-none">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffc300] text-slate-900 border-2 border-slate-900 shadow-sm flex-shrink-0">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Shared</p>
                <p className="text-sm font-black text-slate-900 mt-1 leading-none">{documents.sharedDocuments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-2 border-slate-900 rounded-xl p-4 bg-[#fbfaf8]/40 shadow-panel">
          <button
            onClick={handleCreateDocument}
            disabled={isPending}
            className="flex items-center gap-3 rounded-xl border-2 border-slate-900 bg-white p-3 text-left hover:bg-slate-50 hover:shadow-btn active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200 disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc300] border-2 border-slate-900 text-slate-900 shadow-sm flex-shrink-0">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">New Document</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Start from blank canvas</p>
            </div>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-3 rounded-xl border-2 border-slate-900 bg-white p-3 text-left hover:bg-slate-50 hover:shadow-btn active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e05a47] border-2 border-slate-900 text-white shadow-sm flex-shrink-0">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">Import File</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Load Markdown or Text</p>
            </div>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 rounded-xl border-2 border-slate-900 bg-white p-3 text-left hover:bg-slate-50 hover:shadow-btn active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-200"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 border-2 border-slate-900 text-slate-800 shadow-sm flex-shrink-0">
              <Search className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-900">Find Document</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Quick search workspace</p>
            </div>
          </button>
        </div>

        {/* Recent / Owned Documents */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            Owned Documents
          </h2>
          {documents.ownedDocuments.length > 0 ? (
            <DocumentGrid documents={documents.ownedDocuments} />
          ) : (
            <EmptyDocumentsState
              title="No documents owned"
              description="Create a new document to start drafting content."
              actionLabel="Create Document"
              onAction={handleCreateDocument}
            />
          )}
        </div>

        {/* Shared with Me */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Shared with me
          </h2>
          {documents.sharedDocuments.length > 0 ? (
            <DocumentGrid documents={documents.sharedDocuments} isShared />
          ) : (
            <EmptyDocumentsState
              title="No shared documents"
              description="Documents shared with you by other collaborators will appear here."
            />
          )}
        </div>
      </div>

      {/* Upload trigger overlay */}
      <UploadModal isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} />

      {/* Global Cmd+K Search modal */}
      <CommandSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={allDocs}
      />
    </WorkspaceLayout>
  );
}
