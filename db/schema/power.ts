import { attributes } from "@/db/schema/attribute";
import { characters } from "@/db/schema/character";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const powers = pgTable("power", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  cost: integer("cost").default(0),
});

export const characterPowers = pgTable("character_power", {
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  powerId: text("power_id")
    .notNull()
    .references(() => powers.id, { onDelete: "cascade" }),
  level: integer("level").default(0),
});

export const powerAttributes = pgTable("power_attribute", {
  powerId: text("power_id")
    .notNull()
    .references(() => powers.id, { onDelete: "cascade" }),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
});
