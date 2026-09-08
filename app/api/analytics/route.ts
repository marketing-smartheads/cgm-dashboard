import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '386204911';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30 dagen';

    // Bepaal de juiste startdatum op basis van de frontend selectie
    let startDate = '30daysAgo';
    if (rangeParam.includes('7')) {
      startDate = '7daysAgo';
    } else if (rangeParam.includes('3') && (rangeParam.includes('maand') || rangeParam.includes('maanden'))) {
      startDate = '90daysAgo'; // 3 maanden = 90 dagen
    }

    // 1. Haal de totalen op (Actieve gebruikers & Paginaweergaves)
    const [totalsResponse] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: startDate, endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
      ],
    });

    // 2. Haal de trend per dag op voor de grafiek
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: startDate, endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    // 3. Haal de top pagina's op uit GA4
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: startDate, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5, // Top 5 pagina's
    });

    return NextResponse.json({
      success: true,
      totals: totalsResponse,
      trend: trendResponse,
      pages: pagesResponse,
    });
  } catch (error: any) {
    console.error('Fout bij ophalen GA4 data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}