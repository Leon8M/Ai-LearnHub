import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { getGeminiResponse } from '@/lib/geminiClient';
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { safeLLMJsonParse } from "@/utils/parseLLMJson";

const PROMPT = `
You are a JSON generator. Your ONLY job is to respond with a single, perfectly-formed JSON object.
Follow these rules with extreme care:

**ABSOLUTE RULES:**
1.  **JSON ONLY:** Your entire response must be a single JSON object. Do NOT include any text, explanations, or markdown like \`\`\`json before or after the JSON.
2.  **VALID SYNTAX:** No trailing commas. All strings must use double quotes ("").
3.  **ESCAPE CHARACTERS:** This is the most important rule. You MUST escape all special characters within string values.
    - Escape all double quotes (") with a backslash (\\").
    - Escape all backslashes (\\) with another backslash (\\\\).
    - Escape newlines (\\n), tabs (\\t), etc.
    **Example of correctly escaped string:**
    { "content": "This string has a \\"quote\\" and a \\\\ backslash." }

**SCHEMA:**
Respond srictly in the following format. Do not add or remove fields.

Schema: {
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "difficulty": "string",
    "includeVideo": "boolean",
    "NoOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"]
      }
    ]
  }
}

If you cannot generate a valid response based on the user input, return an empty JSON object: {}.

User Input:
`;

export async function POST(req) {
  // --- TEMPORARY DEBUGGING START ---
  console.log("--- DEBUG: Start of generate-course-layout API route ---");
  console.log("DEBUG: process.env.NODE_ENV:", process.env.NODE_ENV);
  console.log("DEBUG: Checking specific GEMINI_API_KEY environment variables directly:");
  console.log("  process.env.GEMINI_API_KEY_1:", process.env.GEMINI_API_KEY_1 ? `"${process.env.GEMINI_API_KEY_1}" (length: ${process.env.GEMINI_API_KEY_1.length})` : 'undefined/empty');
  console.log("  process.env.GEMINI_API_KEY_2:", process.env.GEMINI_API_KEY_2 ? `"${process.env.GEMINI_API_KEY_2}" (length: ${process.env.GEMINI_API_KEY_2.length})` : 'undefined/empty');
  console.log("  process.env.GEMINI_API_KEY_3:", process.env.GEMINI_API_KEY_3 ? `"${process.env.GEMINI_API_KEY_3}" (length: ${process.env.GEMINI_API_KEY_3.length})` : 'undefined/empty');
  console.log("--- END TEMPORARY DEBUGGING ---");

  const { courseId, ...formData } = await req.json();
  const user = await currentUser();
  if (!user || !user.primaryEmailAddress?.emailAddress) {
    console.error("Course layout generation failed: User not authenticated or email missing.");
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let courseJson;
  let bannerImageUrl = formData.category;

  try {
    // --- Step 1: Generate Course Layout with Gemini (Text Model) ---
    const contents = [
      {
        role: "user",
        parts: [{ text: PROMPT + JSON.stringify(formData) }],
      },
    ];

    let geminiResult;
    try {
      geminiResult = await getGeminiResponse(contents);
    } catch (geminiErr) {
      console.error("Gemini API call (text generation) failed:", geminiErr.message);
      return NextResponse.json({ error: "Failed to get course layout from AI." }, { status: 500 });
    }

    const rawText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) {
      console.error("Empty or malformed Gemini response received for text generation.");
      return NextResponse.json({ error: "AI generated an empty or invalid course layout." }, { status: 500 });
    }

    try {
      // Fix: Remove trailing comma and any non-JSON text from the raw Gemini response.
      const cleaned = rawText.replace(/```json|```/g, "").trim();


      courseJson = safeLLMJsonParse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response JSON:", parseErr.message);
      console.error("Raw Gemini text:", rawText);
      return NextResponse.json({ error: "AI generated unparseable course layout." }, { status: 500 });
    }

    // --- Step 2: Image Generation is now handled by frontend component ---
    // The `bannerImageUrl` is already set to `formData.category` above.
    // The `bannerImagePrompt` from `courseJson` is no longer used for API calls.

    // --- Step 3: Insert into Database ---
    // Extract AI-generated description, with a fallback to the user's input.
    const aiDescription = courseJson?.course?.description || formData.description;

    await db.insert(coursesTable).values({
      ...formData,
      description: aiDescription, // Override with AI-generated description
      courseJson: JSON.stringify(courseJson),
      userEmail: user.primaryEmailAddress.emailAddress,
      cid: courseId,
      bannerImageUrl,
    });

    return NextResponse.json({ courseId });

  } catch (err) {
    console.error("An unexpected error occurred during course layout generation:", err.message);
    console.error("Full error stack:", err.stack);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
