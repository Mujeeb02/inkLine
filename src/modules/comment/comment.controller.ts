import { CommentService } from "./comment.service";
import { addCommentSchema } from "./comment.validation";
import { AppError } from "@/modules/shared/errors";

export class CommentController {
  static async add(documentId: string, userId: string, userEmail: string, body: unknown) {
    const parsed = addCommentSchema.safeParse(body);
    
    if (!parsed.success) {
      throw new AppError("Invalid comment data", 400);
    }
    
    const result = await CommentService.addComment(
      documentId,
      userId,
      userEmail,
      parsed.data.body,
      parsed.data.selection
    );
    
    return { success: true, comment: result };
  }

  static async list(documentId: string, userId: string) {
    const result = await CommentService.listComments(documentId, userId);
    return { success: true, comments: result };
  }

  static async resolve(commentId: string, userId: string) {
    const result = await CommentService.resolveComment(commentId, userId);
    return { success: true, comment: result };
  }

  static async delete(commentId: string, userId: string) {
    await CommentService.deleteComment(commentId, userId);
    return { success: true };
  }
}
