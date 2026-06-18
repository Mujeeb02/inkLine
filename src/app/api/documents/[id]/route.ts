import { NextRequest } from "next/server";
import { DocumentRoutes } from "@/modules/document/document.routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return DocumentRoutes.get(params);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return DocumentRoutes.update(request, params);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return DocumentRoutes.delete(params);
}
