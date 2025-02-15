import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

try {
// Ensure the user is authenticated.
const { userId } = await auth();
// Extract meeting details from the URL’s query parameters.
// Expected parameters:
//   date       — The meeting date (e.g., "2025-03-01")
//   start      — The meeting start time (e.g., "10:00")
//   end        — The meeting end time (e.g., "11:00")
//   summary    — The meeting title/summary (optional; defaults to "New Meeting")
//   description— The meeting description (optional)
//   location   — The meeting location (optional)
//   timeZone   — The time zone for the event (optional; defaults to "UTC")
const { searchParams } = new URL(req.url);
const meetingDate = searchParams.get('date');
const startTime = searchParams.get('start');
const endTime = searchParams.get('end');
const summary = searchParams.get('summary') || 'New Meeting';
const description = searchParams.get('description') || '';
const location = searchParams.get('location') || '';
const timeZone = searchParams.get('timeZone') || 'UTC';

// Validate required fields.
if (!meetingDate || !startTime || !endTime) {
  return new NextResponse('Missing required parameters: date, start, end', { status: 400 });
}

// Combine the meeting date with start and end times to create ISO date-time strings.
// Assumes meetingDate is in "YYYY-MM-DD" and times are in "HH:MM" (24-hour) format.
const startDateTime = new Date(`${meetingDate}T${startTime}:00`);
const endDateTime = new Date(`${meetingDate}T${endTime}:00`);

// Retrieve the user's Google OAuth access token from Clerk.
const oauthAccessTokenResponse = await clerkClient.users.getUserOauthAccessToken(
  userId || '',
  'google'
);
const oauthAccessTokens = oauthAccessTokenResponse.data;

if (!oauthAccessTokens || oauthAccessTokens.length === 0) {
  return new NextResponse('Unauthorized: NO TOKEN', { status: 401 });
}
const { token } = oauthAccessTokens;

if (!token) {
  return new NextResponse('Unauthorized: NO TOKEN', { status: 401 });
}

// Set up the OAuth2 client using the retrieved token.
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials({ access_token: token });

// Initialize the Calendar API.
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Build the event object.
const event = {
  summary,
  description,
  location,
  start: {
    dateTime: startDateTime.toISOString(),
    timeZone,
  },
  end: {
    dateTime: endDateTime.toISOString(),
    timeZone,
  },
};

// Insert the event into the primary calendar.
const eventResponse = await calendar.events.insert({
  calendarId: 'primary',
  requestBody: event,
});

return NextResponse.json(eventResponse.data);
} catch (error) {
    console.error('[CALENDAR EVENT ERROR]', error);
    return new NextResponse('Internal error', { status: 500 });
    }
    }