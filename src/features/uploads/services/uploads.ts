import { parseResponse } from "@/features/documents/services/documents";

export class UploadsClientService {
  static async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    return parseResponse(res);
  }
}
