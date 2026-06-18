"use client";

import React from "react";
import { DocumentCard } from "./DocumentCard";

type DocumentGridProps = {
  documents: {
    id: string;
    title: string;
    updatedAt: string;
    ownerEmail?: string;
    snippet?: string;
  }[];
  isShared?: boolean;
};

export function DocumentGrid({ documents, isShared = false }: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} isShared={isShared} />
      ))}
    </div>
  );
}
