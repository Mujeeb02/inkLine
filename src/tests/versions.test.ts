import { Types } from "mongoose";
import { describe, it, expect } from "vitest";
import { DocumentService } from "@/modules/document/document.service";
import { VersionService } from "@/modules/version/version.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";
import { AppError } from "@/modules/shared/errors";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();
  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("Document Version History", () => {
  it("snapshots documents on update, throttles saves, lists history, and restores correctly", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");

    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();

    // 1. Create document
    const doc = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Initial Title",
    });

    // 2. Perform first update (should trigger snapshot 1 since none exist)
    const update1 = await DocumentService.updateDocument(doc.id, alice!._id.toString(), {
      content: { type: "doc", content: [{ type: "paragraph", text: "First content" }] } as any,
    });

    // Verify version 1 is created
    let versions = await VersionService.listVersions(doc.id, alice!._id.toString());
    expect(versions).toHaveLength(1);
    expect(versions[0].version).toBe(1);
    expect(versions[0].title).toBe("Initial Title"); // Snapshot of old state before updates are applied is great, or current state. In our service code, updateDocument runs updateById first, then maybeSnapshot, so it snapshots the NEW state ("Initial Title" was saved in createDocument, but updateDocument updates title to "Initial Title" and content to "First content", then snapshots "Initial Title" with "First content"). Wait, let's verify what values we have:
    expect(versions[0].title).toBe("Initial Title");
    expect(versions[0].content).toMatchObject({
      content: [{ type: "paragraph", text: "First content" }],
    });

    // 3. Perform second update immediately (should NOT trigger new snapshot due to 5-minute throttle)
    await DocumentService.updateDocument(doc.id, alice!._id.toString(), {
      content: { type: "doc", content: [{ type: "paragraph", text: "Second content" }] } as any,
    });

    versions = await VersionService.listVersions(doc.id, alice!._id.toString());
    expect(versions).toHaveLength(1); // Still only version 1

    // 4. Simulate time passing by 5 mins 1 sec
    const originalDateNow = Date.now;
    try {
      Date.now = () => originalDateNow() + 301000;

      // Alice updates again -> should trigger version 2
      await DocumentService.updateDocument(doc.id, alice!._id.toString(), {
        content: { type: "doc", content: [{ type: "paragraph", text: "Third content" }] } as any,
      });

      versions = await VersionService.listVersions(doc.id, alice!._id.toString());
      expect(versions).toHaveLength(2);
      expect(versions[0].version).toBe(2);
      expect(versions[0].content).toMatchObject({
        content: [{ type: "paragraph", text: "Third content" }],
      });
    } finally {
      Date.now = originalDateNow;
    }

    // 5. Restore version 1
    const v1 = versions.find((v) => v.version === 1);
    expect(v1).not.toBeUndefined();

    // Bob tries to restore but doesn't have edit access (not shared yet) -> throws 403
    await expect(
      VersionService.restoreVersion(v1!.id, bob!._id.toString())
    ).rejects.toThrow();

    // Share with Bob as Viewer -> still blocked
    const { DocumentRepository } = await import("@/modules/document/document.repository");
    await DocumentRepository.shareWithUser(doc.id, bob!._id, "viewer");
    await expect(
      VersionService.restoreVersion(v1!.id, bob!._id.toString())
    ).rejects.toThrow();

    // Alice restores version 1
    const restored = await VersionService.restoreVersion(v1!.id, alice!._id.toString());
    expect(restored.content).toMatchObject({
      content: [{ type: "paragraph", text: "First content" }],
    });

    // The current doc content should be restored
    const currentDoc = await DocumentService.getDocumentForUser(doc.id, alice!._id.toString());
    expect(currentDoc.content).toMatchObject({
      content: [{ type: "paragraph", text: "First content" }],
    });
  });
});
