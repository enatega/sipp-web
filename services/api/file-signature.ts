import "server-only";

export type SniffedFileType = "image/png" | "image/jpeg" | "image/webp" | "image/heic" | "application/pdf";

const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"]);

// Identifies a file from its leading bytes instead of the client-declared MIME type.
export async function sniffFileType(file: Blob): Promise<SniffedFileType | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  if (ascii(4, 8) === "ftyp" && HEIF_BRANDS.has(ascii(8, 12))) return "image/heic";
  return null;
}

// HEIC and HEIF share one container format; browsers label the same file either way.
export function matchesDeclaredType(declared: string, sniffed: SniffedFileType) {
  const family = (type: string) => (type === "image/heif" ? "image/heic" : type);
  return family(declared) === sniffed;
}
