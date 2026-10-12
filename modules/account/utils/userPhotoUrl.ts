/** Legacy profiles can contain a placeholder URL instead of an uploaded photo. */
export function userPhotoUrl(value?: string | null): string | null {
  const photo = value?.trim();
  if (!photo || !/^(https?:)?\/\//i.test(photo)) return null;

  try {
    const url = new URL(photo.startsWith("//") ? `https:${photo}` : photo);
    const host = url.hostname.toLowerCase();
    if (
      host === "placehold.co" ||
      host === "www.placehold.co" ||
      host === "via.placeholder.com"
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return photo;
}
