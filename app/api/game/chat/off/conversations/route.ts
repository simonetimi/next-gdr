import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { getConversations } from "@/server/offGameChat";

export async function GET() {
  try {
    return NextResponse.json([]);
    // TODO remote this response, placeholder for now

    const conversations = await getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
