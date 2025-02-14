import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { characters } from "@/database/schema/character";
import { capitalize } from "@/utils/strings";

export const characterInsertSchema = createInsertSchema(characters);
export const characterSelectSchema = createSelectSchema(characters);

export const charactersSelectSchema = z.array(characterSelectSchema);

export const newCharacterFormSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .max(20)
    .trim()
    .regex(/^\p{L}+$/u) // it can contain only letters (including accented letters)
    .transform((val) => capitalize(val)),
  lastName: z
    .string()
    .min(2)
    .max(20)
    .trim()
    .regex(/^\p{L}+$/u)
    .transform((val) => capitalize(val)),
  raceId: z.string().min(1).uuid(),
});
