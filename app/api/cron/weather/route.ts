import { db } from "@/database/db";
import { weatherForecasts } from "@/database/schema/weather";
import getWeather from "@/utils/weatherGenerator";
import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { AppConfig } from "@/utils/config/AppConfig";

export async function GET(req: Request) {
  const authToken = (req.headers.get("authorization") || "")
    .split("Bearer ")
    .at(1);

  if (!authToken || authToken != AppConfig.getCronSecret()) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
      },
    );
  }

  const weather = getWeather();

  try {
    await db.insert(weatherForecasts).values(weather);
  } catch (error) {
    Logger.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Weather updated" }, { status: 200 });
}
