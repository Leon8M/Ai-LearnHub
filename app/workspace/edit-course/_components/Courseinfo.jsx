'use client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { Book, Clock, PlayIcon, Sparkle, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';

function Courseinfo({ course, viewCourse }) {
  const courseLayout = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const GenerateContent = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/generate-course', {
        course: courseLayout,
        courseName: course?.name,
        courseId: course?.cid,
      });
      setLoading(false);
      toast.success('Content generated successfully!');
      router.replace(`/workspace`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-white border rounded-xl shadow-md overflow-hidden p-6">
      {course?.bannerImageUrl && (
        <div className="md:w-1/2 w-full">
          <Image
            src={course?.bannerImageUrl}
            alt={course?.name || 'Course banner'}
            width={800}
            height={300}
            className="rounded-lg w-full h-64 object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 md:w-1/2 w-full justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{courseLayout?.name}</h1>
          <p className="text-gray-600 mt-2">{courseLayout?.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
            <Clock className="text-primary" />
            <div>
              <p className="font-medium">Duration</p>
              <p>2 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg">
            <Book className="text-primary" />
            <div>
              <p className="font-medium">Chapters</p>
              <p>{courseLayout?.chapters?.length || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg col-span-1 sm:col-span-2">
            <TrendingUp className="text-primary" />
            <div>
              <p className="font-medium">Difficulty</p>
              <p>{courseLayout?.difficulty || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          {!viewCourse ? (
            <Button disabled={loading} onClick={GenerateContent} className="w-full md:w-auto">
              {loading ? 'Generating...' : (
                <>
                  <Sparkle className="w-4 h-4 mr-2" />
                  Generate Course Content
                </>
              )}
            </Button>
          ) : (
            <Link href={`/course/${course?.cid}`}>
              <Button className="w-full md:w-auto">
                <PlayIcon className="w-4 h-4 mr-2" />
                Continue Course
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courseinfo;
