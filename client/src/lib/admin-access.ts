export type AuthUserLike = { role?: string | null } | null | undefined;

export function isAdminUser(user: AuthUserLike) {
  return user?.role === "admin";
}
