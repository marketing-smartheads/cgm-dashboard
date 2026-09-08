import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30 dagen';

    let daysAgo = 30;
    if (rangeParam.includes('7')) daysAgo = 7;
    else if (rangeParam.includes('3') && (rangeParam.includes('maand') || rangeParam.includes('maanden'))) daysAgo = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = new Date().toISOString().split('T')[0];

    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({
      version: 'v1',
      auth,
    });

    // Haal het service account e-mailadres op voor eventuele weergave in de UI
    const clientEmail = (await auth.getClient()).email || 'jouw-service-account@...';
    const siteUrl = process.env.SEARCH_CONSOLE_PROPERTY || 'https://dentadmin.be/';

    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDateString,
        endDate: endDateString,
        dimensions: ['query'],
        rowLimit: 5,
        aggregationType: 'byPage',
      },
    });

    return NextResponse.json({
      success: true,
      rows: response.data.rows || [],
    });
  } catch (error: any) {
    console.error('Search Console API Fout:', error.message);

    // Controleer of het om een permissie-fout gaat (403 / API niet ingeschakeld / geen toegang)
    const isAuthError = error.code === 403 || error.status === 403 || error.message?.includes('Forbidden');

    // Probeer het service account e-mailadres te achterhalen voor de kopieer-knop
    let clientEmail = '';
    try {
      const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
      clientEmail = (await auth.getClient()).email || '';
    } catch (e) {}

    return NextResponse.json(
      {
        success: false,
        error: isAuthError ? 'GEEN_TOEGANG_SEARCH_CONSOLE' : error.message,
        clientEmail: clientEmail,
        message: 'Geen toegang tot Google Search Console voor deze property.',
      },
      { status: isAuthError ? 403 : 500 }
    );
  }
}