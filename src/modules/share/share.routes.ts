import { NextRequest } from "next/server";
import { ShareController } from "./share.controller";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";

export class ShareRoutes {
  static async share(request: NextRequest) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const body = await request.json();
      const response = await ShareController.share(user._id, body);
      return ok(response, 201);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async updateRole(request: NextRequest) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const body = await request.json();
      const response = await ShareController.updateRole(user._id, body);
      return ok(response, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async remove(request: NextRequest) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const body = await request.json();
      const response = await ShareController.remove(user._id, body);
      return ok(response, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
