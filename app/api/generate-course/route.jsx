// app/api/generate-course/route.js
import { NextResponse } from "next/server";
// REMOVED: import { ai } from "../generate-course-layout/route"; // No longer needed
import { getGeminiResponse } from "@/lib/geminiClient"; // ADDED: Import the helper
import {
  coursesTable,
  tokenTransactionsTable,
  usersTable,
} from "@/config/schema";
import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";

const PROMPT = `(
Respond strictly in minified JSON format only, without markdown code blocks or comments.
Avoid HTML tags inside string values. Escape all special characters properly) 
Depends on Chapter name and Topic Generate content for each topic in HTML and give response in JSON format.
Schema:{
chapterName:<>,
{
topic: <>,
content: <>
}
}
: User Input:
`;

export async function POST(request) {
  const { course, courseName, courseId } = await request.json();

  // ✅ Get Clerk user ID
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Get user from DB
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.subID, userId)); // match by Clerk ID (subID)

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userData = user[0];

  // ✅ Token check
  if (userData.tokens < 1) {
    return NextResponse.json(
      { error: "You do not have enough tokens to generate this course." },
      { status: 403 }
    );
  }

  // ✅ Generate course content using Gemini
  const results = await Promise.allSettled(
    course?.chapters?.map(async (chapter) => {
      try {
        const contents = [
          {
            role: "user",
            parts: [{ text: PROMPT + JSON.stringify(chapter) }],
          },
        ];

        // CHANGED: Use the getGeminiResponse helper here
        const response = await getGeminiResponse(contents); 

        const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!rawText) throw new Error("Empty Gemini response");

        let cleaned = rawText.replace(/```json|```/g, "").trim();
        cleaned = cleaned.replace(/\\([^"ntr\\\/bfu])/g, "\\\\$1");

        const parsedContent = JSON.parse(cleaned);
        const youtubeVideos = await getYoutubeVideos(chapter.chapterName);

        return { status: "fulfilled", value: { youtubeVideos, courseData: parsedContent } };
      } catch (error) {
        console.error("Generation failed for chapter:", chapter.chapterName, error);
        return { status: "rejected", reason: error.message };
      }
    })
  );

  const courseJson = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);

  // ✅ Save course content
  await db
    .update(coursesTable)
    .set({ courseContent: JSON.stringify(courseJson) })
    .where(eq(coursesTable.cid, courseId));

  // ✅ Deduct token and log transaction
  await db
    .update(usersTable)
    .set({ tokens: userData.tokens - 1 })
    .where(eq(usersTable.id, userData.id));

  await db.insert(tokenTransactionsTable).values({
    userId: userData.id,
    type: "course_generation",
    amount: -1,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ courseName, courseContent: courseJson });
}

// ✅ Get YouTube videos for each chapter
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

async function getYoutubeVideos(topic) {
  try {
    const response = await axios.get(YOUTUBE_BASE_URL, {
      params: {
        part: "snippet",
        q: topic,
        maxResults: 3,
        type: "video",
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    return response.data.items.map((item) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      videoId: item.id.videoId,
    }));
  } catch (err) {
    console.error("YouTube API error:", err.message);
    return [];
  }
}
