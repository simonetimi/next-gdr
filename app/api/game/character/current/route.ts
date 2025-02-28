import { NextResponse } from "next/server";
import { getMinimalCurrentCharacter } from "@/server/character";
import { Logger } from "@/utils/logger";

export async function GET() {
  try {
    const character = await getMinimalCurrentCharacter();
    return NextResponse.json(character);
  } catch (error) {
    Logger.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }
}
