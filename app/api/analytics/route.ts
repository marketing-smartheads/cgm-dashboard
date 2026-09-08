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

    // Gebruik de juiste GA4 scope
    const auth = getGoogleAuth(['https://www.googleapis.com/auth/analytics.readonly']);

    const analyticsdata = google.analyticsdata({
      version: 'v1beta',
      auth,
    });

    const propertyId = process.env.GA_PROPERTY_ID;
    if (!propertyId) {
      throw new Error('GA_PROPERTY_ID environment variable is missing.');
    }

    const response = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: startDateString, endDate: endDateString }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      },
    });

    return NextResponse.json({
      success: true,
      data: response.data,
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