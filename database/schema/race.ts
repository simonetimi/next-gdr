import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const races = pgTable("race", {
  id: uuid().primaryKey(),
  name: text("name").notNull().unique(),
});
