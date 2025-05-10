export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isComplete?: boolean;
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
}