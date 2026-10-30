'use client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Book, CheckCircle2, Clock, Copy, Globe, Languages, Loader2, Lock, PlayIcon, RotateCcw, Sparkle, TrendingUp, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import CategoryIconCard from '../../_components/CategoryIconCard';

function totalDuration(chapters = []) {
  let minutes = 0;
  for (const chapter of chapters) {
    const text = String(chapter?.duration ?? '').toLowerCase();
    const hours = text.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/);
    const mins = text.match(/(\d+)\s*(?:min)/);
    if (hours) minutes += parseFloat(hours[1]) * 60;
    if (mins) minutes += parseInt(mins[1], 10);
    if (!hours && !mins && /^\d+$/.test(text)) minutes += parseInt(text, 10);
  }
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return [h && `${h} hr`, m && `${m} min`].filter(Boolean).join(' ');
}

/** Read the generator's NDJSON progress stream, calling onEvent for each line. */
async function streamGeneration(courseId, onEvent) {
  const res = await fetch('/api/generate-course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Generation failed. Please try again.');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) if (line.trim()) onEvent(JSON.parse(line));
  }
}

function Courseinfo({ course, viewCourse, onChanged }) {
  const courseLayout = course?.courseJson?.course;
  const chapters = courseLayout?.chapters ?? [];
  const router = useRouter();
  const [progress, setProgress] = useState(null); // { statuses: [...], done: bool }
  const [isPublic, setIsPublic] = useState(course?.isPublic ?? true);
  const [savingVisibility, setSavingVisibility] = useState(false);

  const content = Array.isArray(course?.courseContent) ? course.courseContent : [];
  const generatedCount = content.filter((c) => c?.status === 'fulfilled').length;
  const failedCount = chapters.length && content.length ? chapters.length - generatedCount : 0;
  const generating = progress && !progress.done;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${course?.cid}` : '';

  const generate = async () => {
    const statuses = chapters.map((_, i) => (content[i]?.status === 'fulfilled' ? 'fulfilled' : 'waiting'));
    setProgress({ statuses, done: false });
    try {
      await streamGeneration(course.cid, (event) => {
        if (event.type === 'start') {
          setProgress((p) => ({ ...p, statuses: p.statuses.map((s, i) => (event.pending.includes(i) ? 'working' : s)) }));
          window.dispatchEvent(new Event('kamusi:tokens-changed'));
        } else if (event.type === 'chapter') {
          setProgress((p) => ({ ...p, statuses: p.statuses.map((s, i) => (i === event.index ? event.status : s)) }));
        } else if (event.type === 'done') {
          setProgress((p) => ({ ...p, done: true }));
          if (event.refunded) {
            toast.error('Generation failed for every chapter, so your token was refunded. Please try again.');
            window.dispatchEvent(new Event('kamusi:tokens-changed'));
          } else if (event.failed) {
            toast.warning(`${event.fulfilled} chapters ready, ${event.failed} failed. You can retry the failed ones for free.`);
          } else {
            toast.success('Your course is ready!');
            router.push(`/course/${course.cid}`);
          }
          onChanged?.();
        } else if (event.type === 'error') {
          setProgress((p) => ({ ...p, done: true }));
          toast.error(event.message);
          onChanged?.();
        }
      });
    } catch (err) {
      setProgress(null);
      toast.error(err.message);
    }
  };

  const toggleVisibility = async (next) => {
    setSavingVisibility(true);
    setIsPublic(next);
    try {
      const res = await fetch('/api/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.cid, isPublic: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? 'Course is public: anyone with the link can read it.' : 'Course is private.');
    } catch {
      setIsPublic(!next);
      toast.error('Could not change visibility.');
    } finally {
      setSavingVisibility(false);
    }
  };

  const doneCount = progress?.statuses.filter((s) => s === 'fulfilled').length ?? 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md overflow-hidden p-6">
      {course?.bannerImageUrl && (
        <CategoryIconCard
          category={course?.bannerImageUrl || courseLayout?.category || 'Default'}
          className="md:w-1/2 w-full relative h-64 rounded-lg overflow-hidden"
        />
      )}

      <div className="flex flex-col gap-4 md:w-1/2 w-full justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--foreground)]">{courseLayout?.name || 'Untitled Course'}</h1>
          <p className="text-[var(--muted-foreground)] mt-2">{courseLayout?.description || 'No description available.'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--foreground)] mt-4">
          {[
            { icon: Clock, label: 'Duration', value: totalDuration(chapters) },
            { icon: Book, label: 'Chapters', value: chapters.length },
            { icon: TrendingUp, label: 'Difficulty', value: courseLayout?.difficulty || 'N/A' },
            { icon: Languages, label: 'Language', value: course?.language || 'English' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 bg-[var(--accent)] p-3 rounded-lg shadow-sm">
              <Icon className="text-[var(--primary)] w-5 h-5" />
              <div>
                <p className="font-medium text-[var(--foreground)]">{label}</p>
                <p className="text-[var(--muted-foreground)] capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {progress && (
          <div className="rounded-lg border border-[var(--border)] p-3" aria-live="polite">
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <span>{progress.done ? 'Generation finished' : 'Writing your course...'}</span>
              <span>
                {doneCount}/{chapters.length}
              </span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-500"
                style={{ width: `${(doneCount / Math.max(1, chapters.length)) * 100}%` }}
              />
            </div>
            <ol className="space-y-1 text-sm">
              {chapters.map((chapter, i) => {
                const status = progress.statuses[i];
                return (
                  <li key={i} className="flex items-center gap-2">
                    {status === 'fulfilled' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : status === 'rejected' ? (
                      <XCircle className="h-4 w-4 shrink-0 text-[var(--destructive)]" />
                    ) : status === 'working' ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--primary)]" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-[var(--border)]" />
                    )}
                    <span className="truncate">{chapter.chapterName}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-3">
          {!viewCourse && course?.isOwner !== false && (generatedCount === 0 || failedCount > 0) ? (
            <Button disabled={generating} onClick={generate} className="btn-primary w-full md:w-auto !h-12 !text-base">
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </span>
              ) : generatedCount > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5" /> Retry {failedCount} failed chapter{failedCount === 1 ? '' : 's'} (free)
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkle className="w-5 h-5" /> Generate Course Content (1 token)
                </span>
              )}
            </Button>
          ) : null}

          {generatedCount > 0 && (
            <Link href={`/course/${course?.cid}`}>
              <Button className="btn-primary w-full md:w-auto !h-12 !text-base">
                <PlayIcon className="w-5 h-5 mr-2" />
                {viewCourse ? 'Continue Course' : 'Start Learning'}
              </Button>
            </Link>
          )}

          {course?.isOwner && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] p-3 text-sm">
              {isPublic ? <Globe className="h-4 w-4 text-[var(--primary)]" /> : <Lock className="h-4 w-4" />}
              <span className="flex-1">{isPublic ? 'Public: listed on Explore and shareable' : 'Private: only you can see it'}</span>
              <Switch checked={isPublic} disabled={savingVisibility} onCheckedChange={toggleVisibility} aria-label="Public course" />
              {isPublic && generatedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => toast.success('Share link copied.'))}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy link
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courseinfo;
