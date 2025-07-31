'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import AddCourseDialog from './AddCourseDialog';
import CourseCard from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton'; // Although replaced, keeping import for context
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // For loading spinner

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const GetCourseList = async () => {
    setLoading(true); // Set loading true before fetching
    try {
      const response = await axios.get('/api/courses');
      setCourseList(response.data);
    } catch (error) {
      console.error('Failed to fetch course list', error);
      // Optionally, set an error state to display a message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch courses when user object is available
    if (user) {
      GetCourseList();
    }
  }, [user]);

  return (
    <div className='p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md'>
      <h2 className='text-3xl font-bold font-heading text-[var(--foreground)] mb-6'>Your Courses</h2>

      {loading ? (
        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-[var(--muted)] h-52 rounded-xl animate-pulse flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-[var(--muted-foreground)] animate-spin" />
            </div>
          ))}
        </div>
      ) : courseList.length > 0 ? (
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
          {courseList.map((course) => (
            <motion.div
              key={course?.cid || Math.random()}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className='text-center py-10'>
          <p className='text-[var(--muted-foreground)] text-lg mb-6'>No courses yet. Let’s get started!</p>
          {/* Ensure there is ONLY ONE direct child element for AddCourseDialog */}
          <AddCourseDialog>
            <Button className="btn-primary !text-base !h-14 !px-8">Create your first Course</Button>
          </AddCourseDialog>
        </div>
      )}
    </div>
  );
}

export default CourseList;
