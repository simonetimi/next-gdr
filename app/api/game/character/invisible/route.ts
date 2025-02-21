import { NextResponse } from "next/server";
import { isInvisible } from "@/server/character";

export async function GET() {
  try {
    const invisible = await isInvisible();
    return NextResponse.json({ invisible });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }
}
