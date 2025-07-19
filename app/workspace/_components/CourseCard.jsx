import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { IconBookOpen, IconPlayCircle, IconTools, PenTool, PlayCircle } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

function CourseCard({ course }) {
  const courseJson = course?.courseJson?.course;
  const [loading, setLoading] = useState(false);

  const onEnroll = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/enroll', {
        courseId: course?.cid
      });

      if (result.data?.alreadyEnrolled) {
        toast.warning("You are already enrolled in this course.");
        return;
      }

      toast.success("Successfully enrolled!");
    } catch (error) {
      toast.error("Failed to enroll. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="group border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
    >
      <div className="w-full h-44 bg-gradient-to-tr from-blue-100 via-white to-pink-100">
        <Image
          src={course?.bannerImageUrl}
          alt={course?.name}
          width={400}
          height={200}
          className="w-full h-full object-cover rounded-t-xl"
        />
      </div>

      <div className="p-4 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{courseJson?.name}</h2>
        <p className="text-sm text-gray-600 line-clamp-3">{courseJson?.description}</p>

        <div className="flex items-center justify-between pt-3">
          <span className="flex items-center text-gray-500 text-sm gap-1">
            <BookOpen className="w-4 h-4" />
            {courseJson?.NoOfChapters} Chapters
          </span>

          {course?.courseContent?.length ? (
            <Button
              size="sm"
              onClick={onEnroll}
              disabled={loading}
              className="gap-1"
            >
              <PlayCircle className="w-4 h-4" />
              {loading ? "Loading..." : "Start Learning"}
            </Button>
          ) : (
            <Link href={`/workspace/edit-course/${course?.cid}`}>
              <Button size="sm" variant="outline" className="gap-1">
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
