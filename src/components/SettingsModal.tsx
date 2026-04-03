import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  userName,
  onUserNameChange,
}: SettingsModalProps) {
  const [tempName, setTempName] = useState(userName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTempName(userName);
  }, [userName, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUserNameChange(tempName.trim() || 'User');
      localStorage.setItem('userName', tempName.trim() || 'User');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800 animate-slide-up">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="mt-2 text-xs text-gray-500">
                This name will be displayed in greetings and the navbar
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
