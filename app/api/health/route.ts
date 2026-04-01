export async function GET() {
  const emergencyLockdown = process.env.EMERGENCY_LOCKDOWN_ENABLED === '1';

  return Response.json(
    {
      ok: true,
      status: emergencyLockdown ? 'degraded' : 'ok',
      emergencyLockdown,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
