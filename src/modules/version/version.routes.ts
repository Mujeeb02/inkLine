import { NextRequest } from "next/server";
import { VersionController } from "./version.controller";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";

export class VersionRoutes {
  static async list(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await VersionController.list(context.id, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async get(request: NextRequest, context: { versionId: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await VersionController.get(context.versionId, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async restore(request: NextRequest, context: { versionId: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const result = await VersionController.restore(context.versionId, user._id.toString());
      return ok(result, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
