import { Types } from "mongoose";
import type { JSONContent } from "@tiptap/react";
import { DocumentRepository } from "./document.repository";
import { UserService } from "@/modules/user/user.service";
import { AppError } from "@/modules/shared/errors";
import { EMPTY_DOCUMENT_CONTENT } from "@/modules/shared/constants";
import { dbConnect } from "@/modules/shared/database/db";
import type {
  DashboardDocument,
  DashboardDocumentsPayload,
  EditorDocument,
} from "./document.types";

function toObjectId(id: string, entity = "Document") {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`${entity} not found`, 404);
  }
  return new Types.ObjectId(id);
}

interface MongooseDocumentFields {
  _id: Types.ObjectId;
  title: string;
  updatedAt: Date;
  content: JSONContent;
}

// Extract plain text snippet from Tiptap JSON content
export function extractTextSnippet(content: JSONContent | null | undefined, limit = 80): string {
  if (!content) return "";
  let text = "";
  
  function traverse(node: JSONContent) {
    if (text.length >= limit) return;
    if (node.type === "text" && typeof node.text === "string") {
      text += node.text + " ";
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  traverse(content);
  const result = text.trim();
  if (!result) return "Empty document";
  return result.slice(0, limit) + (result.length > limit ? "..." : "");
}

function mapDashboardDocument(document: MongooseDocumentFields): DashboardDocument {
  const rawDate = document.updatedAt || (document as any).createdAt || new Date();
  const dateStr = rawDate instanceof Date ? rawDate.toISOString() : new Date(rawDate).toISOString();
  return {
    id: document._id.toString(),
    title: document.title,
    updatedAt: dateStr,
    snippet: extractTextSnippet(document.content),
  };
}

export class DocumentService {
  static async resolvePermission(documentId: string, userId: string) {
    await dbConnect();
    const docId = toObjectId(documentId);
    const document = await DocumentRepository.findById(docId);

    if (!document) {
      throw new AppError("Document not found", 404);
    }

    const normalizedUserId = userId.toString();

    if (document.ownerId.toString() === normalizedUserId) {
      return { document, permission: "owner" as const };
    }

    const share = document.sharedWith.find(
      (entry) => entry.userId.toString() === normalizedUserId
    );
    if (share) {
      return { document, permission: share.role };
    }

    throw new AppError("Access denied", 403);
  }

  static async createDocument(input: {
    ownerId: string;
    title?: string;
    content?: JSONContent;
  }) {
    await dbConnect();
    const document = await DocumentRepository.create({
      title: input.title?.trim() || "Untitled Document",
      content: input.content ?? EMPTY_DOCUMENT_CONTENT,
      ownerId: new Types.ObjectId(input.ownerId),
      sharedWith: [],
    });

    return {
      id: document._id.toString(),
      title: document.title,
      content: document.content,
      ownerId: document.ownerId.toString(),
      updatedAt: document.updatedAt ? document.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  static async listDocumentsForUser(userId: string): Promise<DashboardDocumentsPayload> {
    await dbConnect();
    const objectId = new Types.ObjectId(userId);
    
    const [ownedDocuments, sharedDocuments] = await Promise.all([
      DocumentRepository.findByOwnerId(objectId),
      DocumentRepository.findBySharedWith(objectId),
    ]);

    const ownerEmails = await UserService.getUserEmailByIdMap(
      sharedDocuments.map((doc) => doc.ownerId)
    );

    return {
      ownedDocuments: ownedDocuments.map((doc) => mapDashboardDocument(doc as unknown as MongooseDocumentFields)),
      sharedDocuments: sharedDocuments.map((doc) => ({
        ...mapDashboardDocument(doc as unknown as MongooseDocumentFields),
        ownerEmail: ownerEmails.get(doc.ownerId.toString()) ?? "Unknown owner",
      })),
    };
  }

  static async getDocumentForUser(documentId: string, userId: string): Promise<EditorDocument> {
    const { document, permission } = await this.resolvePermission(documentId, userId);
    const owner = await UserService.getUserById(document.ownerId.toString());

    const sharedUserIds = document.sharedWith.map((entry) => entry.userId);
    const emailMap = await UserService.getUserEmailByIdMap(sharedUserIds);

    const rawDate = document.updatedAt || (document as any).createdAt || new Date();
    const dateStr = rawDate instanceof Date ? rawDate.toISOString() : new Date(rawDate).toISOString();

    return {
      id: document._id.toString(),
      title: document.title,
      content: document.content,
      ownerId: document.ownerId.toString(),
      ownerEmail: owner?.email ?? "Unknown owner",
      sharedWith: document.sharedWith.map((entry) => ({
        userId: entry.userId.toString(),
        email: emailMap.get(entry.userId.toString()) ?? "Unknown user",
        role: entry.role,
      })),
      updatedAt: dateStr,
      permission,
    };
  }

  static async updateDocument(
    documentId: string,
    userId: string,
    updates: { title?: string; content?: JSONContent }
  ) {
    const { document, permission } = await this.resolvePermission(documentId, userId);

    if (updates.title !== undefined && permission !== "owner") {
      throw new AppError("Only the owner can rename this document", 403);
    }

    if (updates.content !== undefined && permission !== "owner" && permission !== "editor") {
      throw new AppError("You do not have permission to edit this document", 403);
    }

    const nextTitle = updates.title?.trim();

    if (!nextTitle && updates.title !== undefined) {
      throw new AppError("Title must be at least 1 character", 400);
    }

    const nextTitleVal = nextTitle ?? document.title;
    const nextContentVal = updates.content ?? document.content;

    const updatedDocument = await DocumentRepository.updateById(document._id, {
      title: nextTitleVal,
      content: nextContentVal,
    });

    if (!updatedDocument) {
      throw new AppError("Document not found", 404);
    }

    const user = await UserService.getUserById(userId);
    if (user) {
      const { VersionService } = await import("@/modules/version/version.service");
      await VersionService.maybeSnapshot(
        updatedDocument._id.toString(),
        userId,
        user.email,
        updatedDocument.title,
        updatedDocument.content
      );
    }

    return {
      id: updatedDocument._id.toString(),
      title: updatedDocument.title,
      content: updatedDocument.content,
      updatedAt: updatedDocument.updatedAt ? updatedDocument.updatedAt.toISOString() : new Date().toISOString(),
      permission,
    };
  }

  static async deleteDocument(documentId: string, userId: string) {
    const { document, permission } = await this.resolvePermission(documentId, userId);

    if (permission !== "owner") {
      throw new AppError("Access denied", 403);
    }

    await DocumentRepository.deleteById(document._id);
  }

  static async canEditDocument(documentId: string, userId: string) {
    const { permission } = await this.resolvePermission(documentId, userId);
    return permission === "owner" || permission === "editor";
  }
}
