export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId) return new Response(null, { status: 404 });

  return Response.json({
    applinks: {
      apps: [],
      details: [{
        appID: `${teamId}.com.sipp.delivery.app`,
        paths: ['/restaurants/*'],
      }],
    },
  }, {
    headers: { 'Cache-Control': 'public, max-age=3600', 'Content-Type': 'application/json' },
  });
}
