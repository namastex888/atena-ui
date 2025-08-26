import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  return NextResponse.json({
    message: "API is working",
    env: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || "missing"
    }
  });
};