import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../types/chat';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingMessage from './LoadingMessage';
import Navbar from './Navbar';
import SettingsModal from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';

export default function ChatContainer() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [subtextIndex, setSubtextIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greetings = [
    'Hello',
    'Welcome back',
    'Hi there',
    'Good to see you',
    'Hey',
  ];

  const subtexts = [
    "I'm happy to help",
    'Ask me anything',
    'How can I assist you today?',
    'Let me search the web for you',
  ];

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '';
    setUserName(savedName);
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    setGreetingText(randomGreeting);
  }, []);

  useEffect(() => {
    const subtextTimer = setInterval(() => {
      setSubtextIndex((prev) => (prev + 1) % subtexts.length);
    }, 4000);
    return () => clearInterval(subtextTimer);
  }, []);

  const getDisplayName = () => {
    if (userName) return userName;
    if (user?.email) {
      return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
    }
    return 'User';
  };

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
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content, conversationId }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);

      if (data.error) {
        throw new Error(data.error);
      }

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error sending message:', errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversation_id: currentConversationId || '',
          role: 'assistant',
          content: `Error: ${errorMessage}. Please make sure your API keys are configured correctly in your Supabase edge function secrets (GROQ_API_KEY and SERP_API_KEY).`,
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
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex flex-col">
        <Navbar userName={getDisplayName()} onSettingsClick={() => setSettingsOpen(true)} />

        {messages.length === 0 && !loading ? (
          <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className="text-center max-w-2xl w-full animate-slide-down">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/30">
                <img
                  src="/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png"
                  alt="SearchAI"
                  className="w-12 h-12"
                />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                {greetingText}, {getDisplayName()}
              </h2>
              <p className="text-gray-400 text-lg mb-8 h-6 transition-opacity duration-300">
                {subtexts[subtextIndex]}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  'What are the latest AI trends in 2026?',
                  'Explain quantum computing simply',
                  'Best practices for React performance',
                  'Latest developments in space exploration',
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(example)}
                    className="p-4 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 group"
                  >
                    <p className="text-gray-300 group-hover:text-white transition">{example}</p>
                  </button>
                ))}
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

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={userName}
        onUserNameChange={setUserName}
      />
    </div>
  );
}
