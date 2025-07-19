'use client';

import { Button } from "@/components/ui/button";
import { BookOpen, Bot, Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md bg-white">
        <h1 className="text-2xl font-bold text-primary">AI LearnHub</h1>
        <Link href="/workspace">
          <Button className="bg-primary text-white hover:bg-primary/90">Get Started</Button>
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 gap-12">
        {/* LEFT TEXT BLOCK */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-4 text-primary">Learn Anything with AI</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Use the power of AI to generate customized courses on any topic you want — instantly.
            Whether you're curious about Web Development, Physics, Philosophy, or even Gardening,
            we’ve got you covered with intelligent learning paths and engaging materials.
          </p>
          <Link href="/workspace">
            <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90">
              Start Learning Now
            </Button>
          </Link>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="md:w-1/2">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/projects-2025-71366.firebasestorage.app/o/ai-guru-lab-images%2F1750083464250.png?alt=media&token=b09f4fdc-1958-4158-85a6-d961041c574d"
            alt="AI generated course illustration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-8 py-12 bg-muted text-muted-foreground">
        <h3 className="text-2xl font-bold text-center mb-8 text-primary">Why Learn With AI?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <Bot className="w-10 h-10 text-secondary mb-2" />
            <h4 className="font-semibold text-lg text-foreground">AI-Generated Courses</h4>
            <p className="text-sm text-center mt-2">Our smart AI builds a course layout tailored to your chosen topic and level.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <BookOpen className="w-10 h-10 text-secondary mb-2" />
            <h4 className="font-semibold text-lg text-foreground">Topic Flexibility</h4>
            <p className="text-sm text-center mt-2">Explore any subject — from programming to philosophy — instantly.</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <Rocket className="w-10 h-10 text-secondary mb-2" />
            <h4 className="font-semibold text-lg text-foreground">Fast & Personalized</h4>
            <p className="text-sm text-center mt-2">No fluff. You get a streamlined curriculum based on your needs and goals.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} AI LearnHub. Built for self-driven learning.
      </footer>
    </main>
  );
}
