import { createSelectSchema } from "drizzle-zod";
import { races } from "@/database/schema/race";
import { z } from "zod";

export const raceSelectSchema = createSelectSchema(races);

export const racesSelectSchema = z.array(raceSelectSchema);
