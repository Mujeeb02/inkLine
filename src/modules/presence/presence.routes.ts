import { NextRequest } from "next/server";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";
import { PresenceService } from "./presence.service";

export class PresenceRoutes {
  static async heartbeat(request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const record = await PresenceService.heartbeat(
        context.id,
        user._id.toString(),
        user.email
      );
      
      return ok({ success: true, heartbeat: record }, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async getActiveUsers(_request: NextRequest, context: { id: string }) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new AppError("Access denied", 401);
      }
      
      const active = await PresenceService.getActiveUsers(context.id, user._id.toString());
      return ok({ success: true, users: active }, 200);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
