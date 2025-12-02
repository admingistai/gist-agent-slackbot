import {
  SlackEvent,
  AppMentionEvent,
  AssistantThreadStartedEvent,
  GenericMessageEvent,
} from "../lib/types";
import {
  assistantThreadMessage,
  handleNewAssistantMessage,
} from "../lib/handle-messages";
import { waitUntil } from "@vercel/functions";
import { handleNewAppMention } from "../lib/handle-app-mention";
import { handleReactionAdded, ReactionAddedEvent } from "../lib/handle-reaction";
import { verifyRequest, getBotId } from "../lib/slack-utils";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const payload = JSON.parse(rawBody);
  const requestType = payload.type as "url_verification" | "event_callback";

  // See https://api.slack.com/events/url_verification
  if (requestType === "url_verification") {
    return new Response(payload.challenge, { status: 200 });
  }

  await verifyRequest({ requestType, request, rawBody });

  try {
    console.log("📥 Received Slack event:", payload.event?.type, "| Full payload keys:", Object.keys(payload));
    if (payload.event) {
      console.log("📋 Event details:", JSON.stringify({
        type: payload.event.type,
        subtype: payload.event.subtype,
        user: payload.event.user,
        channel: payload.event.channel || payload.event.item?.channel,
      }, null, 2));
    }
    const botUserId = await getBotId();

    const event = payload.event as SlackEvent;

    if (event.type === "app_mention") {
      waitUntil(handleNewAppMention(event as AppMentionEvent, botUserId));
    }

    if (event.type === "assistant_thread_started") {
      waitUntil(assistantThreadMessage(event as AssistantThreadStartedEvent));
    }

    if (
      event.type === "message" &&
      !event.subtype &&
      event.channel_type === "im" &&
      !event.bot_id &&
      !event.bot_profile &&
      event.bot_id !== botUserId
    ) {
      waitUntil(handleNewAssistantMessage(event as GenericMessageEvent, botUserId));
    }

    if (event.type === "reaction_added") {
      console.log("🎯 Received reaction_added event:", JSON.stringify(event, null, 2));
      waitUntil(handleReactionAdded(event as ReactionAddedEvent, botUserId));
    }

    return new Response("Success!", { status: 200 });
  } catch (error) {
    console.error("Error generating response", error);
    return new Response("Error generating response", { status: 500 });
  }
}
