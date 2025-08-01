'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Search, Sparkles, Loader2 } from 'lucide-react'; // Changed SearchCode to Search, added Loader2
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import CourseCard from '../_components/CourseCard';
import { Skeleton } from '@/components/ui/skeleton'; // Keeping import for reference, replaced with custom skeleton

function Explore() {
  const [courseList, setCourseList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const { user } = useUser();

  const GetCourseList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/courses?courseId=all');
      
      // Process courseContent if it's a string (from Drizzle's JSON type)
      const processedCourses = response.data.map(course => {
        if (course.courseContent && typeof course.courseContent === 'string') {
          try {
            course.courseContent = JSON.parse(course.courseContent);
          } catch (e) {
            console.error("Failed to parse courseContent for course:", course.cid, e);
            course.courseContent = []; // Fallback
          }
        }
        return course;
      });

      setCourseList(processedCourses);
      setFilteredCourses(processedCourses); // Initialize filtered list with all courses
    } catch (error) {
      console.error('Failed to fetch course list', error);
      // Handle error display
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is stable and won't recreate

  useEffect(() => {
    if (user) {
      GetCourseList();
    }
  }, [user, GetCourseList]); // Add GetCourseList to dependencies

  // Improved Search Algorithm
  const handleSearch = useCallback(() => {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (!trimmedSearchTerm) {
      setFilteredCourses(courseList); // Show all courses if search term is empty
      return;
    }

    const searchWords = trimmedSearchTerm.split(/\s+/).filter(Boolean); // Split by space, remove empty strings

    const scoredCourses = courseList.map(course => {
      let score = 0;
      const courseName = course?.courseJson?.course?.name?.toLowerCase() || '';
      const courseDescription = course?.courseJson?.course?.description?.toLowerCase() || '';
      const courseCategory = course?.courseJson?.course?.category?.toLowerCase() || '';
      
      let chapterTopicsContent = '';
      if (course?.courseContent && Array.isArray(course.courseContent)) {
        course.courseContent.forEach(chapterWrapper => {
          // Access the actual chapter data within the 'value' property
          const chapterData = chapterWrapper?.value?.courseData; 
          if (chapterData) {
            chapterTopicsContent += (chapterData.chapterName?.toLowerCase() || '') + ' ';
            if (chapterData.topics && Array.isArray(chapterData.topics)) {
              chapterData.topics.forEach(topic => {
                chapterTopicsContent += (topic?.topic?.toLowerCase() || '') + ' ';
                // Optionally, include topic content if you want to search within the actual lesson text
                // chapterTopicsContent += (topic?.content?.toLowerCase() || '') + ' '; 
              });
            }
          }
        });
      }

      searchWords.forEach(word => {
        if (courseName.includes(word)) score += 5; // Higher score for name match
        if (courseDescription.includes(word)) score += 3;
        if (courseCategory.includes(word)) score += 4;
        if (chapterTopicsContent.includes(word)) score += 2; // Score for chapter/topic match
      });

      return { course, score };
    }).filter(item => item.score > 0) // Only keep courses that have at least one match
      .sort((a, b) => b.score - a.score); // Sort by score descending

    setFilteredCourses(scoredCourses.map(item => item.course));
  }, [searchTerm, courseList]); // Re-run if searchTerm or courseList changes

  // Trigger search when searchTerm changes (debounced if needed for performance on large lists)
  useEffect(() => {
    const handler = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce search by 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, handleSearch]);

  return (
    <div className="p-4 sm:p-6 bg-[var(--background)] min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading flex items-center gap-2 text-[var(--foreground)] mb-4 sm:mb-0">
          <Sparkles className="text-[var(--primary)] w-7 h-7" /> {/* Use primary color for Sparkles */}
          Explore Other Courses
        </h2>
        {/* Optional: Add a "Create New Course" button here if desired */}
      </div>

      <div className="flex items-center gap-3 mb-8 max-w-lg w-full">
        <Input
          placeholder="Search for courses by name, description, category, or topics..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="rounded-xl border-[var(--border)] shadow-sm focus:ring-[var(--ring)] focus:border-[var(--primary)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
        />
        <Button
          onClick={handleSearch}
          className="btn-primary flex items-center gap-1 !h-12 !px-6" // Use btn-primary class
        >
          <Search className="w-5 h-5" /> {/* Larger icon */}
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Custom Skeleton Loader
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-[var(--muted)] h-48 rounded-xl animate-pulse flex items-center justify-center shadow-md"
            >
              <Loader2 className="w-12 h-12 text-[var(--muted-foreground)] animate-spin" />
            </div>
          ))
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <CourseCard key={course?.cid || index} course={course} /> // Use course.cid as key
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md text-[var(--muted-foreground)]">
            <p className="text-lg">No courses found matching your search.</p>
            <p className="text-sm mt-2">Try a different keyword or create a new course!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
