// app/community/types/message.ts

// Assuming UserBasicInfo is defined elsewhere
import { UserBasicInfo } from './auth'; // Adjust path as needed

// Matches the backend MessageRead schema
export interface Message {
  id: string; // or _id
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string; // ISO date string
  // Populated field
  sender?: UserBasicInfo;
}

// Specific type for reading, ensuring sender is included if populated
export interface MessageRead extends Message {
    sender?: UserBasicInfo;
}

// Matches the backend MessageCreate schema (input for sending message)
export interface MessageCreate {
  content: string;
}