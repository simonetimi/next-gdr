import { sessions } from "@/database/schema/auth";
import { createSelectSchema } from "drizzle-zod";
import { raceSelectSchema } from "@/zod/schemas/race";
import { characterSelectSchema } from "@/zod/schemas/character";
import { locationSelectSchema } from "@/zod/schemas/location";
import { z } from "zod";

export const sessionSelectSchema = createSelectSchema(sessions);

export const onlineUsersSchema = z.array(
  sessionSelectSchema
    .extend({
      character: characterSelectSchema.pick({
        firstName: true,
        middleName: true,
        lastName: true,
        miniAvatarUrl: true,
      }),
      race: raceSelectSchema.pick({
        name: true,
        id: true,
      }),
      location: locationSelectSchema
        .pick({
          name: true,
          code: true,
        })
        .nullable(),
    })
    .omit({
      userId: true,
      expires: true,
      selectedCharacterId: true,
      currentLocationId: true,
      sessionToken: true,
    }),
);
