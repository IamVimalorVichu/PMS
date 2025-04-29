// app/community/types/conversation.ts

// Assuming UserBasicInfo is defined elsewhere (e.g., post.ts or global types)
import { UserBasicInfo } from './auth'; // Adjust path as needed
import { Message } from './message';

// Matches the backend ConversationRead schema
export interface Conversation {
  _id: string; // or id
  participant_ids: string[];
  created_at: string; // ISO date string
  last_message_at?: string | null; // ISO date string or null
  last_message_preview?: string | null;
  // Populated field (not directly in DB this way)
  participants?: UserBasicInfo[];
  last_message?: Message[]
}

// Specific type for reading, ensuring participants are included if populated
export interface ConversationRead extends Conversation {
   participants?: UserBasicInfo[];
}

// Matches the backend ConversationCreate schema (input for starting convo)
export interface ConversationCreate {
  recipient_id: string;
}