import { ShareService } from "./share.service";
import { shareDocumentSchema, updateShareRoleSchema, removeShareSchema } from "./share.validation";
import { AppError } from "@/modules/shared/errors";

export class ShareController {
  static async share(userId: string, body: unknown) {
    const parsed = shareDocumentSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid share request", 400);
    }

    const result = await ShareService.shareDocument(
      parsed.data.documentId,
      userId,
      parsed.data.email,
      parsed.data.role
    );

    return { success: true, share: result };
  }

  static async updateRole(userId: string, body: unknown) {
    const parsed = updateShareRoleSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid update share role request", 400);
    }

    const result = await ShareService.updateRole(
      parsed.data.documentId,
      userId,
      parsed.data.userId,
      parsed.data.role
    );

    return { success: true, share: result };
  }

  static async remove(userId: string, body: unknown) {
    const parsed = removeShareSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid remove share request", 400);
    }

    const result = await ShareService.removeShare(
      parsed.data.documentId,
      userId,
      parsed.data.userId
    );

    return { success: true, share: result };
  }
}
