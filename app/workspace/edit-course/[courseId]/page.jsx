"use client";
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Courseinfo from '../_components/Courseinfo';
import ChapterTopList from '../_components/ChapterTopList';
import { Skeleton } from '@/components/ui/skeleton';

function EditCourse({viewCourse = false}) {
    const {courseId} = useParams();
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState(null);

    console.log("Editing course with ID:", courseId);

    // Fetch course details when the component mounts
    useEffect(() => {
        GetCourse();
    }, [])

    // Function to fetch course details
    const GetCourse = async () => {
        setLoading(true);
        const response = await axios.get('/api/courses?courseId=' + courseId);
        console.log("Course details:", response.data);
        setLoading(false);
        setCourse(response.data);
    }
  return (
    <div>
      {loading ? <Skeleton className='w-full h-40 rounded-lg' /> : (
        <>
          <Courseinfo course={course} viewCourse={viewCourse} />
          <ChapterTopList course={course} />
        </>
      )}
    </div>
  )
}

export default EditCourse