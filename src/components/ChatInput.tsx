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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const submit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart  = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + t : t));
    };
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => setIsListening(false);
    recognition.start();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-800/50 glass p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Ask anything..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700/70 hover:border-gray-600 focus:border-blue-500 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm resize-none"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
          </div>

          <button
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            title={isListening ? 'Stop' : 'Voice input'}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-90 ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-voice-pulse'
                : 'bg-gray-800/70 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700/70'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="btn-primary flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 mt-2 px-1 animate-fade-in">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">Listening… speak now</span>
          </div>
        )}
      </div>
    </form>
  );
}
