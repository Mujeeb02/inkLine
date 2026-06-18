import { Types } from "mongoose";
import { describe, it, expect } from "vitest";
import { DocumentService } from "@/modules/document/document.service";
import { CommentService } from "@/modules/comment/comment.service";
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

describe("Inline Comments", () => {
  it("allows commenters/editors/owners to add, list, resolve, and delete comments with proper rules", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");
    const charlie = await getSeedUser("charlie@test.com");

    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();
    expect(charlie).not.toBeNull();

    // 1. Create document owned by Alice
    const doc = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Comments Test Document",
    });

    // 2. Share: Bob is editor, Charlie is viewer
    const { DocumentRepository } = await import("@/modules/document/document.repository");
    await DocumentRepository.shareWithUser(doc.id, bob!._id, "editor");
    await DocumentRepository.shareWithUser(doc.id, charlie!._id, "viewer");

    // 3. Alice adds a standard comment
    const comment1 = await CommentService.addComment(
      doc.id,
      alice!._id.toString(),
      alice!.email,
      "Owner comment"
    );
    expect(comment1.body).toBe("Owner comment");
    expect(comment1.resolved).toBe(false);

    // 4. Bob adds an inline comment (with selection)
    const selection = { from: 10, to: 20, text: "selected text" };
    const comment2 = await CommentService.addComment(
      doc.id,
      bob!._id.toString(),
      bob!.email,
      "Editor comment",
      selection
    );
    expect(comment2.selection).toMatchObject(selection);

    // 5. Charlie (viewer) tries to add a comment -> should be blocked
    await expect(
      CommentService.addComment(doc.id, charlie!._id.toString(), charlie!.email, "Viewer comment")
    ).rejects.toMatchObject({
      status: 403,
      message: "Viewers cannot comment on this document",
    });

    // 6. List comments - check they both return
    const list = await CommentService.listComments(doc.id, bob!._id.toString());
    expect(list).toHaveLength(2);
    expect(list[0].body).toBe("Owner comment");
    expect(list[1].selection).toMatchObject(selection);

    // 7. Bob resolves Alice's comment
    await CommentService.resolveComment(comment1._id.toString(), bob!._id.toString());
    const listAfterResolve = await CommentService.listComments(doc.id, alice!._id.toString());
    expect(listAfterResolve[0].resolved).toBe(true);

    // 8. Charlie (viewer) tries to resolve -> blocked
    await expect(
      CommentService.resolveComment(comment2._id.toString(), charlie!._id.toString())
    ).rejects.toThrow();

    // 9. Bob tries to delete Alice's comment -> blocked (only author or owner can delete)
    await expect(
      CommentService.deleteComment(comment1._id.toString(), bob!._id.toString())
    ).rejects.toMatchObject({
      status: 403,
      message: "You do not have permission to delete this comment",
    });

    // Alice (owner) deletes Bob's comment -> allowed
    await CommentService.deleteComment(comment2._id.toString(), alice!._id.toString());
    
    const listAfterDelete = await CommentService.listComments(doc.id, alice!._id.toString());
    expect(listAfterDelete).toHaveLength(1);
  });
});
