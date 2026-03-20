import { Sparkles } from 'lucide-react';

export default function LoadingMessage() {
  return (
    <div className="flex gap-4 p-6 bg-gray-950">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-purple-600">
        <Sparkles className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-400">Searching and analyzing...</span>
        </div>
      </div>
    </div>
  );
}
