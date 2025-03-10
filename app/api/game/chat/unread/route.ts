import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { getOffGameUnreadMessagesCount } from "@/server/offGameChat";

export async function GET() {
  try {
    const unreadOffGameMessages = await getOffGameUnreadMessagesCount();
    return NextResponse.json({ off: unreadOffGameMessages, on: 0 });
  } catch (error) {
    Logger.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
