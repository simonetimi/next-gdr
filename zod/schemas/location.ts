import { locations } from "@/database/schema/location";
import { toKebabCase } from "@/utils/strings";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const locationSelectSchema = createSelectSchema(locations);
export const locationsSelectSchema = z.array(locationSelectSchema);

export const locationInsertSchema = createInsertSchema(locations);

export const newLocationSchema = z.object({
  name: z.string().min(2).trim(),
  code: z
    .string()
    .trim()
    .transform((val) => toKebabCase(val)), // transforms to kebab case
  description: z.string().trim(),
});
