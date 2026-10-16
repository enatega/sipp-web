export function GET() {
  const fingerprints = (process.env.ANDROID_APP_SHA256_FINGERPRINTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i.test(value));
  if (!fingerprints.length) return new Response(null, { status: 404 });

  return Response.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.sipp.delivery.app',
      sha256_cert_fingerprints: fingerprints,
    },
  }], {
    headers: { 'Cache-Control': 'public, max-age=3600', 'Content-Type': 'application/json' },
  });
}
