import { useState, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !disabled) {
        onSend(input.trim());
        setInput('');
      }
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800/60 glass p-4 sm:p-5">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 hover:border-gray-600 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none overflow-hidden"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
          </div>

          {/* Voice button */}
          <button
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-90 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-voice-pulse'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700'
            }`}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="btn-primary flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 mt-2 px-1 animate-fade-in">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">Listening... speak now</span>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-2 text-center">
          Ita AI · AI-powered search with real-time data
        </p>
      </div>
    </form>
  );
}
