import mongoose, { Types } from "mongoose";
import { describe, it, expect } from "vitest";
import { AppError } from "@/modules/shared/errors";
import { DocumentService } from "@/modules/document/document.service";
import { ShareService } from "@/modules/share/share.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";
import { runMigration } from "@/modules/document/migration/migrate-shared-with";
import { EMPTY_DOCUMENT_CONTENT } from "@/modules/shared/constants";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();
  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("Role-based Sharing & Permissions", () => {
  it("enforces permissions for viewer, commenter, and editor roles", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");

    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();

    // 1. Create document
    const doc = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Role Test Document",
    });

    // 2. Share as viewer
    await ShareService.shareDocument(doc.id, alice!._id.toString(), bob!.email, "viewer");

    // Bob can read
    const readDoc = await DocumentService.getDocumentForUser(doc.id, bob!._id.toString());
    expect(readDoc.permission).toBe("viewer");

    // Bob cannot edit content
    await expect(
      DocumentService.updateDocument(doc.id, bob!._id.toString(), {
        content: { type: "doc", content: [{ type: "paragraph", text: "changed" }] },
      })
    ).rejects.toMatchObject<AppError>({
      status: 403,
      message: "You do not have permission to edit this document",
    });

    // Bob cannot rename
    await expect(
      DocumentService.updateDocument(doc.id, bob!._id.toString(), {
        title: "Bob's Rename",
      })
    ).rejects.toMatchObject<AppError>({
      status: 403,
      message: "Only the owner can rename this document",
    });

    // 3. Update Bob to commenter
    await ShareService.updateRole(doc.id, alice!._id.toString(), bob!._id.toString(), "commenter");
    const readDoc2 = await DocumentService.getDocumentForUser(doc.id, bob!._id.toString());
    expect(readDoc2.permission).toBe("commenter");

    // Bob still cannot edit content
    await expect(
      DocumentService.updateDocument(doc.id, bob!._id.toString(), {
        content: { type: "doc", content: [{ type: "paragraph", text: "changed" }] },
      })
    ).rejects.toThrow();

    // 4. Update Bob to editor
    await ShareService.updateRole(doc.id, alice!._id.toString(), bob!._id.toString(), "editor");
    const readDoc3 = await DocumentService.getDocumentForUser(doc.id, bob!._id.toString());
    expect(readDoc3.permission).toBe("editor");

    // Bob can now edit content
    const updated = await DocumentService.updateDocument(doc.id, bob!._id.toString(), {
      content: { type: "doc", content: [{ type: "paragraph", text: "Bob is editing!" }] } as any,
    });
    expect(updated.content).toMatchObject({
      content: [{ type: "paragraph", text: "Bob is editing!" }],
    });

    // 5. Remove Bob's access
    await ShareService.removeShare(doc.id, alice!._id.toString(), bob!._id.toString());
    await expect(
      DocumentService.getDocumentForUser(doc.id, bob!._id.toString())
    ).rejects.toMatchObject<AppError>({
      status: 403,
      message: "Access denied",
    });
  });

  it("migrates old-style sharedWith array of IDs to the new structure", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");

    const db = mongoose.connection.db;
    expect(db).not.toBeUndefined();

    // Create a raw document with old schema
    const rawDocId = new mongoose.Types.ObjectId();
    await db!.collection("documents").insertOne({
      _id: rawDocId,
      title: "Legacy Document",
      content: EMPTY_DOCUMENT_CONTENT,
      ownerId: alice!._id,
      sharedWith: [bob!._id], // Old schema: array of ObjectIds
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Run migration
    const migratedCount = await runMigration();
    expect(migratedCount).toBeGreaterThanOrEqual(1);

    // Verify it is converted
    const migratedDoc = await db!.collection("documents").findOne({ _id: rawDocId });
    expect(migratedDoc).not.toBeNull();
    expect(migratedDoc!.sharedWith).toHaveLength(1);
    expect(migratedDoc!.sharedWith[0]).toMatchObject({
      userId: bob!._id,
      role: "editor",
    });

    // Clean up
    await db!.collection("documents").deleteOne({ _id: rawDocId });
  });
});
