import { racesSelectSchema } from "@/zod/schemas/race";
import { z } from "zod";

export type Races = z.infer<typeof racesSelectSchema>;
