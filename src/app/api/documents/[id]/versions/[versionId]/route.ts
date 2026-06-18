import { NextRequest } from "next/server";
import { VersionRoutes } from "@/modules/version/version.routes";

type RouteContext = {
  params: Promise<{ id: string; versionId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return VersionRoutes.get(request, params);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return VersionRoutes.restore(request, params);
}
