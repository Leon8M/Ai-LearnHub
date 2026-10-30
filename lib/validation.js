import { z } from 'zod';

export const LANGUAGES = ['English', 'Kiswahili', 'French', 'Spanish', 'Portuguese', 'Arabic'];
export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
export const MAX_CHAPTERS = 10;

const courseId = z.string().uuid('courseId must be a course id.');

export const courseLayoutInput = z.object({
  name: z.string().trim().min(3, 'Course name is too short.').max(120, 'Course name is too long.'),
  description: z.string().trim().max(600, 'Description is too long.').optional().default(''),
  chapters: z.coerce.number().int().min(1).max(MAX_CHAPTERS, `At most ${MAX_CHAPTERS} chapters.`),
  includeVideo: z.boolean().optional().default(false),
  difficulty: z.enum(DIFFICULTIES),
  category: z.string().trim().min(1, 'Pick at least one category.').max(200),
  language: z.enum(LANGUAGES).optional().default('English'),
});

export const courseIdInput = z.object({ courseId });

export const visibilityInput = z.object({ courseId, isPublic: z.boolean() });

/** The client historically sent completedChapters as a JSON string; accept both forms. */
export const progressInput = z.object({
  courseId,
  completedChapters: z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, z.array(z.number().int().min(0).max(MAX_CHAPTERS * 10)).max(MAX_CHAPTERS * 10)),
});

export const packageInput = z.object({ packageId: z.enum(['single', 'starter', 'pro', 'master']) });

export const referenceInput = z.object({
  reference: z.string().min(8).max(200).regex(/^[\w.-]+$/, 'Invalid payment reference.'),
});

// --------------------------------------------------------------------- AI output
// Gemini's structured output guarantees JSON of the right shape; these schemas are the second
// line of defence that trims and bounds what actually gets stored.

export const courseLayoutOutput = z.object({
  course: z.object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).default(''),
    category: z.string().trim().max(200).default(''),
    difficulty: z.string().trim().max(40).default(''),
    includeVideo: z.boolean().default(false),
    NoOfChapters: z.number().int().optional(),
    bannerImagePrompt: z.string().optional(),
    chapters: z
      .array(
        z.object({
          chapterName: z.string().trim().min(1).max(200),
          duration: z.string().trim().max(60).default(''),
          topics: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
        })
      )
      .min(1),
  }),
});

export const quizQuestionOutput = z
  .object({
    question: z.string().trim().min(1).max(500),
    options: z.array(z.string().trim().min(1).max(300)).min(2).max(6),
    answerIndex: z.number().int().min(0),
    explanation: z.string().trim().max(1000).default(''),
  })
  .refine((q) => q.answerIndex < q.options.length, { message: 'answerIndex out of range' });

export const chapterOutput = z.object({
  chapterName: z.string().trim().min(1).max(200),
  topics: z.array(z.object({ topic: z.string().trim().min(1).max(200), content: z.string().min(1) })).min(1),
  // Bad quiz questions are dropped rather than failing the whole chapter.
  quiz: z
    .array(z.unknown())
    .default([])
    .transform((items) => items.flatMap((q) => (quizQuestionOutput.safeParse(q).success ? [quizQuestionOutput.parse(q)] : []))),
});
