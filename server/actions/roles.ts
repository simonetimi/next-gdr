import { db } from "@/database/db";
import { eq, and } from "drizzle-orm";
import { roles, userRoles } from "@/database/schema/role";

export async function isAdmin(userId: string) {
  const result = await db
    .select()
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), eq(roles.type, "admin")));

  return result.length > 0;
}

export async function isMaster(userId: string) {
  const result = await db
    .select()
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(and(eq(userRoles.userId, userId), eq(roles.type, "master")));

  return result.length > 0;
}
