"use client";
import MainHeader from '@/app/workspace/_components/MainHeader';
import React, { useEffect, useState } from 'react';
import ChapterSidebar from '../_components/ChapterSidebar';
import Content from '../_components/Content';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext'; // Import context

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0); // State for selected chapter

  useEffect(() => {
    GetEnrolledCourseById();
  }, [courseId]); // Added courseId to dependency array to refetch if ID changes

  const GetEnrolledCourseById = async () => {
    setLoading(true);
    try {
      const result = await axios.get('/api/enroll?courseId=' + courseId);
      let fetchedCourseInfo = result.data;

      // --- CRITICAL FIX START ---
      // Check if courseContent exists and is a string, then parse it
      if (fetchedCourseInfo?.courses?.courseContent && typeof fetchedCourseInfo.courses.courseContent === 'string') {
        try {
          fetchedCourseInfo.courses.courseContent = JSON.parse(fetchedCourseInfo.courses.courseContent);
        } catch (parseError) {
          console.error("Failed to parse courseContent JSON:", parseError);
          // Fallback to an empty array if parsing fails to prevent further errors
          fetchedCourseInfo.courses.courseContent = [];
        }
      }
      // --- CRITICAL FIX END ---

      setCourseInfo(fetchedCourseInfo);
    } catch (error) {
      console.error("Error fetching enrolled course:", error);
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <SelectedChapterIndexContext.Provider value={{ selectedChapterIndex, setSelectedChapterIndex }}>
      <div className="bg-[var(--background)] min-h-screen">
        {/* MainHeader is outside the main content area */}
        <MainHeader hideSide={true} courseId={courseId} /> 
        
        {/* Mobile-only show chapter button */}
        <div className="md:hidden p-4 bg-[var(--background)] border-b border-[var(--border)]">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex gap-2 items-center border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)]">
                <Menu className="w-5 h-5" /> Show Chapters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] p-0 overflow-y-auto bg-[var(--background)] border-r border-[var(--border)]">
              <ChapterSidebar courseInfo={courseInfo} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
          {loading ? (
            <div className="flex-1 bg-[var(--muted)] h-[calc(100vh-150px)] rounded-xl animate-pulse flex items-center justify-center shadow-md">
                <Loader2 className="w-12 h-12 text-[var(--muted-foreground)] animate-spin" />
            </div>
          ) : (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden md:block w-full md:w-64 lg:w-80 flex-shrink-0">
                <ChapterSidebar courseInfo={courseInfo} />
              </div>
              <div className="flex-1">
                <Content courseInfo={courseInfo} refreshData={GetEnrolledCourseById} />
              </div>
            </>
          )}
        </div>
      </div>
    </SelectedChapterIndexContext.Provider>
  );
}

export default Course;
