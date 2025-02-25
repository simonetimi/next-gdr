import { z } from "zod";
import {
  userSettingsSelectSchema,
  userSettingsUpdateSchema,
} from "@/zod/schemas/userSettings";

export type UserSettings = z.infer<typeof userSettingsSelectSchema>;

export type UserSettingsMinimal = z.infer<typeof userSettingsUpdateSchema>;
