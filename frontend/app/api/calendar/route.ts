// app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { google } from "googleapis";
import { createClerkClient } from "@clerk/nextjs/server";

interface CalendarEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string; // ISO string format
    timeZone: string;
  };
  end: {
    dateTime: string; // ISO string format
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
  // Get the currently authenticated user from Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse the incoming JSON body.
    // Ensure that the client sends a JSON string, for example:
    // JSON.stringify({ data: { event_info: [ { title: "Meeting", ... } ] } })
    const body = await req.json();

    // Check that body.data.event_info exists and is an array
    if (!body.data || !Array.isArray(body.data.event_info)) {
      throw new Error("Invalid input format: data.event_info is required");
    }

    // Map event_info to an array of CalendarEvent objects.
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

    // Create a Clerk client instance to retrieve user's Google OAuth token
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    });
    const oauthResponse = await clerkClient.users.getUserOauthAccessToken(userId, "google");
    const [tokenData] = oauthResponse.data;

    if (!tokenData?.token) {
      return NextResponse.json({ error: "No Google token found" }, { status: 401 });
    }

    // Set up the OAuth2 client with the retrieved token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: tokenData.token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Insert the first event in the calendarEvents array.
    const insertResponse = await calendar.events.insert({
      calendarId: "primary",
      requestBody: calendarEvents[0],
      conferenceDataVersion: 1
    });

    // If successful, return the created event's data.
    return NextResponse.json(insertResponse.data, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/calendar:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
