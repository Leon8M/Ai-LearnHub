'use client';
import { BookOpenCheck, Circle, Dot, ThumbsUp } from 'lucide-react';
import React from 'react';

function ChapterTopList({ course }) {
  const courseLayout = course?.courseJson?.course;

  if (!courseLayout || !courseLayout.chapters || courseLayout.chapters.length === 0) {
    return (
      <div className="mt-10 p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md text-center text-[var(--muted-foreground)]">
        <p className="text-lg">No course structure available yet. Generate content to see chapters!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-8">📚 Course Structure</h2>

      <div className="space-y-10">
        {courseLayout.chapters.map((chapter, index) => (
          <div key={index} className="relative border-l-4 border-[var(--primary)] pl-6">
            <div className="absolute -left-3 top-1.5 bg-[var(--primary)] text-[var(--secondary-foreground)] rounded-full p-1.5 flex items-center justify-center shadow-md">
              <Circle className="w-4 h-4" />
            </div>
            <div className="bg-[var(--background)] shadow-lg rounded-xl p-5 border border-[var(--border)] hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Chapter {index + 1}: {chapter.chapterName || "Untitled Chapter"}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Duration: {chapter.duration || 'N/A'} • Topics: {chapter?.topics?.length || 0}
              </p>
              <div className="space-y-2 mt-4">
                {chapter.topics && chapter.topics.length > 0 ? (
                  chapter.topics.map((topic, topicIndex) => (
                    <div
                      key={topicIndex}
                      className="flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors duration-200"
                    >
                      <Dot className="text-[var(--primary)] w-5 h-5" />
                      <span>{topic || "Untitled Topic"}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)] italic">No topics available for this chapter.</p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center justify-center gap-3 mt-10 text-[var(--muted-foreground)]">
          <ThumbsUp className="w-10 h-10 text-[var(--primary)] animate-bounce-slow" /> 
          <p className="text-lg font-semibold">That's all for now! 🎉</p>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopList;
