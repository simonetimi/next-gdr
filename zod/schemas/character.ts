import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { characters } from "@/database/schema/character";

export const characterInsertSchema = createInsertSchema(characters);
export const characterSelectSchema = createSelectSchema(characters);

export const charactersSelectSchema = z.array(characterSelectSchema);
