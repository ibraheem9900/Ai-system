export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SearchSource[];
  created_at: string;
}

export interface SearchSource {
  title: string;
  link: string;
  snippet: string;
}
