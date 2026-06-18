import { Types } from "mongoose";
import { vi } from "vitest";

vi.mock("@/modules/shared/middleware/auth", () => ({
  getCurrentUser: vi.fn(),
}));

import { POST } from "@/app/api/upload/route";
import { DocumentService } from "@/modules/document/document.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";
import { getCurrentUser } from "@/modules/shared/middleware/auth";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();

  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("upload validation", () => {
  it("accepts markdown uploads, creates a document, and preserves formatting structure", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    vi.mocked(getCurrentUser).mockResolvedValue({
      _id: alice!._id.toString(),
      email: alice!.email,
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["# Heading\n\n- Item one\n- Item two"], "meeting-notes.md", {
        type: "text/markdown",
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.document.title).toBe("meeting-notes");

    const stored = await DocumentService.getDocumentForUser(body.document.id, alice!._id.toString());
    const content = stored.content.content ?? [];

    expect(content[0]?.type).toBe("heading");
    expect(content[1]?.type).toBe("bulletList");
  });

  it("rejects unsupported file types", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    vi.mocked(getCurrentUser).mockResolvedValue({
      _id: alice!._id.toString(),
      email: alice!.email,
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File(["%PDF"], "proposal.pdf", {
        type: "application/pdf",
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: "Invalid file",
    });
  });

  it("rejects files larger than 5 MB", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    vi.mocked(getCurrentUser).mockResolvedValue({
      _id: alice!._id.toString(),
      email: alice!.email,
    });

    const tooLarge = new Uint8Array(5 * 1024 * 1024 + 1);
    const formData = new FormData();
    formData.append(
      "file",
      new File([tooLarge], "oversized.txt", {
        type: "text/plain",
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({
      success: false,
      error: "Upload failed",
    });
  });
});
