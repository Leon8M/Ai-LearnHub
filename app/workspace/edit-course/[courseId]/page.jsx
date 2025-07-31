"use client";
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Courseinfo from '../_components/Courseinfo';
import ChapterTopList from '../_components/ChapterTopList';
import { Loader2 } from 'lucide-react'; // Import Loader2 for custom skeleton

function EditCourse({viewCourse = false}) {
    const {courseId} = useParams();
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState(null);

    console.log("Editing course with ID:", courseId);

    // Fetch course details when the component mounts
    useEffect(() => {
        GetCourse();
    }, [courseId]) // Added courseId to dependency array to refetch if ID changes

    // Function to fetch course details
    const GetCourse = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/courses?courseId=' + courseId);
            console.log("Course details:", response.data);
            setCourse(response.data);
        } catch (error) {
            console.error("Error fetching course details:", error);
            // Optionally, display an error message to the user
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className="p-4 md:p-6 space-y-8"> {/* Added padding and spacing */}
      {loading ? (
        <div className="bg-[var(--muted)] h-64 rounded-xl animate-pulse flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-[var(--muted-foreground)] animate-spin" />
        </div>
      ) : (
        <>
          <Courseinfo course={course} viewCourse={viewCourse} />
          <ChapterTopList course={course} />
        </>
      )}
    </div>
  )
}

export default EditCourse
