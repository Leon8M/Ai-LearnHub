import React from 'react';
import Welcome from './_components/Welcome';
import CourseList from './_components/CourseList';
import EnrolledCourseList from './_components/EnrolledCourseList';

function Workspace() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <Welcome />
      <EnrolledCourseList />
      <CourseList />
    </div>
  );
}

export default Workspace;
