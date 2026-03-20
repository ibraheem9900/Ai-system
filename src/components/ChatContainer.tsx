import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../types/chat';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingMessage from './LoadingMessage';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export default function ChatContainer() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const createConversation = async (firstMessage: string): Promise<string> => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user!.id,
        title,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create conversation');
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversationId(data.id);
    return data.id;
  };

  const handleSendMessage = async (content: string) => {
    setLoading(true);

    try {
      let conversationId = currentConversationId;

      if (!conversationId) {
        conversationId = await createConversation(content);
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const { error: userMessageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content,
      });

      if (userMessageError) throw userMessageError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-search`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content, conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const { error: assistantMessageError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: data.response,
        sources: data.sources,
      });

      if (assistantMessageError) throw assistantMessageError;

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversation_id: currentConversationId || '',
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  return (
    <div className="h-screen flex bg-gray-950">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col">
        {messages.length === 0 && !loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                AI Search Assistant
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Ask me anything and I'll search the web to give you accurate, up-to-date answers with sources.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
                  <p className="text-gray-300">What are the latest AI trends in 2026?</p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
                  <p className="text-gray-300">Explain quantum computing simply</p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
                  <p className="text-gray-300">Best practices for React performance</p>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-left">
                  <p className="text-gray-300">Latest developments in space exploration</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {loading && <LoadingMessage />}
            <div ref={messagesEndRef} />
          </div>
        )}

        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
