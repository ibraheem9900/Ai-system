import { Conversation } from '../types/chat';
import { Plus, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => {
            onNewChat();
            setIsOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:shadow-blue-500/50"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                currentConversationId === conv.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-sm">{conv.title}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all duration-200 shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div className="hidden lg:block w-64 h-screen border-r border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
        {sidebarContent}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-40 lg:hidden animate-slide-in-right">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
