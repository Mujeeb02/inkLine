import { Types } from "mongoose";

import { DocumentService } from "@/modules/document/document.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();

  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("document creation", () => {
  it("creates a document and returns it in the owner's dashboard list", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    const document = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Project brief",
    });

    const dashboardDocuments = await DocumentService.listDocumentsForUser(alice!._id.toString());

    expect(document.title).toBe("Project brief");
    expect(dashboardDocuments.ownedDocuments).toHaveLength(1);
    expect(dashboardDocuments.ownedDocuments[0]).toMatchObject({
      id: document.id,
      title: "Project brief",
    });
    expect(dashboardDocuments.sharedDocuments).toHaveLength(0);
  });

  it("falls back to Untitled Document when a title is not provided", async () => {
    const alice = await getSeedUser("alice@test.com");

    expect(alice).not.toBeNull();

    const document = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
    });

    expect(document.title).toBe("Untitled Document");
  });
});
