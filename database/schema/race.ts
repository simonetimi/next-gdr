import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const races = pgTable("race", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 20 }).notNull().unique(),
});
