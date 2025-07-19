'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { SearchCode, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CourseCard from '../_components/CourseCard';
import { Skeleton } from '@/components/ui/skeleton';

function Explore() {
  const [courseList, setCourseList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && GetCourseList();
  }, [user]);

  const GetCourseList = async () => {
    const response = await axios.get('/api/courses?courseId=all');
    setCourseList(response.data);
    setFilteredCourses(response.data);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return setFilteredCourses(courseList);
    const filtered = courseList.filter(course =>
      course.courses?.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-gray-800">
          <Sparkles className="text-yellow-500 w-6 h-6" />
          Explore Other Courses
        </h2>
      </div>

      <div className="flex items-center gap-3 mb-8 max-w-lg">
        <Input
          placeholder="Search for courses..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
        />
        <Button
          onClick={handleSearch}
          className="bg-[#00A9FF] hover:bg-[#008FD4] text-white flex items-center gap-1"
        >
          <SearchCode className="w-4 h-4" />
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))
        ) : (
          [1, 2, 3, 4, 5, 6].map((_, index) => (
            <Skeleton className="w-full h-48 rounded-lg" key={index} />
          ))
        )}
      </div>
    </div>
  );
}

export default Explore;
