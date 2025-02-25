import { createSelectSchema } from "drizzle-zod";
import { userSettings } from "@/database/schema/userSettings";

export const userSettingsSelectSchema = createSelectSchema(userSettings);

export const userSettingsUpdateSchema = userSettingsSelectSchema
  .extend({})
  .omit({
    id: true,
    userId: true,
  });
