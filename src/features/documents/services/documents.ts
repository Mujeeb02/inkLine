import type { JSONContent } from "@tiptap/react";

export async function parseResponse(response: Response) {
  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

export class DocumentClientService {
  static async createDocument(title = "Untitled Document") {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });
    return parseResponse(res);
  }

  static async updateDocument(id: string, payload: { title?: string; content?: JSONContent }) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return parseResponse(res);
  }

  static async deleteDocument(id: string) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    });
    return parseResponse(res);
  }
}
