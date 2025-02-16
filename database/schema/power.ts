import { attributes } from "@/database/schema/attribute";
import { characters } from "@/database/schema/character";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const powers = pgTable("power", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  cost: integer("cost").default(0),
});

export const characterPowers = pgTable("character_power", {
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  powerId: uuid("power_id")
    .notNull()
    .references(() => powers.id, { onDelete: "cascade" }),
  level: integer("level").default(0),
});

export const powerAttributes = pgTable("power_attribute", {
  powerId: uuid("power_id")
    .notNull()
    .references(() => powers.id, { onDelete: "cascade" }),
  attributeId: uuid("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
});
