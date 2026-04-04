import { useState, useEffect } from 'react';
import { X, User, Brain } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  personality: string;
  onPersonalityChange: (p: string) => void;
}

const PERSONALITIES = [
  { value: 'general',   label: 'General',               desc: 'Balanced, helpful responses for any topic' },
  { value: 'education', label: '📚 Education',           desc: 'Patient explanations, step-by-step teaching style' },
  { value: 'tech',      label: '⚙️ Technology',          desc: 'Technical, precise, code-focused answers' },
  { value: 'business',  label: '💼 Business',            desc: 'Professional, strategic and data-driven insights' },
  { value: 'emotional', label: '💙 Emotional & Empathetic', desc: 'Warm, caring and supportive responses' },
];

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  onUserNameChange,
  personality,
  onPersonalityChange,
}: SettingsModalProps) {
  const [tempName, setTempName] = useState(userName);
  const [tempPersonality, setTempPersonality] = useState(personality);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTempName(userName);
    setTempPersonality(personality);
  }, [userName, personality, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUserNameChange(tempName.trim() || 'User');
      onPersonalityChange(tempPersonality);
      localStorage.setItem('userName', tempName.trim() || 'User');
      localStorage.setItem('aiPersonality', tempPersonality);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 300);
    } catch {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/60">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 text-gray-400 hover:text-white active:scale-90">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <User className="w-4 h-4 text-blue-400" />
                Your Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs text-gray-600">Used in greetings and the navbar</p>
            </div>

            {/* Personality */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <Brain className="w-4 h-4 text-cyan-400" />
                AI Personality
              </label>
              <select
                value={tempPersonality}
                onChange={(e) => setTempPersonality(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {PERSONALITIES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-gray-900">
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-600">
                {PERSONALITIES.find((p) => p.value === tempPersonality)?.desc}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-800/60">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 font-medium active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
