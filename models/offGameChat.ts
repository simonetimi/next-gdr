import { z } from "zod";
import { offGameConversationWithDetailsSchema } from "@/zod/schemas/offgameChat";

export type OffGameConversationWithDetails = z.infer<
  typeof offGameConversationWithDetailsSchema
>;
