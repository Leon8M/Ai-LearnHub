import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function EnrolledCard({ course, enrollCourse }) {
  const courseJson = course?.courseJson?.course;

  // Calculate progress as percentage
  const calcProgress = () => {
    const totalChapters = course?.courseContent?.length || 1;
    const completed = enrollCourse?.completedChapters?.length || 0;
    return ((completed / totalChapters) * 100).toFixed(1);
  };

  return (
    <div className="bg-[#f9f9f9] border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3">
      <Image
        src={course?.bannerImageUrl}
        alt={course?.name}
        width={300}
        height={200}
        className="rounded-lg w-full h-44 object-cover"
      />

      <div className="flex flex-col gap-2 px-1">
        <h2 className="text-lg font-bold text-gray-800">{courseJson?.name}</h2>
        <p className="text-gray-600 text-sm line-clamp-3">{courseJson?.description}</p>

        <div className="mt-2">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{calcProgress()}%</span>
          </div>
          <Progress value={calcProgress()} className="h-2" />

          <Link href={`/workspace/view-course/${course?.cid}`}>
            <Button variant="default" className="mt-3 w-full">Continue</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EnrolledCard;
