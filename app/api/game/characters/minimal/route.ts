import { getAllNonBannedCharacters } from "@/server/character";
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

export async function GET() {
  try {
    const nonBannedCharacters = await getAllNonBannedCharacters();
    return NextResponse.json(nonBannedCharacters);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
