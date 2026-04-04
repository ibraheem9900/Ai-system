import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import { User, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const APP_LOGO = '/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png';

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 animate-slide-up ${
      isUser ? 'bg-gray-900/40' : 'bg-gradient-to-r from-gray-900/60 to-blue-950/20'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden ${
        isUser ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gradient-to-br from-slate-800 to-gray-800 border border-gray-700'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <img src={APP_LOGO} alt="ITA AI" className="w-5 h-5" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${
          isUser ? 'text-blue-400' : 'text-cyan-400'
        }`}>
          {isUser ? 'You' : 'ITA AI'}
        </p>

        {isUser ? (
          <div className="text-gray-100 leading-relaxed text-sm sm:text-base break-words">
            {message.content}
          </div>
        ) : (
          <div className="markdown-body text-sm sm:text-base break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sources</p>
            <div className="space-y-2">
              {message.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 bg-gray-800/40 hover:bg-gray-800/70 rounded-xl border border-gray-700/50 hover:border-blue-500/40 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cyan-400 group-hover:text-cyan-300 transition truncate">
                      {source.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {source.snippet}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5 group-hover:text-cyan-400 transition" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
