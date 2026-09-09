import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  const validUser = process.env.DASHBOARD_USER || 'admin';
  const validPassword = process.env.DASHBOARD_PASSWORD || 'CGM2026AI';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1] || '';
    const [user, pwd] = atob(authValue).split(':');

    if (user === validUser && pwd === validPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authenticatie vereist.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dentadmin Dashboard"',
    },
  });
}

// Alles beschermen, behalve statische assets (favicon/icon), zodat die
// altijd correct kunnen laden zonder eerst om een wachtwoord te vragen.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)'],
};