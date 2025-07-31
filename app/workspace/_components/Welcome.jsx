// app/workspace/_components/Welcome.jsx
'use client';

import React from 'react';
import { Sparkles, BookOpenCheck, GraduationCap } from 'lucide-react'; // Added GraduationCap here
import { Card } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button"; 
import Link from "next/link"; 
import AddCourseDialog from "./AddCourseDialog"; // Assuming AddCourseDialog is in the same directory or correctly imported

function Welcome() {
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? 'Good morning' :
    hours < 18 ? 'Good afternoon' :
    'Good evening';

  return (
    <Card className="relative p-8 md:p-12 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up
                     bg-[var(--card)] border border-[var(--border)]">
      {/* Subtle brand gradient overlay for visual interest, using the defined gradient-brand */}
      <div className="absolute inset-0 opacity-10" style={{ background: 'var(--gradient-brand)' }}></div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon with accent background and primary color, plus a gentle pulse animation */}
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center mb-6 shadow-md">
          <Sparkles className="w-10 h-10 text-[var(--primary)] animate-pulse" />
        </div>
        
        {/* Main greeting with dynamic time-based message and Kamusi logo styling */}
        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[var(--foreground)] mb-4">
          {greeting}, welcome to your <span className="kamusi-logo">Kamusi</span> workspace!
        </h1>
        {/* Descriptive text using muted-foreground for softer contrast */}
        <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-2xl">
          Ready to dive into new knowledge or continue your learning journey? Your personalized AI-powered courses await.
        </p>
        
        {/* Action buttons, styled with btn-primary and a custom outline variant */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* This is where the AddCourseDialog is integrated */}
          <AddCourseDialog>
            <Button size="lg" className="btn-primary !text-base !h-14 !px-8">
              <GraduationCap className="w-5 h-5 mr-2" /> Start a New Course
            </Button>
          </AddCourseDialog>
          <Link href="/workspace/learning">
            <Button 
              size="lg" 
              variant="outline" 
              className="!text-base !h-14 !px-8 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary-foreground)]"
            >
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default Welcome;
