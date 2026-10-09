const IP_PATTERN = /^[0-9a-fA-F.:]{2,45}$/;

// The end user's IP as the hosting platform saw it: X-Real-IP, else the last X-Forwarded-For hop
// (earlier hops are client-supplied and spoofable).
export function clientIpFrom(incoming: Pick<Headers, "get">): string | null {
  const forwarded = incoming.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean);
  const ip = incoming.get("x-real-ip")?.trim() || forwarded?.at(-1);
  return ip && IP_PATTERN.test(ip) ? ip : null;
}
