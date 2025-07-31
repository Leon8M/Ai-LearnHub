import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { getGeminiResponse } from '@/lib/geminiClient';
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
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

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  const { courseId, ...formData } = await req.json();
  const user = await currentUser();

  try {
    const contents = [
      {
        role: "user",
        parts: [{ text: PROMPT + JSON.stringify(formData) }],
      },
    ];

    const result = await getGeminiResponse(contents);

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) throw new Error("Empty Gemini response");

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const courseJson = JSON.parse(cleaned);

    const bannerImageUrl = await generateImage(courseJson?.course?.bannerImagePrompt);

    await db.insert(coursesTable).values({
      ...formData,
      courseJson: JSON.stringify(courseJson),
      userEmail: user?.primaryEmailAddress?.emailAddress,
      cid: courseId,
      bannerImageUrl,
    });

    return NextResponse.json({ courseId });
  } catch (err) {
    console.error("Course layout generation failed:", err.message);
    return NextResponse.json({ error: "Failed to generate course layout." }, { status: 500 });
  }
}

async function generateImage(imagePrompt) {
  const BASE_URL = 'https://aigurulab.tech';
  const response = await axios.post(BASE_URL + '/api/generate-image', {
    width: 1024,
    height: 1024,
    input: imagePrompt,
    model: 'flux',
    aspectRatio: "16:9"
  }, {
    headers: {
      'x-api-key': process.env.AI_GURU_LAB_API,
      'Content-Type': 'application/json',
    },
  });
  return response.data.image;
}
