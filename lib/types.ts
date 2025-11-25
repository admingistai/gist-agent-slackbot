export interface AppMentionEvent {
  type: 'app_mention';
  user: string;
  text: string;
  ts: string;
  channel: string;
  event_ts: string;
  thread_ts?: string;
  bot_id?: string;
  bot_profile?: any;
}

export interface AssistantThreadStartedEvent {
  type: 'assistant_thread_started';
  assistant_thread: {
    channel_id: string;
    thread_ts: string;
  };
  event_ts: string;
}

export interface GenericMessageEvent {
  type: 'message';
  subtype?: string;
  text?: string;
  user: string;
  ts: string;
  thread_ts?: string;
  channel: string;
  channel_type?: string;
  bot_id?: string;
  bot_profile?: any;
}

export type SlackEvent = 
  | AppMentionEvent 
  | AssistantThreadStartedEvent 
  | GenericMessageEvent 
  | { type: string; subtype?: string; channel_type?: string; bot_id?: string; bot_profile?: any; [key: string]: any };