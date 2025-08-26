import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Default adapter using GPT-5 for chat
const defaultAdapter = new OpenAIAdapter({ 
  openai,
  model: "gpt-5"
});

// Suggestions adapter using GPT-4.1-mini for fast responses
const suggestionsAdapter = new OpenAIAdapter({ 
  openai,
  model: "gpt-4.1-mini",
  // Optimize for speed
  disableParallelToolCalls: true
});

// Create the CopilotRuntime with middleware to log requests
const runtime = new CopilotRuntime({
  middleware: {
    onBeforeRequest: async ({ inputMessages }) => {
      // Log what type of request this is
      const lastMessage = inputMessages[inputMessages.length - 1];
      if (lastMessage?.content?.includes("sugestões")) {
        console.log("Generating suggestions with gpt-5-mini");
      } else {
        console.log("Processing chat with gpt-5");
      }
    }
  }
});

// Build a Next.js API route that handles the CopilotKit runtime requests
export const POST = async (req: NextRequest) => {
  try {
    // Use gpt-4.1 for full capabilities
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter: new OpenAIAdapter({ 
        openai,
        model: "gpt-4.1" // Full model for everything
      }),
      endpoint: "/api/copilotkit",
    });
    
    return await handleRequest(req);
  } catch (error) {
    console.error("CopilotKit API error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
};