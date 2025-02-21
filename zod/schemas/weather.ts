import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { weatherForecasts } from "@/database/schema/weather";

export const weatherSelectSchema = createSelectSchema(weatherForecasts);

export const weatherSelectSchemaMinimal = weatherSelectSchema.omit({
  id: true,
  createdAt: true,
});
