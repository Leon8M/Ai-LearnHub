'use client';
import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import EnrolledCard from './EnrolledCard';
import { Loader2, BookOpenCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { TooltipProvider } from '@/components/ui/tooltip';

function EnrolledCourseList() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const { isSignedIn } = useUser();

  const fetchEnrolledCourses = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      setEnrolledCourses([]);
      return;
    }

    if (enrolledCourses.length === 0) {
      setLoading(true);
    }
    setError(null); 

    try {
      const response = await axios.get('/api/enroll');

      const processedCourses = response.data.map(enrollment => {
        const course = enrollment.courses;
        if (course?.courseContent && typeof course.courseContent === 'string') {
          try {
            course.courseContent = JSON.parse(course.courseContent);
          } catch (e) {
            //console.error("Failed to parse courseContent for enrolled course:", course.cid, e);
            course.courseContent = [];
          }
        }
        return { ...enrollment, courses: course };
      });

      if (JSON.stringify(processedCourses) !== JSON.stringify(enrolledCourses)) {
        setEnrolledCourses(processedCourses);
      }
    } catch (err) {
      //console.error('Failed to fetch enrolled courses:', err);
      setError('Failed to load your enrolled courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, enrolledCourses]); 

  useEffect(() => {
    if (isSignedIn) {
      fetchEnrolledCourses();
    } else if (isSignedIn === false) {
      setLoading(false);
      setEnrolledCourses([]);
    }

    const refreshInterval = isSignedIn ? setInterval(fetchEnrolledCourses, 5000) : null;

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isSignedIn, fetchEnrolledCourses]);

  return (
    <TooltipProvider> 
      <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] mb-6 flex items-center gap-2">
          <BookOpenCheck className="text-[var(--primary)] w-8 h-8" /> Your Enrolled Courses
        </h2>

        {enrolledCourses.length === 0 && loading ? (
          <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-[var(--muted)] h-52 rounded-xl animate-pulse flex items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-[var(--muted-foreground)] animate-spin" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-[var(--destructive)]">
            <p className="text-lg">{error}</p>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'
          >
            {enrolledCourses.map((enrollment) => (
              <motion.div
                key={enrollment?.courses?.cid || enrollment?.enrollments?.id || Math.random()}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <EnrolledCard
                  course={enrollment.courses}
                  enrollCourse={enrollment.enrollments}
                  refreshList={fetchEnrolledCourses}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className='text-center py-10'>
            <p className='text-[var(--muted-foreground)] text-lg mb-6'>You haven't enrolled in any courses yet.</p>
            <p className='text-[var(--muted-foreground)] text-sm'>Explore available courses to start your learning journey!</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default EnrolledCourseList;
