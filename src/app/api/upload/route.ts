import { NextRequest } from "next/server";
import { UploadRoutes } from "@/modules/upload/upload.routes";

export async function POST(request: NextRequest) {
  return UploadRoutes.upload(request);
}
