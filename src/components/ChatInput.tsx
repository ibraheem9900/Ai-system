import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800 bg-gradient-to-t from-gray-950 to-transparent p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="Ask anything..."
            className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 sm:pr-14 bg-gray-800 border border-gray-700 hover:border-gray-600 focus:border-blue-500 rounded-xl sm:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="absolute right-2 sm:right-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg sm:rounded-xl text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
          AI-powered search with real-time data
        </p>
      </div>
    </form>
  );
}
