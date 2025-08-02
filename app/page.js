'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// A new component for the glowing effect in the hero section
const Glow = () => (
  <div className="absolute -z-10 top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] -translate-x-1/2 -translate-y-1/2">
    {/* Adjusted blur and opacity for a more encompassing glow */}
    <div className="absolute w-full h-full bg-[var(--primary)] rounded-full blur-[100px] md:blur-[150px] animate-pulse opacity-20" />
    <div className="absolute w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--secondary)] rounded-full blur-[70px] md:blur-[100px] animate-pulse animation-delay-2000 opacity-25" />
  </div>
);

// A new component for the feature cards to keep the main component clean
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <Card className="p-6 bg-card rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 hover-scale text-center flex flex-col items-center">
    <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-secondary" />
    </div>
    <h4 className="font-bold text-lg text-foreground mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </Card>
);

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-body overflow-x-hidden">
      
      {/* HEADER */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-lg border-b border-border' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3"> {/* Adjusted px for smaller screens */}
          <Link href="/">
            {/* Using the actual logo image with dynamic size and a more pronounced "holo" effect */}
            <div className="relative">
              <img 
                src="/logo-main.png" 
                alt="Kamusi Logo"
                // Dynamic height: h-12 on small, h-16 on medium, h-20 on large
                className="h-12 sm:h-16 md:h-20 w-auto relative z-10 transition-transform duration-300 hover:scale-105 
                           drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] brightness-[1.2] saturate-150" 
              />
              {/* Adjusted blur and opacity for a more encompassing glow */}
              {/* This glow is relative to the image wrapper, so its size will scale with the image */}
              <div className="absolute inset-0 z-0 blur-[80px] rounded-full bg-[oklch(0.75_0.2_280/_0.4)]" />
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4"> {/* Adjusted gap for smaller screens */}
            <Link href="/workspace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/workspace">
              <Button className="btn-primary text-sm px-4 py-2 h-auto sm:px-5"> {/* Adjusted px for smaller screens */}
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative container mx-auto flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 pt-24 pb-12 md:pt-32 md:pb-16 gap-8 lg:gap-12"> {/* Adjusted padding and gap */}
        <Glow />
        <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 !leading-tight font-heading"> {/* Adjusted text size for smaller screens */}
            From Curiosity to<br/> <span className="kamusi-logo !text-4xl sm:!text-5xl md:!text-7xl">Competence.</span> Instantly. {/* Adjusted text size for smaller screens */}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0"> {/* Adjusted text size and mb */}
            Stop searching, start learning. Kamusi uses AI to build structured, personalized courses on any topic you can imagine. Your journey to mastery begins now.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <Link href="/workspace">
              <Button size="lg" className="btn-primary !text-base !h-12 !px-6 sm:!h-14 sm:!px-8"> {/* Adjusted button size for mobile */}
                Create Your First Course
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 w-full mt-8 lg:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Inspired by the Breyta video preview */}
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-2xl shadow-secondary/10">
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                <div className="w-full bg-background/50 rounded-md p-3 mb-3">
                    <p className="text-xs text-muted-foreground">Topic:</p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">The Renaissance: Art & Innovation</p> {/* Adjusted text size */}
                </div>
                <div className="w-full bg-background/50 rounded-md p-3 space-y-2">
                    <div className="w-full h-3 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-3/4 h-3 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-5/6 h-3 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Generating your personalized course...</p>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-4 sm:px-6 py-16 md:py-24 bg-muted/50"> {/* Adjusted padding */}
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12"> {/* Adjusted mb */}
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">The Smartest Way to Learn</h2> {/* Adjusted text size */}
            <p className="text-base md:text-md text-muted-foreground mt-3 md:mt-4"> {/* Adjusted text size and mt */}
              Kamusi isn't just another search engine. It's a structured learning platform built for deep understanding and long-term retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"> {/* Adjusted gap */}
            <FeatureCard
              icon={BrainCircuit}
              title="Intelligent Curriculum"
              desc="Our AI analyzes millions of sources to design a logical, comprehensive course outline, from core concepts to advanced topics."
            />
            <FeatureCard
              icon={BookOpen}
              title="Learn Anything, Literally"
              desc="From quantum physics to classical guitar, if you can name it, Kamusi can teach it. The universe of knowledge is at your fingertips."
            />
            <FeatureCard
              icon={Zap}
              title="Instant & Focused"
              desc="No more piecing together random tutorials. Get a complete, tailored learning path in seconds and start mastering new skills today."
            />
          </div>
        </div>
      </section>
      
      {/* FINAL CTA SECTION */}
      <section className="px-4 sm:px-6 py-16 md:py-24 text-center"> {/* Adjusted padding */}
           <div className="container mx-auto">
             <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Ready to Unleash Your Curiosity?</h2> {/* Adjusted text size */}
             <p className="text-base md:text-lg text-muted-foreground mt-3 md:mt-4 mb-6 md:mb-8 max-w-2xl mx-auto"> {/* Adjusted text size and mb */}
               Join thousands of learners who are turning their interests into expertise. Your first AI-generated course is just a click away.
             </p>
             <Link href="/workspace">
               <Button size="lg" className="btn-primary !text-base !h-12 !px-6 sm:!h-14 sm:!px-8"> {/* Adjusted button size for mobile */}
                 Start Learning for Free
               </Button>
             </Link>
           </div>
      </section>


      {/* FOOTER */}
      <footer className="py-6 md:py-8 border-t border-border text-center text-muted-foreground text-xs sm:text-sm"> {/* Adjusted padding and text size */}
        <div className="container mx-auto px-4 sm:px-6"> {/* Adjusted padding */}
          &copy; {new Date().getFullYear()} Kamusi. Built for the endlessly curious.
        </div>
      </footer>
    </main>
  );
}
