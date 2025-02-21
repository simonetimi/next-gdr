import { getOnlineCharacters } from "@/server/character";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const onlineCharacters = await getOnlineCharacters();
    return NextResponse.json(onlineCharacters);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
