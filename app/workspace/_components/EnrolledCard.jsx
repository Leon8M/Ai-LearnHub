'use client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function EnrolledCard({ course, enrollCourse }) {
  // Ensure courseJson is safely accessed
  const courseJson = course?.courseJson?.course;

  // Calculate progress as percentage
  const calcProgress = () => {
    const totalChapters = course?.courseContent?.length || 1; // Avoid division by zero
    const completed = enrollCourse?.completedChapters?.length || 0;
    return totalChapters > 0 ? ((completed / totalChapters) * 100) : 0; // Return 0 if no chapters
  };

  const progressValue = calcProgress();

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">
      {/* Image with fallback */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden bg-[var(--muted)] flex items-center justify-center">
        {course?.bannerImageUrl ? (
          <Image
            src={course.bannerImageUrl}
            alt={course?.name || "Course Banner"}
            width={300}
            height={200}
            className="w-full h-full object-cover"
            // Fallback for broken images
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = "https://placehold.co/300x200/cccccc/333333?text=No+Image";
              e.target.alt = "Image not available";
            }}
          />
        ) : (
          <span className="text-[var(--muted-foreground)] text-sm">No Image Available</span>
        )}
      </div>

      <div className="flex flex-col gap-2 px-1">
        <h2 className="text-lg font-bold text-[var(--foreground)] font-heading">{courseJson?.name || "Untitled Course"}</h2>
        <p className="text-[var(--muted-foreground)] text-sm line-clamp-3">{courseJson?.description || "No description available."}</p>

        <div className="mt-2">
          <div className="flex justify-between items-center text-sm text-[var(--muted-foreground)] mb-1">
            <span>Progress</span>
            <span>{progressValue.toFixed(0)}%</span> {/* Display as whole number */}
          </div>
          {/* Progress bar styling */}
          <Progress value={progressValue} className="h-2 bg-[var(--accent)] [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--primary)]" />

          <Link href={`/workspace/view-course/${course?.cid}`}>
            <Button className="btn-primary mt-3 w-full">Continue</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnrolledCard;
