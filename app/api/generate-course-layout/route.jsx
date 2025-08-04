// app/api/generate-course-layout/route.js
import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { getGeminiResponse, getGeminiImageResponse } from '@/lib/geminiClient';
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const PROMPT = `Generate Learning Course based on the following details. Format as JSON only.
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
User Input:`;

export async function POST(req) {
  // --- TEMPORARY DEBUGGING START ---
  console.log("--- DEBUG: Start of generate-course-layout API route ---");
  console.log("DEBUG: process.env.NODE_ENV:", process.env.NODE_ENV);
  console.log("DEBUG: Checking specific GEMINI_API_KEY environment variables directly:");
  console.log("  process.env.GEMINI_API_KEY_1:", process.env.GEMINI_API_KEY_1 ? `"${process.env.GEMINI_API_KEY_1}" (length: ${process.env.GEMINI_API_KEY_1.length})` : 'undefined/empty');
  console.log("  process.env.GEMINI_API_KEY_2:", process.env.GEMINI_API_KEY_2 ? `"${process.env.GEMINI_API_KEY_2}" (length: ${process.env.GEMINI_API_KEY_2.length})` : 'undefined/empty');
  console.log("  process.env.GEMINI_API_KEY_3:", process.env.GEMINI_API_KEY_3 ? `"${process.env.GEMINI_API_KEY_3}" (length: ${process.env.GEMINI_API_KEY_3.length})` : 'undefined/empty');
  // You can also log the entire process.env object, but be cautious with sensitive data in production logs.
  // console.log("DEBUG: Full process.env object:", process.env);
  console.log("--- END TEMPORARY DEBUGGING ---");

  const { courseId, ...formData } = await req.json();
  const user = await currentUser();

  // Basic validation for user existence
  if (!user || !user.primaryEmailAddress?.emailAddress) {
    console.error("Course layout generation failed: User not authenticated or email missing.");
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let courseJson;
  let bannerImageUrl = '';

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
      // Use the existing getGeminiResponse for text generation
      geminiResult = await getGeminiResponse(contents); 
    } catch (geminiErr) {
      console.error("Gemini API call (text generation) failed:", geminiErr.message);
      if (geminiErr.response) {
        console.error("Gemini API response data:", geminiErr.response.data);
        console.error("Gemini API response status:", geminiErr.response.status);
      }
      return NextResponse.json({ error: "Failed to get course layout from AI." }, { status: 500 });
    }

    const rawText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) {
      console.error("Empty or malformed Gemini response received for text generation.");
      return NextResponse.json({ error: "AI generated an empty or invalid course layout." }, { status: 500 });
    }

    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      courseJson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response JSON:", parseErr.message);
      console.error("Raw Gemini text:", rawText);
      return NextResponse.json({ error: "AI generated unparseable course layout." }, { status: 500 });
    }

    // --- Step 2: Generate Banner Image with Google Imagen ---
    // The key rotation is now handled within getGeminiImageResponse,
    // so we only need to ensure the GEMINI_API_KEYS env var is set for geminiClient.js
    if (!process.env.GEMINI_API_KEY_1 && !process.env.GEMINI_API_KEY_2 && !process.env.GEMINI_API_KEY_3) {
      console.error("No GEMINI_API_KEY_1, _2, or _3 environment variables are set. Cannot generate image.");
      return NextResponse.json({ error: "Image generation API keys are missing." }, { status: 500 });
    }

    try {
      // Call the new getGeminiImageResponse function
      bannerImageUrl = await getGeminiImageResponse(courseJson?.course?.bannerImagePrompt);
      if (!bannerImageUrl) {
        console.warn("Image generation returned an empty URL. Proceeding without banner image.");
      }
    } catch (imageErr) {
      console.error("Image generation failed:", imageErr.message);
      // The error structure might vary based on how getGeminiImageResponse throws it
      bannerImageUrl = ''; // Ensure it's an empty string if generation fails
    }

    // --- Step 3: Insert into Database ---
    await db.insert(coursesTable).values({
      ...formData,
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
