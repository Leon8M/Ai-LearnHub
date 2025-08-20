'use client';
import { Button } from '@/components/ui/button';
import { SelectedChapterIndexContext } from '@/context/SelectedChapterIndexContext';
import axios from 'axios';
import { CheckCircle, Videotape, XCircle, Loader2, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  const currentChapterData = courseContent?.[selectedChapterIndex]?.value;
  const videoData = currentChapterData?.youtubeVideos || [];
  const topics = currentChapterData?.courseData?.topics || [];
  const chapterName = currentChapterData?.courseData?.chapterName || 'Select a chapter';

  const isContentRejected = courseContent?.[selectedChapterIndex]?.status === 'rejected';
  const isContentAvailable = currentChapterData && !isContentRejected && topics.length > 0;

  const markChapterAsCompleted = async () => {
    setLoading(true);
    try {
      await axios.put('/api/enroll', {
        courseId,
        completedChapters: JSON.stringify([...completedChapters, selectedChapterIndex]),
      });
      toast.success('Chapter marked as completed!');
      refreshData();
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error('Failed to mark chapter as completed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const markChapterAsInCompleted = async () => {
    setLoading(true);
    try {
      const updated = completedChapters.filter(i => i !== selectedChapterIndex);
      await axios.put('/api/enroll', {
        courseId,
        completedChapters: JSON.stringify(updated),
      });
      toast.success('Chapter marked as incomplete!');
      refreshData();
    } catch (error) {
      console.error("Error marking chapter as incomplete:", error);
      toast.error('Failed to mark chapter as incomplete. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!courseContent || courseContent.length === 0) {
    return (
      <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md text-center text-[var(--muted-foreground)] flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold font-heading mb-4">No Course Content Available</h2>
        <p className="text-lg">This course might not have generated content yet.</p>
        <p className="text-sm mt-2">Please go back to the "Edit Course" page and generate content, or select a chapter from the sidebar once content is available.</p>
      </div>
    );
  }

  if (!currentChapterData || isContentRejected) {
    const reason = courseContent?.[selectedChapterIndex]?.reason || 'Unknown error.';
    return (
      <div className="p-6 bg-[var(--card)] border border-[var(--destructive)] rounded-2xl shadow-md text-center text-[var(--destructive)] flex flex-col items-center justify-center h-full min-h-[400px]">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-2xl font-bold font-heading mb-4">Chapter Content Issue</h2>
        <p className="text-lg text-[var(--muted-foreground)]">
          {isContentRejected ? 'Content generation failed for this chapter.' : 'No content found for the selected chapter.'}
        </p>
        {isContentRejected && (
          <p className="text-sm mt-2 text-[var(--muted-foreground)]">
            Reason: {reason}. Please try regenerating the course content.
          </p>
        )}
        {!isContentRejected && (
          <p className="text-sm mt-2 text-[var(--muted-foreground)]">
            Please select a valid chapter from the sidebar.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full bg-[var(--card)] rounded-2xl shadow-md border border-[var(--border)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--foreground)] animate-fade-in">
          {chapterName}
        </h2>
        {isContentAvailable && (
          !completedChapters.includes(selectedChapterIndex) ? (
            <Button onClick={markChapterAsCompleted} disabled={loading} className="btn-primary !h-10 !text-base">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Marking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" /> Mark as Completed
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={markChapterAsInCompleted} disabled={loading} className="!h-10 !text-base border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary-foreground)]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Unmarking...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-1" /> Mark as Incomplete
                </>
              )}
            </Button>
          )
        )}
      </div>

      {isContentAvailable ? (
        <div className="space-y-6">
          {topics.map((topic, index) => (
            <div
              key={index}
              className={`p-5 border border-[var(--border)] rounded-xl shadow-md transition-all duration-300 ease-in-out
                ${index % 2 === 0 ? 'bg-[var(--background)]' : 'bg-[var(--muted)]'}`}
            >
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3 font-heading">
                {index + 1}. {topic?.topic || "Untitled Topic"}
              </h3>
              <div
                dangerouslySetInnerHTML={{ __html: topic?.content }}
                className="text-sm text-[var(--foreground)] leading-relaxed bg-[var(--card)] border border-[var(--border)] p-4 rounded-lg prose prose-sm max-w-none
                           prose-headings:text-[var(--foreground)] prose-p:text-[var(--foreground)] prose-li:text-[var(--foreground)] prose-a:text-[var(--primary)]
                           dark:prose-headings:text-[var(--foreground)] dark:prose-p:text-[var(--foreground)] dark:prose-li:text-[var(--foreground)] dark:prose-a:text-[var(--primary)]"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-[var(--muted-foreground)]">
          <p>No topic content available for this chapter.</p>
        </div>
      )}

      <h2 className="text-xl sm:text-2xl font-bold mt-10 mb-4 flex items-center gap-2 text-[var(--foreground)] font-heading">
        Related Videos <Videotape className="text-[var(--primary)]" />
      </h2>

      {videoData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videoData.map((video, index) => (
            <div key={index} className="w-full bg-[var(--muted)] rounded-xl shadow-lg overflow-hidden">
              <div className="relative pb-[56.25%] h-0 overflow-hidden">
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
              <div className="p-3">
                <h3 className="text-base font-semibold text-[var(--foreground)] line-clamp-2">{video?.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-3">{video?.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-[var(--muted-foreground)]">
          <p>No related videos found for this chapter.</p>
        </div>
      )}
    </div>
  );
}

export default Content;
