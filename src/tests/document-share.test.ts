import { Types } from "mongoose";

import { AppError } from "@/modules/shared/errors";
import { DocumentService } from "@/modules/document/document.service";
import { ShareService } from "@/modules/share/share.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();

  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("document sharing", () => {
  it("shares a document with another seeded user and exposes it in their shared list", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");

    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();

    const document = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Shared notes",
    });

    await ShareService.shareDocument(document.id, alice!._id.toString(), "bob@test.com");

    const bobDocuments = await DocumentService.listDocumentsForUser(bob!._id.toString());

    expect(bobDocuments.sharedDocuments).toHaveLength(1);
    expect(bobDocuments.sharedDocuments[0]).toMatchObject({
      id: document.id,
      ownerEmail: "alice@test.com",
      title: "Shared notes",
    });
  });

  it("prevents duplicate shares for the same recipient", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    const document = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Duplicate guard",
    });

    await ShareService.shareDocument(document.id, alice!._id.toString(), "bob@test.com");

    await expect(
      ShareService.shareDocument(document.id, alice!._id.toString(), "bob@test.com"),
    ).rejects.toMatchObject({
      message: "Already shared",
      status: 409,
    });
  });

  it("rejects attempts to share with the owner", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    const document = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Owner only",
    });

    await expect(
      ShareService.shareDocument(document.id, alice!._id.toString(), "alice@test.com"),
    ).rejects.toMatchObject({
      message: "Owner cannot share a document with themselves",
      status: 400,
    });
  });
});
