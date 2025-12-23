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
import { safeLLMJsonParse } from "@/utils/parseLLMJson";

const PROMPT = `
You are an expert content generator. Your task is to generate the educational content for a specific chapter and its topics.
You MUST follow these rules perfectly:

**ABSOLUTE RULES:**
1.  **JSON ONLY:** Your entire response MUST be a single, valid JSON object. Do NOT include any text, explanations, or markdown like \`\`\`json before or after the JSON.
2.  **VALID SYNTAX:** No trailing commas. All strings must use double quotes ("").
3.  **HTML FOR CONTENT:** The 'content' field MUST be a string containing rich HTML. You can use tags like <h2>, <h3>, <p>, <ul>, <li>, <strong>, etc.
4.  **ESCAPE CHARACTERS:** This is the most important rule. You MUST escape all special characters within all string values, especially the 'content' field.
    - Escape all double quotes (") with a backslash (\\").
    - Escape all backslashes (\\) with another backslash (\\\\).
    - Convert all newlines to \\n.
    **Example of a correctly escaped 'content' string:**
    "content": "<h2>Topic Title</h2><p>This paragraph contains a \\"quoted phrase\\" and a file path C:\\\\Users\\\\Test.</p>"

**JSON SCHEMA:**
Your response must be a single JSON object matching this structure exactly:

{
  "chapterName": "string",
  "topics": [
    {
      "topic": "string",
      "content": "string (contains HTML)"
    }
  ]
}

**CONTEXT FROM USER INPUT:**
The user will provide the chapter details. You should use the 'chapterName' from the input to populate the 'chapterName' field in your response. Then, for each topic in the input, generate the HTML content.

If you cannot generate content, return an empty object: {}.

User Input (do not repeat this in your response):
`;

export async function POST(request) {
  const { course, courseName, courseId } = await request.json();

  const { userId: clerkUserId } = getAuth(request);
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.subID, clerkUserId));

  if (!dbUser) {
    return NextResponse.json({ error: "User not found in database." }, { status: 404 });
  }

  if (dbUser.tokens < 1) {
    return NextResponse.json(
      { error: "You do not have enough tokens to generate this course." },
      { status: 403 }
    );
  }

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

        const parsed = safeLLMJsonParse(rawText);
        const youtubeVideos = await getYoutubeVideos(parsed.chapterName || chapter.chapterName);

        return { status: "fulfilled", value: { youtubeVideos, courseData: parsed } };
      } catch (error) {
        console.error("JSON/Chapter generation failed for chapter:", chapter.chapterName, "Error:", error.message);
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

    await db.insert(tokenTransactionsTable).values({
      userId: dbUser.subID,
      type: "course_generation",
      amount: -1,
      timestamp: new Date().toISOString(),
    });

    await db
      .update(coursesTable)
      .set({ courseContent: JSON.stringify(successfulChapters) })
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
    return NextResponse.json({ error: `Server error during course generation: ${error.message}` }, { status: 500 });
  }
}

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
