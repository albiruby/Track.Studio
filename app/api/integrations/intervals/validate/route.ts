import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { athleteId, apiKey, userId } = await req.json();

    if (!athleteId || !apiKey) {
      return NextResponse.json(
        { error: 'Athlete ID and API Key are required.' },
        { status: 400 }
      );
    }

    const cleanId = athleteId.trim();
    const cleanKey = apiKey.trim();

    // Call intervals.icu API
    const authHeader = 'Basic ' + Buffer.from(`APIKEY:${cleanKey}`).toString('base64');
    
    // We fetch athlete info to validate credentials
    const response = await fetch(`https://intervals.icu/api/v1/athlete/${cleanId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid API Key or Athlete ID.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Intervals.icu verification failed with status code ${response.status}.` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Securely save credentials on the server side if userId is provided
    if (userId) {
      const { IngestionRepository } = await import('@/lib/data-platform/ingestion/repository');
      await IngestionRepository.saveSecureCredentials(userId, 'intervals-icu', {
        athleteId: cleanId,
        apiKey: cleanKey,
      });
    }

    return NextResponse.json({
      success: true,
      athlete: {
        id: data.id ? String(data.id) : cleanId,
        name: data.name || 'Intervals Athlete',
      },
    });
  } catch (error: any) {
    console.error('Intervals.icu validation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to Intervals.icu service.' },
      { status: 500 }
    );
  }
}
