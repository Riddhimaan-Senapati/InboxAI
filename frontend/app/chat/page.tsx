/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import {Mail, Clock, Calendar } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const examplePrompts = [
  {
    icon: Calendar,
    text: "Summarize all my emails",
    description: "Get a quick overview of your Valentine's Day communications",
    tag: "summarize"
  },
  {
    icon: Mail,
    text: "Find all meeting invites",
    description: "Quickly locate and organize recent meeting requests",
    tag:"get_event_info"
  },
  {
    icon: Clock,
    text: "Show upcoming deadlines mentioned in emails",
    description: "Stay on top of important due dates and commitments",
    tag:"show_upcoming_deadlines"
  },
];

export default function ChatPage() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading,setSummaryLoading] = useState(false);
  const { toast } = useToast()
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
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, [date]);

  useEffect(() => {
    if (loading) {
      toast({
        title: "Getting Emails...",
        description: "We're fetching your emails, please wait.",
      });

      // Simulate an async operation (e.g., API call)
      setTimeout(() => {
        setLoading(false); // Reset loading after 3 seconds
      }, 3000);
    }
  }, [loading, toast]);

  useEffect(() => {
    if (summaryLoading) {
      toast({
        title: "Fetching Info...",
        description: "We're fetching your Info, please wait.",
      });

      // Simulate an async operation (e.g., API call)
      setTimeout(() => {
        setLoading(false); // Reset loading after 3 seconds
      }, 3000);
    }
  }, [summaryLoading, toast]);
  
  const [messages, setMessages] = useState<string>("Hello welcome, how can I help you today?");


  const handleExampleClick = async (prompt: string) => {
    console.log(prompt,"this is the prompt");
    type Label = {
      id: string;
      snippet: string;
      payload: any;
    };
    
    const emails = (labels as Label[])
      .map(label => label.snippet)
      .join("\n\n");
    console.log('emails',emails);
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textData: JSON.stringify({instruction: prompt, emails}) }),
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
        let textSum = ""
        if (prompt === "summarize") {

          const summaries = parsedData.data.summary.map(
            (item: { summary_text: string }) => `📌 ${item.summary_text}`
          );
          textSum = summaries.join("\n\n---\n");
        } else if (prompt === "get_event_info") {

          
          // @ts-expect-error unable to infer
          const formattedEvents = parsedData.data.event_info.map((event) => 
            `📅 *${event.title}*\n` +
            `📍 ${event.location} | 🕒 ${new Date(event.start_dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` +
            `\n${event.description.slice(0, 80)}...`
          );

          // call calendar api
          const response = await fetch('/api/calendar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(parsedData),
          });
        
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
          }

          textSum = formattedEvents.join("\n\n――――――――――――\n");
        } else if (prompt === "show_upcoming_deadlines") {
          // @ts-expect-error unable to infer
          const formattedDeadlines = parsedData.data.upcoming_deadlines.map(deadline => 
            `⏳ *${deadline.subject}*\n` +
            `📅 ${new Date(deadline.deadline_date).toLocaleDateString("en-US", { 
              month: 'short', 
              day: 'numeric', 
              weekday: 'short' 
            })}`
          );
          textSum = formattedDeadlines.join("\n\n――――――――――――\n");
        }
        setMessages(textSum);
        setSummaryLoading(false);
      } catch (error) {
        console.error("Error in handleExampleClick:", error);
      }
    }catch(error){
      console.log(error);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="flex justify-end mb-2 -mt-4">
          <SignOutButton>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Sign out
            </Button>
          </SignOutButton>
        </div>

        <div className="grid grid-cols-[300px,1fr,450px] gap-8">
          {/* Left Sidebar - Example Prompts */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
            <h2 className="text-xl font-semibold mb-4 gradient-text">Email Actions</h2>
            <div className="space-y-4">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {handleExampleClick(prompt.tag); setSummaryLoading(true);}}
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