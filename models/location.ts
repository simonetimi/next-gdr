import { groupedLocationsSelectSchema } from "@/zod/schemas/location";
import { z } from "zod";

export interface Location {
  id: string;
  code: string;
  name: string;
  imageUrl: string | null;
  hidden: boolean | null;
  description: string | null;
  locationGroupId: string | null;
}

export type GroupedLocations = z.infer<typeof groupedLocationsSelectSchema>;
