'use client';
import { Button } from '@/components/ui/button';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import axios from 'axios';
import { CheckLineIcon, Videotape, XIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useContext, useState } from 'react';
import YouTube from 'react-youtube';
import { toast } from 'sonner';

function Content({ courseInfo, refreshData }) {
  const { courseId } = useParams();
  const courseContent = courseInfo?.courses?.courseContent;
  const enrollments = courseInfo?.enrollments;
  const { selectedChapterIndex } = useContext(SelectedChapterIndexContext);

  const completedChapters = enrollments?.completedChapters ?? [];
  const videoData = courseContent?.[selectedChapterIndex]?.youtubeVideos || [];
  const topics = courseContent?.[selectedChapterIndex]?.courseData?.topics || [];
  const [loading, setLoading] = useState(false);

  const markChapterAsCompleted = async () => {
    setLoading(true);
    await axios.put('/api/enroll', {
      courseId,
      completedChapters: JSON.stringify([...completedChapters, selectedChapterIndex]),
    });
    toast.success('Chapter marked as completed!');
    refreshData();
    setLoading(false);
  };

  const markChapterAsInCompleted = async () => {
    setLoading(true);
    const updated = completedChapters.filter(i => i !== selectedChapterIndex);
    await axios.put('/api/enroll', {
      courseId,
      completedChapters: JSON.stringify(updated),
    });
    toast.success('Chapter marked as incomplete!');
    refreshData();
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-fade-in">
          {courseContent?.[selectedChapterIndex]?.courseData?.chapterName || 'Select a chapter'}
        </h2>
        {!completedChapters.includes(selectedChapterIndex) ? (
          <Button onClick={markChapterAsCompleted} disabled={loading}>
            {loading ? 'Marking...' : (
              <>
                <CheckLineIcon className="w-4 h-4 mr-1" /> Mark as Completed
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" onClick={markChapterAsInCompleted} disabled={loading}>
            {loading ? 'Unmarking...' : (
              <>
                <XIcon className="w-4 h-4 mr-1" /> Mark as Incomplete
              </>
            )}
          </Button>
        )}
      </div>

      {/* Topics */}
      <div className="space-y-6">
        {topics.map((topic, index) => (
          <div
            key={index}
            className={`p-5 border rounded-xl shadow-md transition-all duration-300 ease-in-out
              ${index % 2 === 0 ? 'bg-gradient-to-tr from-blue-50 via-white to-white' : 'bg-gradient-to-tr from-yellow-50 via-white to-white'}`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {index + 1}. {topic?.topic}
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: topic?.content }}
              className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-200 p-4 rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Videos */}
      <h2 className="text-xl sm:text-2xl font-bold mt-10 mb-4 flex items-center gap-2 text-gray-900">
        Related Videos <Videotape />
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {videoData.map((video, index) => (
          <div key={index} className="w-full">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
              <YouTube
                videoId={video?.videoId}
                className="absolute top-0 left-0 w-full h-full"
                opts={{
                  playerVars: {
                    autoplay: 0,
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Content;
