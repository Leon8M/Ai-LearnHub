import React, { useContext } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { CheckCircle, Circle } from 'lucide-react';

function ChapterSidebar({ courseInfo }) {
  const course = courseInfo?.courses;
  const enrollCourse = courseInfo?.enrollments;
  const courseContent = course?.courseContent ?? [];
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(SelectedChapterIndexContext);
  const completedChapters = enrollCourse?.completedChapters ?? [];

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm w-full max-w-xs lg:w-64 overflow-y-auto min-h-screen lg:min-h-full">
      <Accordion type="single" collapsible>
        {courseContent.map((chapter, index) => {
          const isCompleted = completedChapters.includes(index);
          const isSelected = selectedChapterIndex === index;

          return (
            <AccordionItem
              key={index}
              value={chapter.courseData?.chapterName}
              onClick={() => setSelectedChapterIndex(index)}
              className={`rounded-md transition-colors ${
                isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : ''
              }`}
            >
              <AccordionTrigger className="font-medium text-base flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-md transition-all">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <span>{chapter.courseData?.chapterName}</span>
              </AccordionTrigger>
              <AccordionContent className="pl-7 pr-2 pb-2">
                <div className="flex flex-col gap-1">
                  {chapter?.courseData?.topics.map((topic, idx) => (
                    <h2
                      key={idx}
                      className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded hover:bg-orange-100 transition"
                    >
                      {topic?.topic}
                    </h2>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default ChapterSidebar;
