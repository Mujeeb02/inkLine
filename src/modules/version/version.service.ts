import { Types } from "mongoose";
import { dbConnect } from "@/modules/shared/database/db";
import { VersionModel } from "./version.model";
import { DocumentService } from "@/modules/document/document.service";
import { UserModel } from "@/modules/user/user.model";
import { DocumentModel } from "@/modules/document/document.model";
import { AppError } from "@/modules/shared/errors";
import type { JSONContent } from "@tiptap/react";

export class VersionService {
  static async maybeSnapshot(
    documentId: string,
    userId: string,
    email: string,
    title: string,
    content: JSONContent
  ) {
    await dbConnect();

    const docId = new Types.ObjectId(documentId);
    const uId = new Types.ObjectId(userId);

    // Throttle check: one version per 5 minutes per user per document
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentSnapshot = await VersionModel.findOne({
      documentId: docId,
      savedBy: uId,
      createdAt: { $gt: fiveMinutesAgo },
    })
      .sort({ createdAt: -1 })
      .exec();

    if (recentSnapshot) {
      return null;
    }

    // Auto-increment version number
    const lastVersion = await VersionModel.findOne({ documentId: docId })
      .sort({ version: -1 })
      .exec();
    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    const snapshot = await VersionModel.create({
      documentId: docId,
      savedBy: uId,
      savedByEmail: email,
      title,
      content,
      version: nextVersion,
    });

    return snapshot;
  }

  static async listVersions(documentId: string, userId: string) {
    await dbConnect();

    await DocumentService.resolvePermission(documentId, userId);

    const versions = await VersionModel.find({
      documentId: new Types.ObjectId(documentId),
    })
      .sort({ version: -1 })
      .lean()
      .exec();

    return versions.map((v) => ({
      id: v._id.toString(),
      documentId: v.documentId.toString(),
      savedBy: v.savedBy.toString(),
      savedByEmail: v.savedByEmail,
      title: v.title,
      content: v.content,
      version: v.version,
      createdAt: v.createdAt.toISOString(),
    }));
  }

  static async getVersion(versionId: string, userId: string) {
    await dbConnect();

    const version = await VersionModel.findById(versionId);
    if (!version) {
      throw new AppError("Version not found", 404);
    }

    await DocumentService.resolvePermission(version.documentId.toString(), userId);

    return {
      id: version._id.toString(),
      documentId: version.documentId.toString(),
      savedBy: version.savedBy.toString(),
      savedByEmail: version.savedByEmail,
      title: version.title,
      content: version.content,
      version: version.version,
      createdAt: version.createdAt.toISOString(),
    };
  }

  static async restoreVersion(versionId: string, userId: string) {
    await dbConnect();

    const version = await VersionModel.findById(versionId);
    if (!version) {
      throw new AppError("Version not found", 404);
    }

    const { document, permission } = await DocumentService.resolvePermission(
      version.documentId.toString(),
      userId
    );

    if (permission !== "owner" && permission !== "editor") {
      throw new AppError("You do not have permission to edit this document", 403);
    }

    // Create a snapshot of current document state before restoring, so work is not lost
    const owner = await UserModel.findById(document.ownerId);
    if (owner) {
      await this.maybeSnapshot(
        document._id.toString(),
        document.ownerId.toString(),
        owner.email,
        document.title,
        document.content
      );
    }

    // Restore version content
    await DocumentModel.findByIdAndUpdate(document._id, {
      title: version.title,
      content: version.content,
    }).exec();

    const updatedDoc = await DocumentModel.findById(document._id).lean().exec();
    if (!updatedDoc) {
      throw new AppError("Document not found", 404);
    }

    return {
      id: updatedDoc._id.toString(),
      title: updatedDoc.title,
      content: updatedDoc.content,
      updatedAt: updatedDoc.updatedAt.toISOString(),
    };
  }
}
