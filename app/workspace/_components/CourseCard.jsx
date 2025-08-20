'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Link from 'next/link';
import { BookOpen, PlayCircle, PenTool, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CategoryIconCard from './CategoryIconCard';


function CourseCard({ course }) {
  const courseJson = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Function to calculate total duration of the course
  const onEnroll = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/enroll', {
        courseId: course?.cid
      });

      if (result.data?.alreadyEnrolled) {
        toast.warning("You are already enrolled in this course.");
        router.push(`/course/${course?.cid}`);
        return;
      }

      toast.success("Successfully enrolled!");
      router.push(`/course/${course?.cid}`);

    } catch (error) {
      //console.error("Failed to enroll:", error);
      toast.error(error.response?.data?.error || "Failed to enroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="group border border-[var(--border)] bg-[var(--card)] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
    >
      <CategoryIconCard 
        category={course?.bannerImageUrl || courseJson?.category || 'Default'}
        className="w-full h-44 rounded-t-xl overflow-hidden" 
      />

      <div className="p-4 space-y-3">
        <h2 className="text-xl font-semibold text-[var(--foreground)] font-heading line-clamp-1">{courseJson?.name || "Untitled Course"}</h2>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">{courseJson?.description || "No description available."}</p>

        <div className="flex items-center justify-between pt-3">
          <span className="flex items-center text-[var(--muted-foreground)] text-sm gap-1">
            <BookOpen className="w-4 h-4 text-[var(--primary)]" />
            {courseJson?.NoOfChapters || 0} Chapters
          </span>

          {course?.courseContent?.length ? (
            <Button
              size="sm"
              onClick={onEnroll}
              disabled={loading}
              className="btn-primary gap-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {loading ? "Enrolling..." : "Start Learning"}
            </Button>
          ) : (
            <Link href={`/workspace/edit-course/${course?.cid}`}>
              <Button size="sm" variant="outline" className="gap-1 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary-foreground)]">
                <PenTool className="w-4 h-4" />
                Generate It!
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default CourseCard;
