import { Types } from "mongoose";
import { describe, it, expect, vi } from "vitest";
import { DocumentService } from "@/modules/document/document.service";
import { UserService } from "@/modules/user/user.service";
import { UserModel } from "@/modules/user/user.model";
import { PresenceService } from "@/modules/presence/presence.service";
import { PresenceModel } from "@/modules/presence/presence.model";

async function getSeedUser(email: string) {
  await UserService.ensureSeedUsers();
  return UserModel.findOne({ email }).lean<{
    _id: Types.ObjectId;
    email: string;
  } | null>();
}

describe("Real-time Presence Indicators", () => {
  it("upserts user presence and retrieves active users on a document", async () => {
    const alice = await getSeedUser("alice@test.com");
    const bob = await getSeedUser("bob@test.com");
    
    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();

    // 1. Create doc owned by Alice
    const doc = await DocumentService.createDocument({
      ownerId: alice!._id.toString(),
      title: "Presence Test Document",
    });

    // 2. Share with Bob so he can access it
    await DocumentService.updateDocument(doc.id, alice!._id.toString(), {
      // (This will bypass since alice is owner, but let's make sure it's shared)
    });
    const { DocumentRepository } = await import("@/modules/document/document.repository");
    await DocumentRepository.shareWithUser(doc.id, bob!._id, "viewer");

    // 3. Alice heartbeats
    await PresenceService.heartbeat(doc.id, alice!._id.toString(), alice!.email);

    // 4. Bob queries active users
    let activeUsers = await PresenceService.getActiveUsers(doc.id, bob!._id.toString());
    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0]).toMatchObject({
      userId: alice!._id.toString(),
      email: alice!.email,
    });

    // Alice queries active users (excluding herself, should be empty)
    activeUsers = await PresenceService.getActiveUsers(doc.id, alice!._id.toString());
    expect(activeUsers).toHaveLength(0);

    // 5. Bob heartbeats too
    await PresenceService.heartbeat(doc.id, bob!._id.toString(), bob!.email);

    // Alice queries active users (should find Bob now)
    activeUsers = await PresenceService.getActiveUsers(doc.id, alice!._id.toString());
    expect(activeUsers).toHaveLength(1);
    expect(activeUsers[0]).toMatchObject({
      userId: bob!._id.toString(),
      email: bob!.email,
    });

    // 6. Test expiration (simulating time passing)
    const originalDateNow = Date.now;
    try {
      // Mock Date.now to be 31 seconds in the future
      Date.now = () => originalDateNow() + 31000;

      // Alice queries active users (Bob's presence should be expired now)
      activeUsers = await PresenceService.getActiveUsers(doc.id, alice!._id.toString());
      expect(activeUsers).toHaveLength(0);
    } finally {
      Date.now = originalDateNow;
    }
  });
});
