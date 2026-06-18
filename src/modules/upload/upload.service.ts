import { DocumentService } from "@/modules/document/document.service";
import { AppError } from "@/modules/shared/errors";
import {
  markdownToDocumentContent,
  textToDocumentContent,
  titleFromFilename,
} from "@/modules/shared/utils";

const ALLOWED_EXTENSIONS = new Set(["txt", "md"]);

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export class UploadService {
  static async uploadFile(userId: string, file: File) {
    const extension = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new AppError("Invalid file", 400);
    }

    const text = await file.text();
    const content =
      extension === "md" ? markdownToDocumentContent(text) : textToDocumentContent(text);

    const document = await DocumentService.createDocument({
      ownerId: userId,
      title: titleFromFilename(file.name),
      content,
    });

    return document;
  }
}
