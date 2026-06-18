import { DocumentService } from "@/modules/document/document.service";
import { DocumentRepository } from "@/modules/document/document.repository";
import { UserService } from "@/modules/user/user.service";
import { AppError } from "@/modules/shared/errors";

export class ShareService {
  static async shareDocument(
    documentId: string,
    userId: string,
    targetEmail: string,
    role: "viewer" | "commenter" | "editor" = "editor"
  ) {
    const { document, permission } = await DocumentService.resolvePermission(documentId, userId);

    if (permission !== "owner") {
      throw new AppError("Access denied", 403);
    }

    const targetUser = await UserService.getUserByEmail(targetEmail.trim().toLowerCase());

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    if (targetUser._id.toString() === document.ownerId.toString()) {
      throw new AppError("Owner cannot share a document with themselves", 400);
    }

    if (document.sharedWith.some((entry) => entry.userId.toString() === targetUser._id.toString())) {
      throw new AppError("Already shared", 409);
    }

    await DocumentRepository.shareWithUser(document._id, targetUser._id, role);

    return {
      documentId: document._id.toString(),
      sharedWith: targetUser.email,
      role,
    };
  }

  static async updateRole(
    documentId: string,
    ownerId: string,
    targetUserId: string,
    role: "viewer" | "commenter" | "editor"
  ) {
    const { document, permission } = await DocumentService.resolvePermission(documentId, ownerId);

    if (permission !== "owner") {
      throw new AppError("Access denied", 403);
    }

    const targetUser = await UserService.getUserById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const shareExists = document.sharedWith.some(
      (entry) => entry.userId.toString() === targetUser._id.toString()
    );
    if (!shareExists) {
      throw new AppError("Document is not shared with this user", 404);
    }

    await DocumentRepository.updateShareRole(document._id, targetUser._id, role);

    return {
      documentId,
      targetUserId,
      role,
    };
  }

  static async removeShare(documentId: string, ownerId: string, targetUserId: string) {
    const { document, permission } = await DocumentService.resolvePermission(documentId, ownerId);

    if (permission !== "owner") {
      throw new AppError("Access denied", 403);
    }

    const targetUser = await UserService.getUserById(targetUserId);
    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    const shareExists = document.sharedWith.some(
      (entry) => entry.userId.toString() === targetUser._id.toString()
    );
    if (!shareExists) {
      throw new AppError("Document is not shared with this user", 404);
    }

    await DocumentRepository.removeShare(document._id, targetUser._id);

    return {
      documentId,
      targetUserId,
    };
  }
}
