import { NextRequest } from "next/server";
import { DocumentController } from "./document.controller";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { errorResponse, ok } from "@/modules/shared/utils";
import { AppError } from "@/modules/shared/errors";

export class DocumentRoutes {
  static async list() {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const response = await DocumentController.list(user._id);
      return ok(response);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async create(request: NextRequest) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const body = await request.json();
      const response = await DocumentController.create(user._id, body);
      return ok(response, 201);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async get(params: { id: string }) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const response = await DocumentController.get(params.id, user._id);
      return ok(response);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async update(request: NextRequest, params: { id: string }) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const body = await request.json();
      const response = await DocumentController.update(params.id, user._id, body);
      return ok(response);
    } catch (error) {
      return errorResponse(error);
    }
  }

  static async delete(params: { id: string }) {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AppError("Access denied", 401);
      }

      const response = await DocumentController.delete(params.id, user._id);
      return ok(response);
    } catch (error) {
      return errorResponse(error);
    }
  }
}
