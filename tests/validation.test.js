import { describe, expect, it } from 'vitest';
import { sanitizeLessonHtml } from '@/lib/sanitize';
import { chapterOutput, courseLayoutInput, progressInput } from '@/lib/validation';

describe('courseLayoutInput', () => {
  const valid = { name: 'Intro to Rust', chapters: 6, difficulty: 'beginner', category: 'Programming' };

  it('accepts a normal request and fills defaults', () => {
    expect(courseLayoutInput.parse(valid)).toMatchObject({ language: 'English', includeVideo: false, description: '' });
  });

  it('caps chapters (the old API accepted any number for one token)', () => {
    expect(courseLayoutInput.safeParse({ ...valid, chapters: 50 }).success).toBe(false);
    expect(courseLayoutInput.safeParse({ ...valid, chapters: 0 }).success).toBe(false);
  });

  it('ignores fields that are not part of the form (no mass assignment)', () => {
    expect(courseLayoutInput.parse({ ...valid, userEmail: 'victim@example.com', courseContent: '[]' })).not.toHaveProperty('userEmail');
  });
});

describe('progressInput', () => {
  it('accepts the legacy JSON-string form and arrays', () => {
    const courseId = '11111111-1111-4111-8111-111111111111';
    expect(progressInput.parse({ courseId, completedChapters: '[0,2]' }).completedChapters).toEqual([0, 2]);
    expect(progressInput.safeParse({ courseId, completedChapters: ['x'] }).success).toBe(false);
  });
});

describe('chapterOutput', () => {
  it('keeps good quiz questions and drops malformed ones', () => {
    const parsed = chapterOutput.parse({
      chapterName: 'Basics',
      topics: [{ topic: 'Ownership', content: '<p>...</p>' }],
      quiz: [
        { question: 'Q1?', options: ['a', 'b', 'c', 'd'], answerIndex: 1, explanation: 'Because.' },
        { question: 'Bad index', options: ['a', 'b'], answerIndex: 7, explanation: '' },
        { nonsense: true },
      ],
    });
    expect(parsed.quiz).toHaveLength(1);
  });
});

describe('sanitizeLessonHtml', () => {
  it('removes scripts, event handlers and javascript: links but keeps formatting', () => {
    const html = sanitizeLessonHtml(
      '<h3>Title</h3><script>steal()</script><img src=x onerror="steal()"><p onclick="x()">Hi <strong>there</strong></p><a href="javascript:steal()">bad</a><a href="https://ok.example">ok</a>'
    );
    expect(html).not.toMatch(/script|onerror|onclick|javascript:/);
    expect(html).toContain('<h3>Title</h3>');
    expect(html).toContain('<strong>there</strong>');
    expect(html).toContain('href="https://ok.example"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });
});
