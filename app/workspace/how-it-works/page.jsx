'use client';
import { Lightbulb, BrainCog, Youtube, FileText, BookPlus, Rocket, Gem, HandCoins } from 'lucide-react'; // Added Gem and HandCoins
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion'; // For subtle animations

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 bg-[var(--background)] min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-12 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-8"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-extrabold font-heading text-[var(--foreground)] mb-4 animate-fade-in-down"
        >
          How <span className="kamusi-logo">Kamusi AI</span> Works
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto"
        >
          Unlock personalized learning experiences with the power of AI. Here's your step-by-step guide to generating incredible courses.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-10"
      >
        {/* Step 1: Create a Course */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <BookPlus className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">1. Define Your Course Idea</h2>
            <p className="text-[var(--muted-foreground)]">
              Begin your journey by clicking the <span className="font-medium text-[var(--primary)]">"Create New Course"</span> button. You'll provide a course name, a brief description, target audience, and the desired direction. This initial input guides our AI.
            </p>
          </div>
        </motion.div>

        {/* Step 2: Token Requirement & Acquisition */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <Gem className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">2. Tokens for Creation</h2>
            <p className="text-[var(--muted-foreground)] mb-3">
              Generating a comprehensive course requires **tokens**. Each course generation consumes one token. If you're out of tokens, don't worry!
            </p>
            <p className="text-[var(--muted-foreground)] flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-[var(--primary)]" />
              Visit the <Link href="/workspace/buy-tokens" className="text-[var(--primary)] hover:underline font-medium">"Get Tokens"</Link> page. You can earn a new token by watching just two short ads.
            </p>
          </div>
        </motion.div>

        {/* Step 3: AI Generates Course Layout */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <BrainCog className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">3. Kamusi AI Crafts the Course Skeleton</h2>
            <p className="text-[var(--muted-foreground)]">
              Your input is sent to the powerful **Gemini AI** to generate the initial course structure. This includes a detailed outline of chapters, key topics for each, estimated durations, and a compelling banner image prompt.
            </p>
          </div>
        </motion.div>

        {/* Step 4: Deep Content Generation */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <FileText className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">4. Detailed Content for Every Topic</h2>
            <p className="text-[var(--muted-foreground)]">
              Once the skeleton is approved, each topic is individually processed by **Gemini AI** again. This step generates rich, comprehensive content, including definitions, explanations, practical examples, and step-by-step breakdowns, forming the core of your lessons.
            </p>
          </div>
        </motion.div>

        {/* Step 5: Relevant YouTube Videos */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <Youtube className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">5. Curated Video Resources</h2>
            <p className="text-[var(--muted-foreground)]">
              To enhance your multi-modal learning experience, we integrate with the **YouTube API**. For each chapter, we fetch high-quality, relevant video tutorials and lectures, embedding them directly into your course to provide diverse perspectives.
            </p>
          </div>
        </motion.div>

        {/* Step 6: Learn & Grow */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex-shrink-0 bg-[var(--accent)] rounded-full p-3 flex items-center justify-center shadow-md">
            <Rocket className="text-[var(--primary)] h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-heading text-[var(--foreground)] mb-2">6. Begin Your Learning Journey!</h2>
            <p className="text-[var(--muted-foreground)]">
              Your custom-generated course is now complete and ready! Dive into the content, track your progress, mark chapters as complete, and revisit topics anytime. Kamusi AI is your personalized learning companion.
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center mt-16">
        <Link href="/workspace">
          <Button size="lg" className="btn-primary !text-lg !h-14 !px-8">
            Go to My Workspace
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
