// app/api/generate-course/route.jsx
import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/geminiClient";
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
  const { userId: clerkUserId } = getAuth(request); // Renamed userId to clerkUserId to avoid conflict
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Get user from DB using Clerk's subID
  const [dbUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.subID, clerkUserId)); // match by Clerk ID (subID)

  if (!dbUser) { // Check if user array is empty
    return NextResponse.json({ error: "User not found in database." }, { status: 404 });
  }

  // ✅ Token check
  if (dbUser.tokens < 1) { // Use dbUser for token check
    return NextResponse.json(
      { error: "You do not have enough tokens to generate this course." },
      { status: 403 }
    );
  }

  // ✅ Deduct token immediately to prevent double spending
  // Use dbUser.id (the integer primary key) for updating the usersTable
  await db
    .update(usersTable)
    .set({ tokens: dbUser.tokens - 1 })
    .where(eq(usersTable.id, dbUser.id));

  try {
    const chapterPromises = course?.chapters?.map(async (chapter) => {
      try {
        const contents = [
          {
            role: "user",
            parts: [{ text: PROMPT + JSON.stringify(chapter) }],
          },
        ];

        const response = await getGeminiResponse(contents);
        const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!rawText) throw new Error("Empty Gemini response");

        let cleaned = rawText;

        // 1. Attempt to extract JSON from a markdown code block if present
        const jsonMatch = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            cleaned = jsonMatch[1];
        }

        // 2. Remove invisible control characters that can break JSON.parse
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

        // 3. Escape unescaped backslashes, but only if they are not part of valid escape sequences
        // This regex handles backslashes that are NOT followed by a valid JSON escape character
        cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

        // 4. Attempt to fix common LLM JSON issues like trailing commas or unquoted keys if necessary
        // This is a more advanced step and might require a library or more complex regex,
        // but for now, the primary goal is to ensure basic JSON validity.
        // For example, if it frequently puts a trailing comma, you might add:
        // cleaned = cleaned.replace(/,(\s*})/, '$1'); // Removes trailing comma before closing brace

        const parsedContent = JSON.parse(cleaned);
        const youtubeVideos = await getYoutubeVideos(parsedContent.chapterName || chapter.chapterName); // Use parsed chapterName if available

        return { status: "fulfilled", value: { youtubeVideos, courseData: parsedContent } };
      } catch (error) {
        console.error("JSON/Chapter generation failed for chapter:", chapter.chapterName, "Error:", error.message);
        console.error("Raw LLM response:", rawText); // Log raw for debugging
        console.error("Cleaned content before parse:", cleaned); // Log cleaned for debugging
        return { status: "rejected", reason: `Chapter generation failed: ${error.message}` };
      }
    });

    const results = await Promise.allSettled(chapterPromises);

    const successfulChapters = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
    const failedChapters = results.filter((r) => r.status === "rejected");

    if (failedChapters.length > 0) {
      console.warn('Some chapters failed generation:', failedChapters);
    }

    // ✅ Log token transaction
    await db.insert(tokenTransactionsTable).values({
      // FIX: Use dbUser.subID (Clerk's string ID) for userId as token_transactions.user_id now references users.subID
      userId: dbUser.subID,
      type: "course_generation",
      amount: -1, // Token deduction
      timestamp: new Date().toISOString(),
      // transactionId: `course-gen-${dbUser.subID}-${new Date().getTime()}`, // Use dbUser.subID for consistency
    });

    // ✅ Save generated course content
    await db
      .update(coursesTable)
      .set({ courseContent: JSON.stringify(successfulChapters) }) // Stringify the array of successful chapters
      .where(eq(coursesTable.cid, courseId));


    return NextResponse.json({
      success: true,
      courseName,
      generatedChapters: successfulChapters,
      failedChaptersCount: failedChapters.length,
      message: failedChapters.length > 0 ? 'Course generated with some chapter failures.' : 'Course generated successfully.'
    }, { status: 200 });

  } catch (error) {
    console.error('An unexpected error occurred during course generation:', error);
    // Important: Consider refunding token if an unexpected server error occurs *after* deduction
    // but *before* the course is fully saved or transaction logged. This requires more complex transaction management.
    return NextResponse.json({ error: `Server error during course generation: ${error.message}` }, { status: 500 });
  }
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
    console.error("YouTube API error for topic:", topic, err.message);
    return [];
  }
}
