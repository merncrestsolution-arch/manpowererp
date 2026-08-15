import { NextResponse } from "next/server";

import { errorResponse, successResponse } from "@/lib/api-response";
import { getMobileApkUrl } from "@/lib/mobile-apk";

export async function GET() {
  const url = await getMobileApkUrl();

  if (!url) {
    return NextResponse.json(
      errorResponse("Android APK is not published yet"),
      { status: 404 },
    );
  }

  return NextResponse.json(
    successResponse({
      url,
      fileName: "jk-manpower.apk",
      platform: "android",
    }),
  );
}
