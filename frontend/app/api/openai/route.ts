import OpenAI from 'openai';
import { NextResponse } from 'next/server';
export async function POST(req : Request) {
  try {
    const { textData } = await req.json(); // Parse the textData from the request body

    if (!textData) {
      return NextResponse.json({ error: 'No textData provided' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.GPTKEY, // Access environment variable server-side
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `
          You are an expert email AI agent. I will provide you with an object containing a user's emails along with an instruction (e.g., "summarize", "get_event_info", or "show_upcoming_deadlines"). Based on the instruction, you must return a valid JSON object that strictly follows the schema below, without any additional text or formatting.
          
          Your output must be exactly in the following JSON format:
          
          {
            "instruction": "<summarize|get_event_info|show_upcoming_deadlines>",
            "data": {
              "summary": [
                {
                  "email_id": "<Unique identifier for the email>",
                  "summary_text": "<A concise summary of the email>"
                }
                // Additional summary objects if applicable
              ],
              "event_info": [
                {
                  "title": "<Event Title>",
                  "location": "<Event Location>",
                  "description": "<Event Description>",
                  "start_dateTime": "<ISO 8601 dateTime string, e.g., 2025-02-16T09:00:00-05:00>",
                  "end_dateTime": "<ISO 8601 dateTime string, e.g., 2025-02-16T10:00:00-05:00>",
                  "timeZone": "<Time Zone, e.g., America/New_York>"
                }
                // Additional event objects if applicable
              ],
              "upcoming_deadlines": [
                {
                  "email_id": "<Unique identifier for the email>",
                  "subject": "<Email Subject associated with the deadline>",
                  "deadline_date": "<Deadline date in YYYY-MM-DD format>"
                }
                // Additional deadline objects if applicable
              ]
            }
          }
          
          Important:
          - Do not include any text outside of the JSON object.
          - Do not wrap your response in markdown code blocks.
          - If the instruction is "summarize", populate only the "summary" array and leave "event_info" and "upcoming_deadlines" as empty arrays.
          - If the instruction is "get_event_info", populate only the "event_info" array (and empty the others).
          - If the instruction is "show_upcoming_deadlines", populate only the "upcoming_deadlines" array (and empty the others).
          
          Now, please produce your output based solely on the user input provided.
            ` },
        { 
          role: "user", 
          content: textData
        },
      ],
    });
    const message = completion.choices?.[0]?.message;
    if (!message) {
      throw new Error('No message returned from OpenAI');
    }
    return NextResponse.json({ result: message });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}