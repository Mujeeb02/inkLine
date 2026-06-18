import { Types } from "mongoose";
import { dbConnect } from "@/modules/shared/database/db";
import { CommentModel } from "./comment.model";
import { DocumentService } from "@/modules/document/document.service";
import { AppError } from "@/modules/shared/errors";

export class CommentService {
  static async addComment(
    documentId: string,
    userId: string,
    userEmail: string,
    body: string,
    selection?: { from: number; to: number; text: string }
  ) {
    await dbConnect();
    
    // Verify document access and role
    const { permission } = await DocumentService.resolvePermission(documentId, userId);
    
    if (permission === "viewer") {
      throw new AppError("Viewers cannot comment on this document", 403);
    }
    
    const comment = await CommentModel.create({
      documentId: new Types.ObjectId(documentId),
      authorId: new Types.ObjectId(userId),
      authorEmail: userEmail,
      body: body.trim(),
      selection,
    });
    
    return comment;
  }

  static async listComments(documentId: string, userId: string) {
    await dbConnect();
    
    await DocumentService.resolvePermission(documentId, userId);
    
    const comments = await CommentModel.find({
      documentId: new Types.ObjectId(documentId),
    })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
      
    return comments.map((c) => ({
      id: c._id.toString(),
      documentId: c.documentId.toString(),
      authorId: c.authorId.toString(),
      authorEmail: c.authorEmail,
      body: c.body,
      resolved: c.resolved,
      selection: c.selection,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  static async resolveComment(commentId: string, userId: string) {
    await dbConnect();
    
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    
    const { permission } = await DocumentService.resolvePermission(
      comment.documentId.toString(),
      userId
    );
    
    if (permission === "viewer") {
      throw new AppError("Viewers cannot resolve comments", 403);
    }
    
    comment.resolved = true;
    await comment.save();
    
    return comment;
  }

  static async deleteComment(commentId: string, userId: string) {
    await dbConnect();
    
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    
    const { permission } = await DocumentService.resolvePermission(
      comment.documentId.toString(),
      userId
    );
    
    const isAuthor = comment.authorId.toString() === userId.toString();
    const isOwner = permission === "owner";
    
    if (!isAuthor && !isOwner) {
      throw new AppError("You do not have permission to delete this comment", 403);
    }
    
    await CommentModel.findByIdAndDelete(commentId).exec();
  }
}
