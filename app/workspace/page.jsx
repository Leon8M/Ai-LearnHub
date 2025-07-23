import React from 'react';
import Welcome from './_components/Welcome';
import CourseList from './_components/CourseList';
import EnrolledCourseList from './_components/EnrolledCourseList';
import AdSlot from '@/components/ui/AdSlot';

function Workspace() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <Welcome />
      <EnrolledCourseList />
      <CourseList />
      <AdSlot 
                  adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                  adSlot="1201219188"
                    />
    </div>
  );
}

export default Workspace;
