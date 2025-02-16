'use client';

import { ArrowRight, Calendar, Mail, Sparkles, Clock, Lock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="text-4xl min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80')] opacity-5" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 bg-purple-100 rounded-full">
              <span className="text-purple-700 font-medium">AI-Powered Email Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text leading-tight p-2">
              Your Emails,<br />Intelligently Managed
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Let AI organize your schedule by automatically extracting important events from your emails and syncing them with Google Calendar.
            </p>
            <div className="flex gap-4 justify-center">
            <SignInButton forceRedirectUrl="/chat">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                  Sign in to get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
              <Button size="lg" variant="outline" className="border-purple-200 hover:bg-purple-50">
                Watch Demo
              </Button>
            </div>
          </div>

          {/*
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 text-center">
            <div className="purple-glow">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">50K+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="purple-glow">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">1M+</h3>
              <p className="text-muted-foreground">Events Processed</p>
            </div>
            <div className="purple-glow">
              <h3 className="text-3xl font-bold text-purple-600 mb-2">99.9%</h3>
              <p className="text-muted-foreground">Accuracy Rate</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-32 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your schedule
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card">
              <Mail className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Smart Email Analysis</h3>
              <p className="text-muted-foreground">
                Our AI reads your emails and identifies important dates, meetings, and deadlines automatically.
              </p>
            </div>
            <div className="feature-card">
              <Sparkles className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">AI Summarization</h3>
              <p className="text-muted-foreground">
                Get concise summaries of important events and details, never miss a crucial meeting again.
              </p>
            </div>
            <div className="feature-card">
              <Calendar className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">Calendar Integration</h3>
              <p className="text-muted-foreground">
                Events are automatically added to your Google Calendar with all relevant details included.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your email management
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Secure Login</h3>
              <p className="text-muted-foreground">Connect your email account securely using OAuth authentication.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. AI Processing</h3>
              <p className="text-muted-foreground">Our AI analyzes your emails and extracts important events and details.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Auto-Scheduling</h3>
              <p className="text-muted-foreground">Events are automatically added to your calendar with smart reminders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="purple-glow bg-white/50 backdrop-blur-sm p-16 rounded-3xl border border-purple-100">
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-6">Ready to Streamline Your Schedule?</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Be among the first to try this innovative email management solution. Built with ❤️ during Hack(h)er-413 2025
            </p>
            <SignInButton forceRedirectUrl="/chat">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Signup to get started <Star className="ml-2 h-4 w-4" />
            </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 bg-white text-center">
        <p className="text-base text-muted-foreground">
          Built with ❤️ by Ahmed Khan and Riddhimaan Senapati
        </p>
      </section>
    </main>
  );
}