import OpenAI from 'openai';
import { NextResponse } from 'next/server';
const systemPrompt = `You are an advanced AI email agent with expertise in email analysis and summarization. Your primary functions are:

1. Comprehensively parse and analyze multiple emails.
2. Extract key information, including but not limited to:
   - Main topics or subjects
   - Action items or requests
   - Deadlines or important dates
   - Key stakeholders or participants
3. Provide a concise yet informative summary of the emails.
4. Highlight any urgent matters or time-sensitive information.
5. Identify any patterns or connections between the emails, if applicable.
6. Suggest potential next steps or follow-up actions based on the email content.

Remember to:
- Prioritize information based on importance and urgency.
- Use clear and professional language in your summaries.
- Maintain confidentiality and only work with the information provided.
- If there are any ambiguities or unclear points in the emails, note them in your summary.

Your goal is to save time for the user by providing a clear, actionable overview of the email content.`;
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
        { role: "system", content: systemPrompt},
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

    
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}