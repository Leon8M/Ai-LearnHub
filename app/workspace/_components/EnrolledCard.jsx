'use client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import React, { useState } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import axios from 'axios';
import CategoryIconCard from './CategoryIconCard';

function EnrolledCard({ course, enrollCourse, refreshList }) {
  const courseJson = course?.courseJson?.course;
  const [unenrollLoading, setUnenrollLoading] = useState(false);

  // Function to calculate progress percentage
  const calcProgress = () => {
    let parsedCourseContent = course?.courseContent;
    if (typeof parsedCourseContent === 'string') {
      try {
        parsedCourseContent = JSON.parse(parsedCourseContent);
      } catch (e) {
        //console.error("Failed to parse courseContent in EnrolledCard:", e);
        parsedCourseContent = [];
      }
    }

    const totalChapters = parsedCourseContent?.length || 1;
    const completed = enrollCourse?.completedChapters?.length || 0;
    return totalChapters > 0 ? ((completed / totalChapters) * 100) : 0;
  };

  const progressValue = calcProgress();

  // Function to handle unenrollment
  const handleUnenroll = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm("Are you sure you want to unenroll from this course? This action cannot be undone.")) {
      return;
    }

    setUnenrollLoading(true);
    try {
      const response = await axios.delete('/api/enroll', {
        data: { courseId: course?.cid }
      });

      if (response.data.success) {
        toast.success("Successfully unenrolled from the course!");
        if (refreshList) {
          refreshList();
        }
      } else {
        toast.error(response.data.error || "Failed to unenroll. Please try again.");
      }
    } catch (error) {
      //console.error("Failed to unenroll:", error);
      toast.error(error.response?.data?.error || "Failed to unenroll. Please try again.");
    } finally {
      setUnenrollLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-[var(--background)]/80 text-[var(--muted-foreground)] hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)] transition-colors duration-200"
            onClick={handleUnenroll}
            disabled={unenrollLoading}
          >
            {unenrollLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-[var(--popover)] text-[var(--popover-foreground)] border-[var(--border)] shadow-md">
          <p>Unenroll from course</p>
        </TooltipContent>
      </Tooltip>

      <CategoryIconCard 
        category={course?.bannerImageUrl || courseJson?.category || 'Default'} 
        className="w-full h-44 rounded-lg overflow-hidden"
      />

      <div className="flex flex-col gap-2 px-1">
        <h2 className="text-lg font-bold text-[var(--foreground)] font-heading">{courseJson?.name || "Untitled Course"}</h2>
        <p className="text-[var(--muted-foreground)] text-sm line-clamp-3">{courseJson?.description || "No description available."}</p>

        <div className="mt-2">
          <div className="flex justify-between items-center text-sm text-[var(--muted-foreground)] mb-1">
            <span>Progress</span>
            <span>{progressValue.toFixed(0)}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-[var(--accent)] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--primary)]" />

          <Link href={`/course/${course?.cid}`}>
            <Button className="btn-primary mt-3 w-full">Continue</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnrolledCard;
