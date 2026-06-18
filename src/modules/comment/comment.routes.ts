import { NextRequest } from "next/server";
import { CommentController } from "./comment.controller";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";

export class CommentRoutes {
  static async list(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await CommentController.list(context.id, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async add(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const body = await request.json();
      const result = await CommentController.add(
        context.id,
        user._id.toString(),
        user.email,
        body
      );
      return ok(result, 201);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async resolve(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await CommentController.resolve(context.id, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async delete(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await CommentController.delete(context.id, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
