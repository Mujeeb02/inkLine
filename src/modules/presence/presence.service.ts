import { Types } from "mongoose";
import { dbConnect } from "@/modules/shared/database/db";
import { PresenceModel } from "./presence.model";
import { DocumentService } from "@/modules/document/document.service";

export class PresenceService {
  static async heartbeat(documentId: string, userId: string, email: string) {
    await dbConnect();
    
    // Ensure user has access to this document
    await DocumentService.resolvePermission(documentId, userId);
    
    const docId = new Types.ObjectId(documentId);
    const uId = new Types.ObjectId(userId);
    
    const record = await PresenceModel.findOneAndUpdate(
      { documentId: docId, userId: uId },
      { email, lastSeen: new Date() },
      { upsert: true, new: true }
    ).exec();
    
    return record;
  }

  static async getActiveUsers(documentId: string, userId: string) {
    await dbConnect();
    
    // Ensure user has access to this document
    await DocumentService.resolvePermission(documentId, userId);
    
    const docId = new Types.ObjectId(documentId);
    const uId = new Types.ObjectId(userId);
    
    // Find all active presence entries in the last 30 seconds excluding the user themselves
    const threshold = new Date(Date.now() - 30000);
    const active = await PresenceModel.find({
      documentId: docId,
      userId: { $ne: uId },
      lastSeen: { $gt: threshold },
    })
      .sort({ lastSeen: -1 })
      .lean()
      .exec();
      
    return active.map((p) => ({
      userId: p.userId.toString(),
      email: p.email,
      lastSeen: p.lastSeen.toISOString(),
    }));
  }
}
