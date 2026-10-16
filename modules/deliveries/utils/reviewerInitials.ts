function firstLetter(value: string): string {
  return Array.from(value).find((character) => /[\p{L}\p{N}]/u.test(character)) ?? "";
}

export function getReviewerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstInitial = firstLetter(parts[0] ?? "");
  const lastInitial = parts.length > 1 ? firstLetter(parts.at(-1) ?? "") : "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase() || "S";
}
