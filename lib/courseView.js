import { parseJsonField } from './json';
import { sanitizeCourseContent } from './sanitize';

// Shapes course rows for API responses. Lists get a light outline (chapter and topic names,
// no lesson HTML or videos); a single course gets the full, sanitised content.

const outlineOnly = (content) =>
  content.map((c) =>
    c?.status === 'fulfilled'
      ? {
          status: 'fulfilled',
          value: {
            courseData: {
              chapterName: c.value?.courseData?.chapterName,
              topics: (c.value?.courseData?.topics ?? []).map((t) => ({ topic: t?.topic })),
            },
          },
        }
      : { status: c?.status ?? 'rejected' }
  );

export function toClientCourse(row, { full = false, includeOwner = false } = {}) {
  if (!row) return null;
  const content = parseJsonField(row.courseContent, []);
  const { userEmail, ...rest } = row;
  return {
    ...rest,
    ...(includeOwner ? { userEmail } : {}),
    courseJson: parseJsonField(row.courseJson, {}),
    courseContent: Array.isArray(content) ? (full ? sanitizeCourseContent(content) : outlineOnly(content)) : [],
  };
}
