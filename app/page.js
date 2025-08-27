'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import Image from "next/image"; 

const Glow = () => (
  <div className="absolute -z-10 top-1/2 left-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] -translate-x-1/2 -translate-y-1/2">
    <div className="absolute w-full h-full bg-[var(--primary)] rounded-full blur-[80px] md:blur-[120px] animate-pulse opacity-15" /> 
    <div className="absolute w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--secondary)] rounded-full blur-[50px] md:blur-[80px] animate-pulse animation-delay-2000 opacity-20" /> 
  </div>
);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-body overflow-x-hidden">
      
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-lg border-b border-border' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/">
            <div className="relative">
              <Image 
                src="/logo-main.png" 
                alt="Kamusi AI Logo - AI powered course generator"
                width={80}
                height={80}
                className="h-12 sm:h-16 md:h-20 w-auto relative z-10 transition-transform duration-300 hover:scale-105 
                          drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] brightness-[1.1] saturate-125"
              />
              <div className="absolute inset-0 z-0 blur-[60px] rounded-full bg-[oklch(0.75_0.2_280/_0.2)]" />
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4"> 
            <Link href="/blog-main" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/workspace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/workspace">
              <Button className="btn-primary text-sm px-4 py-2 h-auto sm:px-5"> 
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative container mx-auto flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 pt-24 pb-12 md:pt-32 md:pb-16 gap-8 lg:gap-12"> 
        <Glow />
        <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 !leading-tight font-heading"> 
            From Curiosity to<br/> <span className="kamusi-logo !text-4xl sm:!text-5xl md:!text-7xl">Competence.</span> AI-Powered Learning. 
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0">
            Stop searching, start learning. Kamusi AI uses artificial intelligence to build structured, personalized courses on any topic you can imagine. Your journey to mastery begins now.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <Link href="/workspace">
              <Button size="lg" className="btn-primary !text-base !h-12 !px-6 sm:!h-14 sm:!px-8"> 
                Create Your First Course
              </Button>
            </Link>
            <Link href="/blog-main">
              <Button size="lg" className="btn-secondary !text-base !h-12 !px-6 sm:!h-14 sm:!px-8"> 
                Read Our Blog
              </Button>
            </Link>
          </div>
        </div>

        <div className="lg:w-1/2 w-full mt-8 lg:mt-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-2xl shadow-secondary/10">
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                <div className="w-full bg-background/50 rounded-md p-3 mb-3">
                    <p className="text-xs text-muted-foreground">Topic:</p>
                    <p className="font-semibold text-foreground text-sm sm:text-base">The Renaissance: Art & Innovation</p> 
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

      <section className="px-4 sm:px-6 py-16 md:py-24 bg-muted/50"> 
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12"> 
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">The Smartest Way to Learn with AI</h2> 
            <p className="text-base md:text-md text-muted-foreground mt-3 md:mt-4"> 
              Kamusi isn't just another search engine. It's a structured learning platform built for deep understanding and long-term retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"> 
            <FeatureCard
              icon={BrainCircuit}
              title="Intelligent Curriculum Generation"
              desc="Our AI analyzes millions of sources to design a logical, comprehensive course outline, from core concepts to advanced topics."
            />
            <FeatureCard
              icon={BookOpen}
              title="Learn Any Topic with AI"
              desc="From quantum physics to classical guitar, if you can name it, Kamusi can teach it. The universe of knowledge is at your fingertips."
            />
            <FeatureCard
              icon={Zap}
              title="Instant & Focused AI Lessons"
              desc="No more piecing together random tutorials. Get a complete, tailored learning path in seconds and start mastering new skills today."
            />
          </div>
        </div>
      </section>
    
      <section className="px-4 sm:px-6 py-16 md:py-24 text-center"> 
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">Ready to Unleash Your Curiosity?</h2>
            <p className="text-base md:text-lg text-muted-foreground mt-3 md:mt-4 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join thousands of learners who are turning their interests into expertise. Your first AI-generated course is just a click away.
            </p>
            <Link href="/workspace">
              <Button size="lg" className="btn-primary !text-base !h-12 !px-6 sm:!h-14 sm:!px-8"> 
                Start Learning for Free
              </Button>
            </Link>
          </div>
      </section>

      <footer className="py-6 md:py-8 border-t border-border text-center text-muted-foreground text-xs sm:text-sm"> 
        <div className="container mx-auto px-4 sm:px-6"> 
          &copy; {new Date().getFullYear()} Kamusi. Built for the endlessly curious.
        </div>
      </footer>
    </main>
  );
}
