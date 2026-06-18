import { NextResponse } from "next/server";
import { UserController } from "@/modules/user/user.controller";
import { errorResponse } from "@/modules/shared/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await UserController.list();
    return NextResponse.json(response);
  } catch (error) {
    return errorResponse(error);
  }
}
