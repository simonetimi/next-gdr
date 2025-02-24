import { getOnlineCharacters } from "@/server/character";
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

export async function GET() {
  try {
    const onlineCharacters = await getOnlineCharacters();
    return NextResponse.json(onlineCharacters);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
