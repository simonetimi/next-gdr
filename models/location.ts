import {
  groupedLocationsSelectSchema,
  secretLocationSelectSchemaMinimal,
} from "@/zod/schemas/location";
import { z } from "zod";

export interface Location {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  hidden: boolean | null;
  description: string | null;
  locationGroupId: string | null;
}

export type SecretLocationMinimal = z.infer<
  typeof secretLocationSelectSchemaMinimal
>;

export type GroupedLocations = z.infer<typeof groupedLocationsSelectSchema>;
