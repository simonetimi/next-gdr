import { NextResponse } from "next/server";
import { isInvisible } from "@/server/character";
import { Logger } from "@/utils/logger";

export async function GET() {
  try {
    const invisible = await isInvisible();
    return NextResponse.json({ invisible });
  } catch (error) {
    Logger.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }
}
