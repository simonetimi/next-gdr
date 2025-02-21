import { NextRequest, NextResponse } from "next/server";
import { fetchAllLocationMessagesWithCharacters } from "@/server/locationMessages";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> },
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timestamp = searchParams.get("timestamp");
    const { locationId } = await context.params;

    const lastMessageTimestamp = timestamp ? new Date(timestamp) : null;
    const messages = await fetchAllLocationMessagesWithCharacters(
      locationId,
      lastMessageTimestamp,
    );

    return NextResponse.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
