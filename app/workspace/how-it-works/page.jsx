'use client';
import { Lightbulb, BrainCog, Youtube, FileText, BookPlus, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-2">How AI LearnHub Works</h1>
        <p className="text-gray-600 text-lg">
          Learn how we use AI to generate smart, structured and engaging learning experiences.
        </p>
      </div>

      <div className="grid gap-10">
        {/* Step 1: Create a Course */}
        <div className="flex gap-6 items-start">
          <BookPlus className="text-secondary min-w-[40px] h-10 w-10 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">1. Create Your Course</h2>
            <p className="text-gray-700">
              Start by clicking the <span className="font-medium text-primary">"Create Course"</span> button on your dashboard. Provide a course name, a short description, your target audience, and the direction you'd like the course to take.
            </p>
          </div>
        </div>

        {/* Step 2: Generate First Draft */}
        <div className="flex gap-6 items-start">
          <BrainCog className="text-secondary min-w-[40px] h-10 w-10 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">2. Gemini Generates the Course Skeleton</h2>
            <p className="text-gray-700">
              Your input is sent to <strong>Gemini</strong> to generate the first draft of the course. This includes the <strong>core topics</strong>, an outline of the chapters, and an AI-proposed learning path.
            </p>
          </div>
        </div>

        {/* Step 3: Generate Chapter Content */}
        <div className="flex gap-6 items-start">
          <FileText className="text-secondary min-w-[40px] h-10 w-10 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">3. Content Generation for Each Topic</h2>
            <p className="text-gray-700">
              Each topic is passed back into <strong>Gemini</strong> to generate full chapter content — including definitions, explanations, real-world examples, and step-by-step breakdowns.
            </p>
          </div>
        </div>

        {/* Step 4: YouTube API */}
        <div className="flex gap-6 items-start">
          <Youtube className="text-secondary min-w-[40px] h-10 w-10 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">4. Relevant YouTube Videos are Suggested</h2>
            <p className="text-gray-700">
              We send the chapter details to the <strong>YouTube API</strong> to fetch high-quality videos that match the learning goals. These are embedded into your course for multi-modal learning.
            </p>
          </div>
        </div>

        {/* Step 5: Ready to Learn */}
        <div className="flex gap-6 items-start">
          <Rocket className="text-secondary min-w-[40px] h-10 w-10 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">5. Learn, Share & Track</h2>
            <p className="text-gray-700">
              Once your course is ready, you can start learning, track your progress, and even share the course with others.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <Link href="/workspace">
          <Button size="lg" className="text-lg">Go to Workspace</Button>
        </Link>
      </div>
    </div>
  );
}
