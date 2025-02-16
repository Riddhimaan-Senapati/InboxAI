// app/api/calendar/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { createClerkClient } from '@clerk/nextjs/server';

interface CalendarEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{ email: string }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Map directly to CalendarEvent without validation
    const calendarEvents: CalendarEvent[] = body.data.event_info.map((event: any) => ({
      summary: event.title,
      location: event.location,
      description: event.description,
      start: {
        dateTime: new Date(event.start_dateTime).toISOString(),
        timeZone: "UTC"
      },
      end: {
        dateTime: new Date(event.end_dateTime).toISOString(),
        timeZone: "UTC"
      }
    }));

    // Create Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Get Google OAuth token
    const oauthResponse = await clerkClient.users.getUserOauthAccessToken(userId, "google");
    const [tokenData] = oauthResponse.data;
    
    if (!tokenData?.token) {
      return NextResponse.json({ error: 'No Google token found' }, { status: 401 });
    }

    // Create Google Calendar client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokenData.token });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Insert first event (modify to handle multiple events if needed)
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvents[0],
      conferenceDataVersion: 1
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
