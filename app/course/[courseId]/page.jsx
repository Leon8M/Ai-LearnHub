"use client";
import MainHeader from '@/app/workspace/_components/MainHeader';
import React, { useEffect, useState } from 'react';
import ChapterSidebar from '../_components/ChapterSidebar';
import Content from '../_components/Content';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

function Course() {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetEnrolledCourseById();
  }, []);

  const GetEnrolledCourseById = async () => {
    const result = await axios.get('/api/enroll?courseId=' + courseId);
    setCourseInfo(result.data);
    setLoading(false);
  };

  return (
    <div>
      <MainHeader hideSide={true} courseId={courseId} />
      
      {/* Mobile-only show chapter button */}
      <div className="md:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex gap-2 items-center"><Menu /> Show Chapters</Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] p-0 overflow-y-auto">
            <ChapterSidebar courseInfo={courseInfo} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-4 p-4">
        {loading ? (
          <Skeleton className="w-full h-64" />
        ) : (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <ChapterSidebar courseInfo={courseInfo} />
            </div>
            <div className="flex-1">
              <Content courseInfo={courseInfo} refreshData={GetEnrolledCourseById} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Course;
