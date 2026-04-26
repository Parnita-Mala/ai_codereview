import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60; // Set timeout to 60 seconds (requires Vercel Pro/Enterprise)

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are a Senior Software Engineer acting as a rigorous Code Review AI.
Your task is to review the provided code and return a strict JSON object. No markdown formatting around the JSON, just the JSON string, so it can be parsed directly via JSON.parse().
The JSON must follow this exact structure:
{
  "score": <number between 0 and 100 representing code quality>,
  "bugs": [
    { "line": "<approximate line snippet or number>", "description": "<bug description>" }
  ],
  "fixes": [
    { "description": "<fix description>", "code": "<the corrected code snippet or function>" }
  ],
  "docs": "<comprehensive markdown documentation for the code>"
}
If there are no bugs, leave the bugs array empty.`;

function getRawGithubUrl(url: string) {
  let rawUrl = url.replace("github.com", "raw.githubusercontent.com");
  rawUrl = rawUrl.replace("/blob/", "/");
  return rawUrl;
}

export async function POST(req: Request) {
  try {
    const { code, githubUrl } = await req.json();

    let codeToReview = code;

    if (githubUrl) {
      const rawUrl = getRawGithubUrl(githubUrl);
      const res = await fetch(rawUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch code from GitHub URL. Ensure it is a public file." },
          { status: 400 }
        );
      }
      codeToReview = await res.text();
    }

    if (!codeToReview?.trim()) {
      return NextResponse.json(
        { error: "No code provided for review" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("CRITICAL: OPENROUTER_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "OpenRouter API Key is not configured. Please add it to your environment variables." },
        { status: 500 }
      );
    }

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please review the following code:\n\n${codeToReview}` },
        ],
        temperature: 0.1,
      });

      const responseContent = chatCompletion.choices[0]?.message?.content || "";
      
      let parsedData;
      try {
        const cleaned = responseContent.replace(/```json/g, "").replace(/```/g, "").trim();
        parsedData = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse JSON from AI:", responseContent);
        return NextResponse.json(
          { error: "AI response was not valid JSON. The model might be overloaded.", raw: responseContent },
          { status: 500 }
        );
      }

      return NextResponse.json({ ...parsedData, originalCode: codeToReview });

    } catch (apiError: any) {
      console.error("OpenRouter API Error:", apiError);
      return NextResponse.json(
        { 
          error: "Failed to connect to AI Service. The model may be offline or the API key is invalid.", 
          details: apiError.message 
        },
        { status: 502 } // Bad Gateway
      );
    }

  } catch (error: any) {
    console.error("General Review error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
