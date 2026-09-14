export function userInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "U";

  const selected =
    parts.length === 1 ? parts : [parts[0], parts[parts.length - 1]];

  return selected
    .map((part) => Array.from(part)[0]?.toLocaleUpperCase() ?? "")
    .join("");
}
