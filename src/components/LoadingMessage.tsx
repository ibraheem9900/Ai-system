import { Sparkles } from 'lucide-react';

export default function LoadingMessage() {
  return (
    <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-gray-900 to-blue-950/30 animate-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-400">Searching and analyzing...</span>
        </div>
      </div>
    </div>
  );
}
