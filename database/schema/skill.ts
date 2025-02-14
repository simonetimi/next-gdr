import { attributes } from "@/database/schema/attribute";
import { characters } from "@/database/schema/character";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const skills = pgTable("skill", {
  id: uuid().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  cost: integer("cost").default(0),
});

export const characterSkills = pgTable("character_skill", {
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  level: integer("level").default(0),
});

export const skillAttributes = pgTable("skill_attribute", {
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  attributeId: uuid("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
});
