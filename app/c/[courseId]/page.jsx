import { and, eq } from 'drizzle-orm';
import { BookOpen, Clock, Languages, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import Quiz from '@/components/Quiz';
import { Button } from '@/components/ui/button';
import { toClientCourse } from '@/lib/courseView';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/site';

// Always reflect the current visibility: a course made private disappears immediately.
export const dynamic = 'force-dynamic';

const getPublicCourse = cache(async (courseId) => {
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return null;
  const [row] = await db
    .select()
    .from(coursesTable)
    .where(and(eq(coursesTable.cid, courseId), eq(coursesTable.isPublic, true)));
  return row ? toClientCourse(row, { full: true }) : null;
});

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  if (!course) return { title: `Course not found | ${SITE_NAME}` };
  const layout = course.courseJson?.course ?? {};
  const title = `${layout.name || course.name} | Free AI course on ${SITE_NAME}`;
  const description = (layout.description || course.description || '').slice(0, 300);
  const url = `${SITE_URL}/c/${course.cid}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', images: [{ url: `${SITE_URL}${OG_IMAGE}` }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}${OG_IMAGE}`] },
  };
}

export default async function PublicCoursePage({ params }) {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  if (!course) notFound();

  const layout = course.courseJson?.course ?? {};
  const chapters = (course.courseContent ?? []).filter((c) => c?.status === 'fulfilled').map((c) => c.value.courseData);

  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={`${SITE_NAME} home`}>
            <Image src="/logo-main.png" alt={SITE_NAME} width={64} height={64} className="h-11 w-auto" />
          </Link>
          <Link href="/workspace">
            <Button className="btn-primary !h-10 px-4 text-sm">Create your own course free</Button>
          </Link>
        </div>
      </header>

      <article className="container mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">{course.category}</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight font-heading sm:text-5xl">{layout.name || course.name}</h1>
        {layout.description && <p className="mt-4 text-lg text-muted-foreground">{layout.description}</p>}

        <dl className="mt-6 flex flex-wrap gap-3 text-sm">
          {[
            { icon: BookOpen, label: 'Chapters', value: `${chapters.length} chapter${chapters.length === 1 ? '' : 's'}` },
            { icon: TrendingUp, label: 'Level', value: course.difficulty },
            { icon: Languages, label: 'Language', value: course.language },
            { icon: Clock, label: 'Format', value: 'Lessons + quizzes' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
              <Icon className="h-4 w-4 text-[var(--primary)]" aria-hidden />
              <dt className="sr-only">{label}</dt>
              <dd className="capitalize">{value}</dd>
            </div>
          ))}
        </dl>

        <nav aria-label="Chapters" className="mt-10 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-bold font-heading">In this course</h2>
          <ol className="space-y-1.5">
            {chapters.map((chapter, i) => (
              <li key={i}>
                <a href={`#chapter-${i + 1}`} className="text-[var(--primary)] hover:underline">
                  {i + 1}. {chapter.chapterName}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {chapters.map((chapter, i) => (
          <section key={i} id={`chapter-${i + 1}`} className="mt-14 scroll-mt-24">
            <h2 className="text-2xl font-bold font-heading sm:text-3xl">
              Chapter {i + 1}: {chapter.chapterName}
            </h2>
            {chapter.topics.map((topic, t) => (
              <div key={t} className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 text-lg font-semibold font-heading">{topic.topic}</h3>
                {/* Lesson HTML is sanitised server-side (lib/sanitize.js) before it gets here. */}
                <div className="lesson text-foreground" dangerouslySetInnerHTML={{ __html: topic.content }} />
              </div>
            ))}
            <Quiz questions={chapter.quiz ?? []} />
          </section>
        ))}

        <aside className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold font-heading">Learn anything like this</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            {SITE_NAME} writes a structured course with lessons, quizzes and videos on any topic you choose, in English or Kiswahili.
          </p>
          <Link href="/workspace">
            <Button className="btn-primary mt-6 !h-12 px-6 !text-base">Generate your own course</Button>
          </Link>
        </aside>
      </article>
    </main>
  );
}
