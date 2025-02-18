import { date, integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const weatherForecasts = pgTable("weather_forecasts", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  temperature: integer("temperature").notNull(),
  condition: varchar("condition", { length: 30 }).notNull(),
  windSpeed: integer("wind_speed").notNull(),
  lunarPhase: varchar("lunar_phase", { length: 30 }).notNull(),
  createdAt: date("createdAt").notNull().defaultNow(),
});
