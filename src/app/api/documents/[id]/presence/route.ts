import { NextRequest } from "next/server";
import { PresenceRoutes } from "@/modules/presence/presence.routes";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return PresenceRoutes.getActiveUsers(request, params);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return PresenceRoutes.heartbeat(request, params);
}
