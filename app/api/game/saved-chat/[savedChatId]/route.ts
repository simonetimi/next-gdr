import { getSavedChat } from "@/server/locationMessage";
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ savedChatId: string }>;
  },
) {
  try {
    const { savedChatId } = await context.params;

    const savedChat = await getSavedChat(savedChatId);

    return new NextResponse(savedChat.htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, max-age=2629800, immutable", // 1 month
      },
    });
  } catch (error) {
    Logger.error(error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
