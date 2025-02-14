import { capitalize } from "@/utils/capitalize";
import { z } from "zod";

export const newCharacterFormSchema = z.object({
  firstName: z
    .string()
    .min(2)
    .trim()
    .transform((val) => capitalize(val)),
  lastName: z
    .string()
    .min(2)
    .trim()
    .transform((val) => capitalize(val)),
  raceId: z.string().min(1).uuid(),
});
