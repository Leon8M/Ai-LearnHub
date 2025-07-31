'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EnrolledCard from './EnrolledCard';
import { Loader2 } from 'lucide-react'; // For the loading spinner

function EnrolledCourseList() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true); // To differentiate initial load from subsequent polls

  const fetchEnrolledCourses = async () => {
    // Only show full loading spinner on initial load or if the list becomes empty
    if (isInitialLoad || enrolledCourses.length === 0) {
      setLoading(true);
    }
    try {
      const result = await axios.get('/api/enroll');
      // Only update state if data has actually changed to prevent unnecessary re-renders
      if (JSON.stringify(result.data) !== JSON.stringify(enrolledCourses)) {
        setEnrolledCourses(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrolled courses', error);
      // Optionally, set an error state here to display a message to the user
    } finally {
      setLoading(false);
      setIsInitialLoad(false); // Mark initial load as complete
    }
  };

  useEffect(() => {
    // Fetch courses immediately on component mount
    fetchEnrolledCourses();

    // Set up interval for periodic updates (e.g., every 30 seconds)
    const refreshInterval = setInterval(fetchEnrolledCourses, 2000); // 30 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(refreshInterval);
  }, [enrolledCourses]); // Added enrolledCourses to dependency array to re-run if data changes,
                        // this helps in preventing unnecessary API calls if data is already up-to-date.


  return (
    <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold font-heading text-[var(--foreground)] mb-6">Enrolled Courses</h2>

      {loading && isInitialLoad ? ( // Show full loading spinner only on initial load
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-[var(--muted)] h-48 rounded-xl animate-pulse flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-[var(--muted-foreground)] animate-spin" />
            </div>
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">You haven’t enrolled in any courses yet. Start a new course to see it here!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledCourses.map((data) => (
            <EnrolledCard
              course={data?.courses} // Pass the course details
              enrollCourse={data?.enrollments} // Pass the enrollment details
              key={data?.courses?.cid || data?.enrollments?.id || Math.random()} // More robust key
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EnrolledCourseList;
