import { generateResponseWithMetrics } from "../lib/generate-response";
import { convexClient } from "../lib/convex-client";
import { api } from "../convex/_generated/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messages = [
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const result = await generateResponseWithMetrics(messages);

    // Log the query to Convex for dashboard tracking
    const queryId = `test-${Date.now()}`;
    try {
      await convexClient.mutation(api.dashboard.logQuery, {
        queryId,
        userId: "test-dashboard",
        userName: "Dashboard Tester",
        channelId: "test-channel",
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        model: result.model,
        tools: result.toolsUsed,
        responseTimeMs: result.responseTimeMs,
        messageContent: message,
      });
    } catch (logError) {
      console.error("Failed to log query:", logError);
      // Continue even if logging fails
    }

    return new Response(
      JSON.stringify({
        response: result.text,
        responseTimeMs: result.responseTimeMs,
        usage: result.usage,
        toolsUsed: result.toolsUsed,
        model: result.model,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in test-bot:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}
