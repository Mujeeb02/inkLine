import { UploadService } from "./upload.service";
import { uploadSchema } from "./upload.validation";
import { AppError } from "@/modules/shared/errors";

export class UploadController {
  static async upload(userId: string, formData: FormData) {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("Invalid file", 400);
    }

    const parsed = uploadSchema.safeParse({
      name: file.name,
      size: file.size,
    });

    if (!parsed.success) {
      throw new AppError("Upload failed", 400);
    }

    const document = await UploadService.uploadFile(userId, file);
    return { success: true, document };
  }
}
