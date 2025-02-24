import { getCharacterSheet } from "@/server/character";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ characterId: string }> },
) {
  try {
    const { characterId } = await context.params;
    const characterSheet = await getCharacterSheet(characterId);
    return NextResponse.json(characterSheet);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
