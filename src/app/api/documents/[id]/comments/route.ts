import { NextRequest } from "next/server";
import { CommentRoutes } from "@/modules/comment/comment.routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return CommentRoutes.list(request, params);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return CommentRoutes.add(request, params);
}
