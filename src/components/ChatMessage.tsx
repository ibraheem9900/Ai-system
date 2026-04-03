import { Message } from '../types/chat';
import { User, Sparkles, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 animate-slide-up ${isUser ? 'bg-gray-900/50' : 'bg-gradient-to-r from-gray-900 to-blue-950/30'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'}`}>
        {isUser ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">Sources:</p>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 sm:p-4 bg-gray-800/50 hover:bg-gray-750 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 group hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition truncate">
                        {source.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {source.snippet}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 group-hover:text-cyan-400 transition" />
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
