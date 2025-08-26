import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// Create the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the CopilotRuntime
const runtime = new CopilotRuntime();

// Build a Next.js API route that handles the CopilotKit runtime requests
export const POST = async (req: NextRequest) => {
  try {
    console.log('[CopilotKit API] Received request');
    console.log('[CopilotKit API] API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('[CopilotKit API] Headers:', Object.fromEntries(req.headers.entries()));
    
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: new OpenAIAdapter({ 
        openai,
        model: "gpt-4o-mini" // Use a valid model name
      }),
      endpoint: "/api/copilotkit",
    });
    
    const response = await handleRequest(req);
    console.log('[CopilotKit API] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[CopilotKit API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }, 
      { 
        status: 500
      }
    );
  }
};

// Handle OPTIONS for CORS preflight
export const OPTIONS = async (req: NextRequest) => {
  return new NextResponse(null, { status: 200 });
};