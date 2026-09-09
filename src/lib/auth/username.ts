export function createUsername(fullName: string, userId: string) {
  const base = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18) || "student";

  return `${base}-${userId.replaceAll("-", "").slice(0, 6)}`;
}
