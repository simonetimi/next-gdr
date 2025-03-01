import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { getConversationMessages } from "@/server/offGameChat";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;

    const messages = await getConversationMessages(conversationId, cursor);
    return NextResponse.json(messages);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
