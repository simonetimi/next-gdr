import { date, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const weatherForecasts = pgTable("weather_forecasts", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  temperature: integer("temperature").notNull(),
  condition: text("condition").notNull(),
  windSpeed: integer("wind_speed").notNull(),
  lunarPhase: text("lunar_phase").notNull(),
  createdAt: date("createdAt").notNull().defaultNow(),
});
