import fs from 'node:fs';
import path from 'node:path';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { SITE_URL } from '@/lib/site';

// Regenerated hourly. Includes every public course page, so generated courses get indexed.
export const revalidate = 3600;

async function publicCourses() {
  try {
    return await db
      .select({ cid: coursesTable.cid, createdAt: coursesTable.createdAt })
      .from(coursesTable)
      .where(eq(coursesTable.isPublic, true))
      .orderBy(desc(coursesTable.id))
      .limit(5000);
  } catch (err) {
    // No database at build time (or it's briefly unreachable): still serve the static pages.
    console.warn('[sitemap] skipping courses:', err.message);
    return [];
  }
}

export default async function sitemap() {
  const posts = fs
    .readdirSync(path.join(process.cwd(), 'content/blog'))
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ url: `${SITE_URL}/blog/${f.replace(/\.mdx$/, '')}`, changeFrequency: 'yearly', priority: 0.6 }));

  const courses = (await publicCourses()).map((c) => ({
    url: `${SITE_URL}/c/${c.cid}`,
    lastModified: c.createdAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog-main`, changeFrequency: 'weekly', priority: 0.7 },
    ...posts,
    ...courses,
  ];
}
