import { db } from "@/database/db";
import { weatherForecasts } from "@/database/schema/weather";
import getWeather from "@/utils/weatherGenerator";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authToken = (req.headers.get("authorization") || "")
    .split("Bearer ")
    .at(1);

  if (!authToken || authToken != process.env.CRON_SECRET) {
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
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Weather updated" }, { status: 200 });
}
