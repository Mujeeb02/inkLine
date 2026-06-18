"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/components/providers/ToastProvider";
import { UploadsClientService } from "@/features/uploads/services/uploads";
import { Upload, File } from "lucide-react";

type UploadModalProps = {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UploadModal({ trigger, isOpen: controlledOpen, onOpenChange: controlledOnOpenChange }: UploadModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    startTransition(async () => {
      try {
        const result = await UploadsClientService.uploadFile(selectedFile);
        toast(`Successfully imported "${selectedFile.name}"`, "success");
        setIsOpen(false);
        router.push(`/documents/${result.document.id}`);
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload file";
        toast(message, "error");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isPending) {
        setIsOpen(open);
        if (!open) setSelectedFile(null);
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import your markdown (`.md`) or plain text (`.txt`) file. Files must be under 5 MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpload} className="mt-4 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.txt,text/markdown,text/plain"
            className="hidden"
          />

          <div
            onClick={() => !isPending && fileInputRef.current?.click()}
            className={`border border-dashed border-[#e2e8f0] rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-all ${
              selectedFile ? "bg-slate-50/50 border-slate-400" : ""
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <File className="h-10 w-10 text-slate-700 animate-pulse" />
                <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">Click to browse files</p>
                <p className="text-xs text-slate-400">Markdown or Text formats supported</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedFile}>
              {isPending ? "Importing..." : "Import File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
