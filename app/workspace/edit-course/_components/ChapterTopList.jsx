import { BookOpenCheck, Circle, Dot, ThumbsUp } from 'lucide-react';
import React from 'react';

function ChapterTopList({ course }) {
  const courseLayout = course?.courseJson?.course;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">📚 Course Structure</h2>

      <div className="space-y-10">
        {courseLayout?.chapters?.map((chapter, index) => (
          <div key={index} className="relative border-l-4 border-primary pl-6">
            <div className="absolute -left-3 top-1.5 bg-primary text-white rounded-full p-1">
              <Circle className="w-4 h-4" />
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-1">Chapter {index + 1}: {chapter.chapterName}</h3>
              <p className="text-sm text-gray-500 mb-2">
                Duration: {chapter.duration} • Topics: {chapter?.topics?.length}
              </p>
              <div className="space-y-2 mt-4">
                {chapter.topics.map((topic, topicIndex) => (
                  <div
                    key={topicIndex}
                    className="flex items-center gap-2 bg-gray-50 border rounded-md px-3 py-2 text-sm text-gray-700"
                  >
                    <Dot className="text-primary" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center gap-3 mt-10 text-gray-600">
          <ThumbsUp className="w-8 h-8 text-primary" />
          <p className="text-lg font-semibold">That's all for now! 🎉</p>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopList;
