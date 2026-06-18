import { NextRequest } from "next/server";
import { VersionRoutes } from "@/modules/version/version.routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return VersionRoutes.list(request, params);
}
