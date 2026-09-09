import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleAuth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || '30 dagen';

    let daysAgo = 30;
    if (rangeParam.includes('7')) daysAgo = 7;
    else if (rangeParam.includes('3') && (rangeParam.includes('maand') || rangeParam.includes('maanden'))) daysAgo = 90;

    const startDateString = `${daysAgo}daysAgo`;
    const endDateString = 'today';

    const auth = getGoogleAuth(['https://www.googleapis.com/auth/analytics.readonly']);

    const analyticsdata = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) {
      throw new Error('GA_PROPERTY_ID environment variable is missing.');
    }

    const property = `properties/${propertyId}`;

    // 1. Totalen (geen dimensie, dus 1 rij met de som over de hele periode)
    const totalsPromise = analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: startDateString, endDate: endDateString }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      },
    });

    // 2. Trend per dag (voor de sparkline / grafiek)
    const trendPromise = analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: startDateString, endDate: endDateString }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      },
    });

    // 3. Top pagina's
    const pagesPromise = analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: startDateString, endDate: endDateString }],
        dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: '5',
      },
    });

    const [totals, trend, pages] = await Promise.all([totalsPromise, trendPromise, pagesPromise]);

    return NextResponse.json({
      success: true,
      totals: totals.data,
      trend: trend.data,
      pages: pages.data,
    });
  } catch (error: any) {
    console.error('Analytics API Fout:', error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Fout bij het ophalen van Google Analytics data.',
      },
      { status: 500 }
    );
  }
}