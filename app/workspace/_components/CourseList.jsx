"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import AddCourseDialog from './AddCourseDialog';
import CourseCard from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

function CourseList() {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    user && GetCourseList();
  }, [user]);

  const GetCourseList = async () => {
    const response = await axios.get('/api/courses');
    setCourseList(response.data);
    setLoading(false);
  };

  return (
    <div className='p-6 bg-white border border-gray-200 rounded-xl shadow-sm'>
      <h2 className='text-3xl font-bold mb-6 text-gray-900'>Your Courses</h2>

      {loading ? (
        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className='w-full h-52 rounded-xl' />
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
          {courseList.map((course, index) => (
            <motion.div
              key={index}
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
        <div className='text-center'>
          <p className='text-gray-500 text-lg mb-4'>No courses yet. Let’s get started!</p>
          <AddCourseDialog>
            <Button>Create your first Course</Button>
          </AddCourseDialog>
        </div>
      )}
    </div>
  );
}

export default CourseList;
