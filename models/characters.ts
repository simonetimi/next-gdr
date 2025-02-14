import { z } from "zod";
import { characterSelectSchema } from "@/zod/schemas/character";

export type Character = z.infer<typeof characterSelectSchema>;
