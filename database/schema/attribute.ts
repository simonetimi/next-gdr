import { characters } from "@/database/schema/character";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const attributes = pgTable("attribute", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

export const characterAttributes = pgTable("character_attribute", {
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  attributeId: uuid("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
  value: integer("value").default(0).notNull(),
});
