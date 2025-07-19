"use client";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EnrolledCard from './EnrolledCard';

function EnrolledCourseList() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const result = await axios.get('/api/enroll');
      setEnrolledCourses(result.data);
    } catch (error) {
      console.error('Failed to fetch enrolled courses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
    const refreshOnEnroll = setInterval(fetchEnrolledCourses, 10000); // optional auto-refresh every 10s
    return () => clearInterval(refreshOnEnroll);
  }, []);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Enrolled Courses</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-neutral-800 h-48 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <p className="text-sm text-muted-foreground">You haven’t enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledCourses.map((course, index) => (
            <EnrolledCard
              course={course?.courses}
              key={index}
              enrollCourse={course?.enrollments}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EnrolledCourseList;
