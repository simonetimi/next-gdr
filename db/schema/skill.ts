import { attributes } from "@/db/schema/attribute";
import { characters } from "@/db/schema/character";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const skills = pgTable("skill", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  cost: integer("cost").default(0),
});

export const characterSkills = pgTable("character_skill", {
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  skillId: text("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  level: integer("level").default(0),
});

export const skillAttributes = pgTable("skill_attribute", {
  skillId: text("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id, { onDelete: "cascade" }),
});
