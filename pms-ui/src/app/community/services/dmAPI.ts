// app/community/services/dmAPI.ts
import Cookies from 'js-cookie';
import { ConversationRead, ConversationCreate } from '@/app/community/types/conversation'; // Adjust path
import { MessageRead, MessageCreate } from '@/app/community/types/message'; // Adjust path

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Define endpoint base - adjust if needed
const DM_ENDPOINT = "/direct-messages";

/**
 * Finds an existing conversation or creates a new one with a recipient.
 * Requires authentication. userId is the initiator.
 */
export const findOrCreateConversationAPI = async (recipientId: string, userId: string): Promise<ConversationRead> => {
  if (!userId || !recipientId) {
    throw new Error("User ID and Recipient ID are required.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const payload: ConversationCreate = { recipient_id: recipientId };

  // Adjust URL based on how userId is passed (path param, body, or inferred from token)
  const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${userId}`; // Example: userId in path
  // const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations`; // If userId inferred or in body

  console.log(`Finding/Creating conversation at: ${url} with recipient: ${recipientId}`); // Debug

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = `Failed to find/create conversation (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("findOrCreateConversationAPI error:", errorDetail);
    const error = new Error(errorDetail); 
    // (error as any).status = response.status; 
    throw error;
  }

  const conversation: ConversationRead = await response.json();
  console.log("Found/Created conversation:", conversation._id); // Debug
  return conversation;
};

/**
 * Fetches the list of conversations for the current user.
 * Requires authentication.
 */
export const getMyConversationsAPI = async (userId: string, skip: number = 0, limit: number = 20): Promise<ConversationRead[]> => {
   if (!userId) {
    throw new Error("User ID is required to fetch conversations.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Adjust URL based on how userId is passed
  const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${userId}?skip=${skip}&limit=${limit}`; // Example
  // const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations?skip=${skip}&limit=${limit}`; // If inferred

  console.log(`Fetching conversations from: ${url}`); // Debug

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    cache: 'no-store', // Conversations list should likely be fresh
  });

   if (!response.ok) {
    let errorDetail = `Failed to fetch conversations (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("getMyConversationsAPI error:", errorDetail);
    const error = new Error(errorDetail);  throw error;
  }

  const conversations: ConversationRead[] = await response.json();
  console.log(`Fetched ${conversations.length} conversations.`); // Debug
  return conversations;
};

/**
 * Fetches messages for a specific conversation.
 * Requires authentication and user participation.
 */
export const getMessagesForConversationAPI = async (conversationId: string, userId: string, skip: number = 0, limit: number = 50): Promise<MessageRead[]> => {
  if (!conversationId || !userId) {
    throw new Error("Conversation ID and User ID are required.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Adjust URL based on how userId is passed (for validation on backend)
  const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${conversationId}/messages/${userId}?skip=${skip}&limit=${limit}`; // Example
  // const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${conversationId}/messages?skip=${skip}&limit=${limit}`; // If inferred

  console.log(`Fetching messages from: ${url}`); // Debug

  const response = await fetch(url, {
    method: 'GET',
    headers: headers,
    cache: 'no-store', // Messages should be fresh
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch messages (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("getMessagesForConversationAPI error:", errorDetail);
    const error = new Error(errorDetail);throw error;
  }

  const messages: MessageRead[] = await response.json();
  console.log(`Fetched ${messages.length} messages for conversation ${conversationId}.`); // Debug
  return messages;
};

/**
 * Sends a message in a specific conversation.
 * Requires authentication and user participation.
 */
export const sendMessageAPI = async (conversationId: string, messageData: MessageCreate, userId: string): Promise<MessageRead> => {
  if (!conversationId || !userId) {
    throw new Error("Conversation ID and User ID are required.");
  }
   if (!messageData.content || !messageData.content.trim()) {
      throw new Error("Message content cannot be empty.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Adjust URL based on how userId is passed
  const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${conversationId}/messages/${userId}`; // Example
  // const url = `${API_BASE_URL}${DM_ENDPOINT}/conversations/${conversationId}/messages`; // If inferred

  console.log(`Sending message to: ${url}`); // Debug

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    let errorDetail = `Failed to send message (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch{ /* Ignore */ }
    console.error("sendMessageAPI error:", errorDetail);
    const error = new Error(errorDetail); throw error;
  }

  // Backend should return the newly created message object
  const sentMessage: MessageRead = await response.json();
  console.log("Message sent successfully:", sentMessage.id); // Debug
  return sentMessage;
};

/**
 * Fetches a conversation by its ID.
 * Requires authentication.
 */
export const getConversationByIdAPI = async (conversationId: string, userId: string): Promise<ConversationRead> => {
    const response = await fetch(`${API_BASE_URL}${DM_ENDPOINT}/conversations/${conversationId}/${userId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch conversation details');
    }

    return await response.json();
};

/**
 * Sends a system message to a user.
 * Requires admin authentication.
 */
export const sendSystemMessageAPI = async (targetUserId: string, messageData: MessageCreate, adminUserId: string): Promise<MessageRead> => {
  if (!targetUserId || !adminUserId) {
    throw new Error("Target User ID and Admin User ID are required.");
  }
  const token = Cookies.get('access_token');
  if (!token) {
    throw new Error('Authentication required.');
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const url = `${API_BASE_URL}${DM_ENDPOINT}/system-message/${targetUserId}/${adminUserId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    let errorDetail = `Failed to send system message (Status: ${response.status})`;
    try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch { /* Ignore */ }
    console.error("sendSystemMessageAPI error:", errorDetail);
    throw new Error(errorDetail);
  }

  const sentMessage: MessageRead = await response.json();
  console.log("System message sent successfully:", sentMessage.id);
  return sentMessage;
};