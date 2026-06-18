import { NextRequest } from "next/server";
import { ShareRoutes } from "@/modules/share/share.routes";

export async function POST(request: NextRequest) {
  return ShareRoutes.share(request);
}

export async function PATCH(request: NextRequest) {
  return ShareRoutes.updateRole(request);
}

export async function DELETE(request: NextRequest) {
  return ShareRoutes.remove(request);
}
