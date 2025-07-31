'use client';
import React, { useContext } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import { CheckCircle, Circle, AlertTriangle } from 'lucide-react';

function ChapterSidebar({ courseInfo }) {
  const course = courseInfo?.courses;
  const enrollCourse = courseInfo?.enrollments;
  const courseContent = course?.courseContent ?? [];
  const { selectedChapterIndex, setSelectedChapterIndex } = useContext(SelectedChapterIndexContext);
  const completedChapters = enrollCourse?.completedChapters ?? [];

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl shadow-md w-full max-w-xs lg:w-64 overflow-y-auto min-h-screen lg:min-h-full">
      <h3 className="text-xl font-bold font-heading text-[var(--foreground)] mb-4">Chapters</h3>
      {courseContent.length === 0 ? (
        <div className="text-center text-[var(--muted-foreground)] py-4">
          <p>No chapters available yet.</p>
          <p className="text-sm mt-1">Generate course content to see chapters here.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible value={courseContent[selectedChapterIndex]?.value?.courseData?.chapterName}> {/* Access .value here */}
          {courseContent.map((chapter, index) => {
            const isCompleted = completedChapters.includes(index);
            const isSelected = selectedChapterIndex === index;
            const isRejected = chapter.status === 'rejected';
            const chapterData = chapter.value?.courseData; // Access .value here

            return (
              <AccordionItem
                key={index}
                value={chapterData?.chapterName} // Use chapterData
                onClick={() => setSelectedChapterIndex(index)}
                className={`rounded-lg transition-colors mb-2 border border-transparent
                  ${isSelected ? 'bg-[var(--accent)] border-[var(--primary)]' : 'hover:bg-[var(--muted)]'}
                  ${isRejected ? 'opacity-70 border-[var(--destructive)]' : ''} `}
              >
                <AccordionTrigger className={`font-medium text-base flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                  ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)] hover:text-[var(--primary)]'}
                  ${isRejected ? 'text-[var(--destructive)]' : ''}`}>
                  {isRejected ? (
                    <AlertTriangle className="w-4 h-4 text-[var(--destructive)]" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--muted-foreground)]" />
                  )}
                  <span className="flex-1 text-left">{chapterData?.chapterName || `Chapter ${index + 1}`}</span> {/* Use chapterData */}
                </AccordionTrigger>
                <AccordionContent className="pl-8 pr-2 pb-2 text-[var(--muted-foreground)]">
                  <div className="flex flex-col gap-1">
                    {chapterData?.topics && chapterData.topics.length > 0 ? ( // Use chapterData
                      chapterData.topics.map((topic, idx) => ( // Use chapterData
                        <p
                          key={idx}
                          className="text-sm bg-[var(--background)] px-2 py-1 rounded hover:bg-[var(--accent)] transition-colors text-[var(--foreground)]"
                        >
                          {topic?.topic || `Topic ${idx + 1}`}
                        </p>
                      ))
                    ) : isRejected ? (
                      <p className="text-sm italic text-[var(--destructive)]">Content generation failed.</p>
                    ) : (
                      <p className="text-sm italic">No topics for this chapter.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

export default ChapterSidebar;
