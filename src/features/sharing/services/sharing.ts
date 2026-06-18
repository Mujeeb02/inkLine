import { parseResponse } from "@/features/documents/services/documents";

export class SharingClientService {
  static async shareDocument(documentId: string, email: string, role: string = "editor") {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId, email, role }),
    });
    return parseResponse(res);
  }

  static async updateShareRole(documentId: string, userId: string, role: string) {
    const res = await fetch("/api/share", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId, userId, role }),
    });
    return parseResponse(res);
  }

  static async removeShare(documentId: string, userId: string) {
    const res = await fetch("/api/share", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId, userId }),
    });
    return parseResponse(res);
  }
}
