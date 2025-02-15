'use client';

import { useEffect, useState } from 'react';
import { Send, Mail, Clock, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@clerk/nextjs';
import { addDays, format, set } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};


const examplePrompts = [
  {
    icon: Calendar,
    text: "Summarize all my emails from February 14th",
    description: "Get a quick overview of your Valentine's Day communications"
  },
  {
    icon: Mail,
    text: "Find all meeting invites from last week",
    description: "Quickly locate and organize recent meeting requests"
  },
  {
    icon: Clock,
    text: "Show upcoming deadlines mentioned in emails",
    description: "Stay on top of important due dates and commitments"
  },
  {
    icon: Sparkles,
    text: "Analyze my email response time",
    description: "Get insights into your email communication patterns"
  }
];

export default function ChatPage() {
  const [labels, setLabels] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  useEffect(() => {
    if (!date.from || !date.to) return;

    const start = format(date.from, 'yyyy-MM-dd');
    const end = format(date.to, 'yyyy-MM-dd');
    console.log(start,end,"start and end dates");
    
    const fetchLabels = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gmail?start=${start}&end=${end}`);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        console.log("emails",data);
        setLabels(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching labels');
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, [date]);
  
  const [messages, setMessages] = useState<text>("Hello welcome, how can I help you today?");
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    
    // Simulate AI response
    const aiResponse: Message = {
      role: 'assistant',
      content: "Here's a summary of your emails from February 14th:\n\n" +
        "1. Meeting with Marketing Team (10:00 AM)\n" +
        "2. Project Deadline Reminder from John\n" +
        "3. Client Proposal Review Request\n" +
        "4. Team Lunch Invitation\n\n" +
        "Would you like me to add any of these events to your calendar?"
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
    setInput('');
  };

  const handleExampleClick = async (prompt: string) => {
    setInput(prompt);
    type Label = {
      id: string;
      snippet: string;
      payload: any;
    };
    
    const emails = (labels as Label[])
      .map(label => label.snippet)
      .join("\n\n");

    prompt = "summarize";
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textData: emails, labels }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze :(');
      }
      try {
        const data = await response.json();
        // Log the response to check its structure
        console.log("API response:", data);
      
        // Extract the content string from the result
        const content = data.result?.content;
        if (!content) {
          throw new Error("No content found in API response");
        }
      
        // Parse the JSON string in content
        const parsedData = JSON.parse(content);
      
        // Check that parsedData has the expected structure
        if (!parsedData.data || !Array.isArray(parsedData.data.summary)) {
          throw new Error("Unexpected JSON structure");
        }
      
        // Extract all summary_text values
        const summaries = parsedData.data.summary.map(
          (item: { summary_text: string }) => item.summary_text
        );
        const textSum = summaries.join(" ");
        setMessages(textSum);
      } catch (error) {
        console.error("Error in handleExampleClick:", error);
      }
    }catch(error){
      console.log(error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <SignOutButton/>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-[350px,1fr,350px] gap-8">
          {/* Left Sidebar - Example Prompts */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
            <h2 className="text-xl font-semibold mb-4 gradient-text">Example Prompts</h2>
            <div className="space-y-4">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt.text)}
                  className="w-full text-left p-4 rounded-xl hover:bg-purple-50 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-lg p-2 group-hover:bg-purple-200 transition-colors duration-200">
                      <prompt.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{prompt.text}</p>
                      <p className="text-sm text-gray-500 mt-1">{prompt.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle - Chat Area */}
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 bg-gray-600 text-white`}
                  >
                    <p className="whitespace-pre-wrap">{messages}</p>
                  </div>
                </div>
            </div>

          {/* Right Sidebar - Date Range Picker */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
            <h2 className="text-xl font-semibold mb-4 gradient-text">Select Date Range</h2>
            <div className="rounded-lg border border-purple-100 p-4">
              <CalendarComponent
                mode="range"
                selected={date}
                onSelect={(range) => {
                  if (!range || !range.from || !range.to) return;
                  setDate(range);
                }}                
                classNames={{
                  root: "w-full",
                  head_cell: "px-2 py-1 text-purple-600 font-medium",
                  day: "w-10 h-10 flex items-center justify-center hover:bg-purple-50 focus:bg-purple-50",
                  day_selected: "bg-purple-600 text-white hover:bg-purple-500 focus:bg-purple-500",
                  day_today: "bg-purple-50",
                }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {date.from ? (
                date.to ? (
                  <>
                    <p>Selected range:</p>
                    <p className="font-medium text-purple-600">
                      {format(date.from, "MMMM d, yyyy")} - {format(date.to, "MMMM d, yyyy")}
                    </p>
                  </>
                ) : (
                  <p>Select end date</p>
                )
              ) : (
                <p>Select start date</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}