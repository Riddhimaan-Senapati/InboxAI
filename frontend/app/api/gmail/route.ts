/*import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClerkClient } from '@clerk/nextjs/server';

export async function GET(_req: Request) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  try {
    const { userId } = await auth();

    const oauthAccessTokenResponse = await clerkClient.users.getUserOauthAccessToken(
        userId || '',
        'google'
      );
      
    const oauthAccessTokens = oauthAccessTokenResponse.data;

    if (!oauthAccessTokens || oauthAccessTokens.length === 0) {
      return new NextResponse('Unauthorized NO TOKEN', { status: 401 });
    }
    const { token } = oauthAccessTokens[0];

    if (!token) {
      return new NextResponse('Unauthorized NO TOKEN', { status: 401 });
    }

    // Place the OAuth2 client code here:
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    const res = await gmail.users.labels.list({ userId: 'me' });
    return NextResponse.json(res.data.labels);
  } catch (error) {
    console.error('[GMAIL ERROR]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}*/
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClerkClient } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  try {
    const { userId } = await auth();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start'); // e.g., "2025-02-01"
    const endDate = searchParams.get('end');     // e.g., "2025-02-15"
    // Build the Gmail query string using Unix timestamps
    let query = 'label:inbox';
    if (startDate) {
      const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
      query += ` after:${startTimestamp}`;
    }
    if (endDate) {
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
      query += ` before:${endTimestamp}`;
    }

    const oauthAccessTokenResponse = await clerkClient.users.getUserOauthAccessToken(
      userId || '',
      'google'
    );

    const oauthAccessTokens = oauthAccessTokenResponse.data;

    if (!oauthAccessTokens || oauthAccessTokens.length === 0) {
      return new NextResponse('Unauthorized NO TOKEN', { status: 401 });
    }
    const { token } = oauthAccessTokens[0];

    if (!token) {
      return new NextResponse('Unauthorized NO TOKEN', { status: 401 });
    }

    // Set up the OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    // Fetch the last 5 emails
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50, // Limit to the last 5 emails
      q: query, // Optional query string to filter emails
    });

    const messages = messagesResponse.data.messages;

    if (!messages || messages.length === 0) {
      return new NextResponse('No emails found', { status: 404 });
    }

    // Retrieve details for each email
    const emailDetailsPromises = messages.map(async (message) => {
      const messageDetail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });
      return {
        id: message.id,
        snippet: messageDetail.data.snippet, // Short preview of the email
        payload: messageDetail.data.payload, // Full email metadata and body
      };
    });

    const emailDetails = await Promise.all(emailDetailsPromises);

    return NextResponse.json(emailDetails);
  } catch (error) {
    console.error('[GMAIL ERROR]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
