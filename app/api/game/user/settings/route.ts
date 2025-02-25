import { getUserSettings } from "@/server/userSettings";
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

export async function GET() {
  try {
    const settings = await getUserSettings();
    return NextResponse.json(settings);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
