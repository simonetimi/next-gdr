import { z } from "zod";
import { weatherSelectSchemaMinimal } from "@/zod/schemas/weather";

export type WeatherForecasts = z.infer<typeof weatherSelectSchemaMinimal>;
