import { groupedLocationsSelectSchema } from "@/zod/schemas/location";
import { z } from "zod";

export interface Location {
  name: string;
  description: string | null;
  code: string;
}

export type GroupedLocations = z.infer<typeof groupedLocationsSelectSchema>;
