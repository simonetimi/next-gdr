import { characters } from "@/db/schema/character";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const attributes = pgTable("attribute", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

export const characterAttributes = pgTable("character_attribute", {
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  value: integer("value").default(0).notNull(),
});
