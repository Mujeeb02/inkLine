import { Types } from "mongoose";
import type { JSONContent } from "@tiptap/react";
import { DocumentModel, type DocumentType, type MongooseSharedEntry } from "./document.model";

export class DocumentRepository {
  static async findById(id: string | Types.ObjectId) {
    return DocumentModel.findById(id).lean<DocumentType | null>().exec();
  }

  static async create(data: {
    title: string;
    content: JSONContent;
    ownerId: Types.ObjectId;
    sharedWith: MongooseSharedEntry[];
  }) {
    return DocumentModel.create(data);
  }

  static async findByOwnerId(ownerId: string | Types.ObjectId) {
    const objectId = typeof ownerId === "string" ? new Types.ObjectId(ownerId) : ownerId;
    return DocumentModel.find({ ownerId: objectId })
      .sort({ updatedAt: -1 })
      .lean<DocumentType[]>()
      .exec();
  }

  static async findBySharedWith(sharedWithId: string | Types.ObjectId) {
    const objectId = typeof sharedWithId === "string" ? new Types.ObjectId(sharedWithId) : sharedWithId;
    return DocumentModel.find({ "sharedWith.userId": objectId })
      .sort({ updatedAt: -1 })
      .lean<DocumentType[]>()
      .exec();
  }

  static async updateById(
    id: string | Types.ObjectId,
    data: Partial<Pick<DocumentType, "title" | "content">>
  ) {
    return DocumentModel.findByIdAndUpdate(id, data, { new: true })
      .lean<DocumentType | null>()
      .exec();
  }

  static async deleteById(id: string | Types.ObjectId) {
    return DocumentModel.findByIdAndDelete(id).exec();
  }

  static async shareWithUser(
    documentId: string | Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: "viewer" | "commenter" | "editor" = "editor"
  ) {
    await DocumentModel.findByIdAndUpdate(documentId, {
      $pull: { sharedWith: { userId: targetUserId } },
    }).exec();
    return DocumentModel.findByIdAndUpdate(
      documentId,
      { $push: { sharedWith: { userId: targetUserId, role } } },
      { new: true }
    ).exec();
  }

  static async updateShareRole(
    documentId: string | Types.ObjectId,
    targetUserId: Types.ObjectId,
    role: "viewer" | "commenter" | "editor"
  ) {
    return DocumentModel.findOneAndUpdate(
      { _id: documentId, "sharedWith.userId": targetUserId },
      { $set: { "sharedWith.$.role": role } },
      { new: true }
    ).exec();
  }

  static async removeShare(
    documentId: string | Types.ObjectId,
    targetUserId: Types.ObjectId
  ) {
    return DocumentModel.findByIdAndUpdate(
      documentId,
      { $pull: { sharedWith: { userId: targetUserId } } },
      { new: true }
    ).exec();
  }
}
