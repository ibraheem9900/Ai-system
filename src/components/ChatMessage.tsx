import { Message } from '../types/chat';
import { User, Sparkles, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-gray-900' : 'bg-gray-950'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-purple-600'}`}>
        {isUser ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-gray-100 whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-400">Sources:</p>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-gray-600 transition group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition truncate">
                        {source.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {source.snippet}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
