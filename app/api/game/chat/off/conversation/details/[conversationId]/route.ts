import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { getConversationDetails } from "@/server/offGameChat";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await context.params;
    const messages = await getConversationDetails(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
