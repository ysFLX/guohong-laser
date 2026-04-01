import { NextRequest, NextResponse } from 'next/server';

const EMERGENCY_ENABLED = process.env.EMERGENCY_LOCKDOWN_ENABLED === '1';
const EMERGENCY_BYPASS_COOKIE = 'emergency_bypass';
const EMERGENCY_BYPASS_QUERY = 'emergency_bypass';
const RETRY_AFTER_SECONDS = '300';

function isAllowedPath(pathname: string) {
  return pathname === '/api/health';
}

function canBypass(request: NextRequest, bypassToken?: string) {
  if (!bypassToken) return false;
  return request.cookies.get(EMERGENCY_BYPASS_COOKIE)?.value === '1';
}

function withEmergencyHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Retry-After', RETRY_AFTER_SECONDS);
  return response;
}

export function middleware(request: NextRequest) {
  if (!EMERGENCY_ENABLED) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (isAllowedPath(pathname)) return NextResponse.next();

  const bypassToken = process.env.EMERGENCY_BYPASS_TOKEN;
  const queryBypass = searchParams.get(EMERGENCY_BYPASS_QUERY);

  if (bypassToken && queryBypass && queryBypass === bypassToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.searchParams.delete(EMERGENCY_BYPASS_QUERY);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(EMERGENCY_BYPASS_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return response;
  }

  if (canBypass(request, bypassToken)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return withEmergencyHeaders(
      NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          code: 'EMERGENCY_LOCKDOWN',
        },
        { status: 503 },
      ),
    );
  }

  const html = `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gecici Bakim Modu</title>
    <style>
      body{margin:0;background:#05005c;color:#fdf9f6;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px}
      main{max-width:640px;text-align:center;border:1px solid rgba(255,106,13,.4);border-radius:16px;padding:28px;background:rgba(5,0,92,.85)}
      h1{margin:0 0 12px;font-size:28px}
      p{margin:8px 0;line-height:1.5;color:#ffe8df}
      code{background:rgba(255,106,13,.15);padding:2px 6px;border-radius:6px}
    </style>
  </head>
  <body>
    <main>
      <h1>Gecici Bakim Modu</h1>
      <p>Sistem su anda acil durum modunda. Lutfen biraz sonra tekrar deneyin.</p>
      <p>Durum kontrolu icin <code>/api/health</code> endpointini kullanabilirsiniz.</p>
    </main>
  </body>
</html>`;

  return withEmergencyHeaders(
    new NextResponse(html, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }),
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2|ttf|eot)$).*)',
  ],
};
