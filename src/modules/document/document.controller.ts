import { DocumentService } from "./document.service";
import { documentCreateSchema, documentUpdateSchema } from "./document.validation";
import { AppError } from "@/modules/shared/errors";

export class DocumentController {
  static async list(userId: string) {
    const payload = await DocumentService.listDocumentsForUser(userId);
    return { success: true, ...payload };
  }

  static async create(userId: string, body: unknown) {
    const bodyObj = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
    const parsed = documentCreateSchema.safeParse({
      title: bodyObj.title || "Untitled Document",
    });

    if (!parsed.success) {
      throw new AppError("Title must be between 1 and 100 characters", 400);
    }

    const document = await DocumentService.createDocument({
      ownerId: userId,
      title: parsed.data.title,
    });

    return { success: true, document };
  }

  static async get(documentId: string, userId: string) {
    const document = await DocumentService.getDocumentForUser(documentId, userId);
    return { success: true, document };
  }

  static async update(documentId: string, userId: string, body: unknown) {
    const parsed = documentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid document payload", 400);
    }

    const document = await DocumentService.updateDocument(documentId, userId, parsed.data);
    return { success: true, document };
  }

  static async delete(documentId: string, userId: string) {
    await DocumentService.deleteDocument(documentId, userId);
    return { success: true, deleted: true };
  }
}
