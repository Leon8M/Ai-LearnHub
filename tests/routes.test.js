import { sql } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, rowsOf } from '@/config/db';
import { balance, createUser, readNdjson, resetDb } from './helpers';

// Route handlers read the signed-in user from Clerk; tests choose who that is.
const session = { current: null };
vi.mock('@/lib/auth', () => ({ getSessionUser: async () => session.current }));

// The AI is stubbed: these tests are about tokens, ownership and persistence.
const chapterBehaviour = { fail: () => false };
vi.mock('@/lib/courseGeneration', async (importOriginal) => ({
  ...(await importOriginal()),
  generateChapter: async ({ chapter }) => {
    if (chapterBehaviour.fail(chapter)) throw new Error('model down');
    return {
      courseData: { chapterName: chapter.chapterName, topics: [{ topic: 't', content: '<p>ok</p>' }], quiz: [] },
      youtubeVideos: [],
    };
  },
}));

const { POST: generateCourse } = await import('@/app/api/generate-course/route');
const { GET: getCourses } = await import('@/app/api/courses/route');
const { POST: syncUser } = await import('@/app/api/user/route');
const { POST: deleteAccount } = await import('@/app/api/user/delete-account-data/route');

const CID = '22222222-2222-4222-8222-222222222222';

async function createCourse({ owner = 'a@example.com', chapters = ['One', 'Two'], isPublic = true } = {}) {
  const courseJson = { course: { name: 'Course', chapters: chapters.map((c) => ({ chapterName: c, duration: '1h', topics: ['x'] })) } };
  await db.execute(sql`
    INSERT INTO courses (cid, name, chapters, difficulty, category, course_json, course_content, is_public, user_email)
    VALUES (${CID}, 'Course', ${chapters.length}, 'beginner', 'Science', ${JSON.stringify(courseJson)}::jsonb, '[]'::jsonb, ${isPublic}, ${owner})`);
}

const post = (handler, body) =>
  handler(new Request('https://kamusi.test/api', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }));

beforeEach(async () => {
  await resetDb();
  chapterBehaviour.fail = () => false;
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/generate-course', () => {
  it('spends one token, streams progress, saves content and enrolls the owner', async () => {
    session.current = await createUser({ tokens: 1 });
    await createCourse();

    const res = await post(generateCourse, { courseId: CID });
    const events = await readNdjson(res);
    expect(events[0]).toMatchObject({ type: 'start', total: 2, tokens: 0 });
    expect(events.filter((e) => e.type === 'chapter')).toHaveLength(2);
    expect(events.at(-1)).toMatchObject({ type: 'done', fulfilled: 2, failed: 0, refunded: false });

    expect(await balance('user_a')).toBe(0);
    const [course] = rowsOf(await db.execute(sql`SELECT course_content FROM courses WHERE cid = ${CID}`));
    expect(course.course_content.map((c) => c.status)).toEqual(['fulfilled', 'fulfilled']);
    const [enrolled] = rowsOf(await db.execute(sql`SELECT count(*)::int AS n FROM enrollments WHERE cid = ${CID}`));
    expect(enrolled.n).toBe(1);
  });

  it("refuses to generate someone else's course (the old route updated any course id)", async () => {
    await createUser({ id: 'owner', email: 'owner@example.com' });
    await createCourse({ owner: 'owner@example.com' });
    session.current = await createUser({ tokens: 5 });
    expect((await post(generateCourse, { courseId: CID })).status).toBe(404);
    expect(await balance('user_a')).toBe(5);
  });

  it('returns 402 without tokens', async () => {
    session.current = await createUser({ tokens: 0 });
    await createCourse();
    expect((await post(generateCourse, { courseId: CID })).status).toBe(402);
  });

  it('refunds the token when every chapter fails', async () => {
    session.current = await createUser({ tokens: 1 });
    await createCourse();
    chapterBehaviour.fail = () => true;
    const events = await readNdjson(await post(generateCourse, { courseId: CID }));
    expect(events.at(-1)).toMatchObject({ type: 'done', fulfilled: 0, refunded: true });
    expect(await balance('user_a')).toBe(1);
  });

  it('retries only the failed chapters, for free', async () => {
    session.current = await createUser({ tokens: 1 });
    await createCourse();
    chapterBehaviour.fail = (chapter) => chapter.chapterName === 'Two';
    await readNdjson(await post(generateCourse, { courseId: CID }));
    expect(await balance('user_a')).toBe(0);

    chapterBehaviour.fail = () => false;
    const events = await readNdjson(await post(generateCourse, { courseId: CID }));
    expect(events[0]).toMatchObject({ pending: [1] });
    expect(events.at(-1)).toMatchObject({ fulfilled: 2 });
    expect(await balance('user_a')).toBe(0);
  });
});

describe('GET /api/courses?courseId=all', () => {
  it('lists only public courses and never exposes creator emails', async () => {
    await createUser({ id: 'owner', email: 'owner@example.com' });
    await createCourse({ owner: 'owner@example.com' });
    session.current = await createUser();
    const list = await (await getCourses(new Request(`https://kamusi.test/api/courses?courseId=all`))).json();
    expect(list).toHaveLength(1);
    expect(JSON.stringify(list)).not.toContain('owner@example.com');
  });
});

describe('POST /api/user', () => {
  it('syncs from the session, not the request body (no account takeover)', async () => {
    await createUser({ id: 'victim', email: 'victim@example.com', tokens: 50 });
    session.current = { id: 'attacker', email: 'attacker@example.com', name: 'Mallory' };
    const res = await post(syncUser, { id: 'attacker', emailAddresses: [{ emailAddress: 'victim@example.com' }] });
    expect((await res.json()).user.email).toBe('attacker@example.com');
    const [victim] = rowsOf(await db.execute(sql`SELECT sub_id FROM users WHERE email = 'victim@example.com'`));
    expect(victim.sub_id).toBe('victim');
  });
});

describe('POST /api/user/delete-account-data', () => {
  it("deletes the user's data, including enrollments others had in their courses", async () => {
    session.current = await createUser({ tokens: 3 });
    await createCourse({ owner: 'a@example.com' });
    await createUser({ id: 'other', email: 'other@example.com' });
    await db.execute(sql`INSERT INTO enrollments (cid, user_email) VALUES (${CID}, 'other@example.com')`);
    await db.execute(sql`INSERT INTO token_transactions (user_id, type, amount, reference) VALUES ('user_a', 'purchase', 3, 'r1')`);

    expect((await post(deleteAccount, {})).status).toBe(200);
    const [counts] = rowsOf(await db.execute(sql`
      SELECT (SELECT count(*) FROM users WHERE sub_id = 'user_a')::int AS users,
             (SELECT count(*) FROM courses)::int AS courses,
             (SELECT count(*) FROM enrollments)::int AS enrollments,
             (SELECT count(*) FROM token_transactions)::int AS ledger,
             (SELECT count(*) FROM users WHERE sub_id = 'other')::int AS other_user`));
    expect(counts).toEqual({ users: 0, courses: 0, enrollments: 0, ledger: 0, other_user: 1 });
  });
});
