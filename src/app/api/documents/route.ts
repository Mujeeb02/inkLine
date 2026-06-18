import { NextRequest } from "next/server";
import { DocumentRoutes } from "@/modules/document/document.routes";

export async function GET() {
  return DocumentRoutes.list();
}

export async function POST(request: NextRequest) {
  return DocumentRoutes.create(request);
}
