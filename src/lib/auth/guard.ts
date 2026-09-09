export function requireRole(role: "student" | "moderator" | "admin", userRole?: string) {
  if (!userRole) {
    return false;
  }

  const rank: Record<string, number> = {
    student: 1,
    moderator: 2,
    admin: 3,
  };

  return (rank[userRole] ?? 0) >= (rank[role] ?? 0);
}
