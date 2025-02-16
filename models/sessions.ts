import { z } from "zod";
import { onlineUsersSchema, sessionSelectSchema } from "@/zod/schemas/session";

export type Session = z.infer<typeof sessionSelectSchema>;
export type OnlineUsers = z.infer<typeof onlineUsersSchema>;
