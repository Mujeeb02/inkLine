import type { JSONContent } from "@tiptap/react";

export type ShareRole = "viewer" | "commenter" | "editor";

export type SharedEntry = {
  userId: string;
  email: string;
  role: ShareRole;
};

export type DocumentPermission = "owner" | ShareRole;

export type DashboardDocument = {
  id: string;
  title: string;
  updatedAt: string;
  ownerEmail?: string;
  snippet?: string;
};

export type DashboardDocumentsPayload = {
  ownedDocuments: DashboardDocument[];
  sharedDocuments: DashboardDocument[];
};

export type EditorDocument = {
  id: string;
  title: string;
  content: JSONContent;
  ownerId: string;
  ownerEmail: string;
  sharedWith: SharedEntry[];
  updatedAt: string;
  permission: DocumentPermission;
};
