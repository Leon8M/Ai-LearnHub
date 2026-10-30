import sanitizeHtml from 'sanitize-html';

// Lesson content is HTML written by the model, so it is untrusted: a course prompt can steer it
// into emitting <script>, event handlers or javascript: links, and courses are shared publicly.
// Only formatting tags survive; links are forced to open safely in a new tab.
const OPTIONS = {
  allowedTags: [
    'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'blockquote', 'pre', 'code', 'kbd', 'samp',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup',
    'small', 'span', 'div', 'a', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  ],
  // target/rel must be allowed too, or the transform below gets stripped right after it runs.
  allowedAttributes: { a: ['href', 'title', 'target', 'rel'], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
  },
};

export const sanitizeLessonHtml = (html) => sanitizeHtml(String(html ?? ''), OPTIONS);

/** Sanitise every lesson in a stored courseContent array (also cleans rows saved before this existed). */
export function sanitizeCourseContent(content) {
  if (!Array.isArray(content)) return [];
  return content.map((chapter) => {
    const topics = chapter?.value?.courseData?.topics;
    if (!Array.isArray(topics)) return chapter;
    return {
      ...chapter,
      value: {
        ...chapter.value,
        courseData: {
          ...chapter.value.courseData,
          topics: topics.map((t) => ({ ...t, content: sanitizeLessonHtml(t?.content) })),
        },
      },
    };
  });
}
