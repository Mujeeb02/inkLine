import { NextRequest } from "next/server";
import { UploadController } from "./upload.controller";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";

export class UploadRoutes {
  static async upload(request: NextRequest) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const formData = await request.formData();
      const response = await UploadController.upload(user._id, formData);
      return ok(response, 201);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
