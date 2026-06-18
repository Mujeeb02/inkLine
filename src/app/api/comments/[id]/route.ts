import { NextRequest } from "next/server";
import { CommentRoutes } from "@/modules/comment/comment.routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return CommentRoutes.resolve(request, params);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return CommentRoutes.delete(request, params);
}
